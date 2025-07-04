# OpenTelemetry Implementation Guide for ECS Performance Check App

## Overview
This guide provides complete implementation details for adding OpenTelemetry distributed tracing to the ECS Performance Check App.

## 1. OpenTelemetry Collector Configuration

Create `infrastructure/docker/otel-collector-config.yaml`:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
    spike_limit_mib: 128
  attributes:
    actions:
      - key: environment
        value: development
        action: insert

exporters:
  debug:
    verbosity: detailed
  
  # For production, use AWS X-Ray
  awsxray:
    region: us-east-1
    no_verify_ssl: false
    local_mode: false
  
  # For CloudWatch metrics
  awsemf:
    region: us-east-1
    namespace: ECSPerformanceApp
    dimension_rollup_option: NoDimensionRollup

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, attributes]
      exporters: [debug, awsxray]
    
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [debug, awsemf]
```

## 2. Updated Docker Compose

Add to `infrastructure/docker/docker-compose.yml`:

```yaml
  # OpenTelemetry Collector
  otel-collector:
    container_name: ecs-performance-otel-collector
    image: otel/opentelemetry-collector-contrib:latest
    ports:
      - "4317:4317"  # OTLP gRPC
      - "4318:4318"  # OTLP HTTP
      - "8888:8888"  # Prometheus metrics
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    command: ["--config=/etc/otel-collector-config.yaml"]
    networks:
      - ecs-performance-network
    environment:
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_SESSION_TOKEN=${AWS_SESSION_TOKEN}
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:13133/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Jaeger for local trace visualization (development only)
  jaeger:
    container_name: ecs-performance-jaeger
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # Jaeger UI
      - "14268:14268"  # Jaeger collector
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    networks:
      - ecs-performance-network
```

Update existing services to include OpenTelemetry environment variables:

```yaml
  nextjs:
    environment:
      # ... existing env vars ...
      - OTEL_SERVICE_NAME=ecs-performance-nextjs
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
      - OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
      - OTEL_TRACES_EXPORTER=otlp
      - NODE_OPTIONS=--require ./instrumentation.node.js

  backend:
    environment:
      # ... existing env vars ...
      - OTEL_SERVICE_NAME=ecs-performance-backend
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
      - OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
      - OTEL_TRACES_EXPORTER=otlp
```

## 3. Next.js Instrumentation

### Install Dependencies

```bash
cd apps/frontend
npm install @opentelemetry/api \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation-http \
  @opentelemetry/instrumentation-fetch \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions
```

### Create `apps/frontend/instrumentation.node.ts`:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'ecs-performance-nextjs',
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
});

const traceExporter = new OTLPTraceExporter({
  url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
  headers: {},
});

const sdk = new NodeSDK({
  resource,
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable to reduce noise
      },
    }),
  ],
});

sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OpenTelemetry terminated successfully'))
    .catch((error) => console.error('Error terminating OpenTelemetry', error))
    .finally(() => process.exit(0));
});
```

### Create `apps/frontend/instrumentation.ts` (Client-side):

```typescript
import { registerOTel } from '@vercel/otel';
import { trace, context } from '@opentelemetry/api';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    registerOTel({
      serviceName: 'ecs-performance-nextjs',
    });
  }
}

// Helper function for custom spans
export function createSpan(name: string, fn: () => Promise<any>) {
  const tracer = trace.getTracer('ecs-performance-nextjs');
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: 1 }); // OK
      return result;
    } catch (error) {
      span.setStatus({ code: 2, message: error.message }); // ERROR
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Update `apps/frontend/next.config.ts`:

```typescript
const nextConfig = {
  // ... existing config ...
  experimental: {
    instrumentationHook: true,
  },
};
```

## 4. Hono Backend Instrumentation

### Install Dependencies

```bash
cd apps/backend
npm install @opentelemetry/api \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation-http \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions
```

### Create `apps/backend/src/instrumentation.ts`:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'ecs-performance-backend',
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
});

const traceExporter = new OTLPTraceExporter({
  url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
});

const sdk = new NodeSDK({
  resource,
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();

// Export tracer for custom spans
export const tracer = trace.getTracer('ecs-performance-backend');

// Hono middleware for tracing
export function honoTracing() {
  return async (c: any, next: any) => {
    const span = tracer.startSpan(`${c.req.method} ${c.req.path}`, {
      kind: SpanKind.SERVER,
      attributes: {
        'http.method': c.req.method,
        'http.url': c.req.url,
        'http.target': c.req.path,
        'http.host': c.req.header('host'),
        'http.scheme': 'http',
        'http.user_agent': c.req.header('user-agent'),
      },
    });

    // Extract trace context from incoming request
    const traceParent = c.req.header('traceparent');
    if (traceParent) {
      span.setAttribute('trace.parent', traceParent);
    }

    return context.with(trace.setSpan(context.active(), span), async () => {
      try {
        await next();
        
        span.setAttributes({
          'http.status_code': c.res.status,
        });
        
        if (c.res.status >= 400) {
          span.setStatus({ code: SpanStatusCode.ERROR });
        } else {
          span.setStatus({ code: SpanStatusCode.OK });
        }
      } catch (error) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        throw error;
      } finally {
        span.end();
      }
    });
  };
}

// Helper for database operations
export function traceDatabase<T>(
  operation: string,
  query: string,
  fn: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(`db.${operation}`, async (span) => {
    span.setAttributes({
      'db.system': 'postgresql',
      'db.operation': operation,
      'db.statement': query.substring(0, 100), // Truncate for security
    });

    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Update `apps/backend/src/index.ts`:

```typescript
import './instrumentation'; // Must be first import
import { Hono } from 'hono';
import { honoTracing } from './instrumentation';

const app = new Hono();

// Add tracing middleware
app.use('*', honoTracing());

// Your existing routes...
```

## 5. Trace Propagation Example

### Frontend API Client with Trace Context

Create `apps/frontend/lib/traced-fetch.ts`:

```typescript
import { trace, context, SpanKind } from '@opentelemetry/api';

export async function tracedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const tracer = trace.getTracer('ecs-performance-nextjs');
  
  return tracer.startActiveSpan(
    `HTTP ${options.method || 'GET'} ${url}`,
    {
      kind: SpanKind.CLIENT,
      attributes: {
        'http.method': options.method || 'GET',
        'http.url': url,
      },
    },
    async (span) => {
      // Inject trace context into headers
      const activeSpan = trace.getActiveSpan();
      const traceHeaders: Record<string, string> = {};
      
      if (activeSpan) {
        const spanContext = activeSpan.spanContext();
        // W3C Trace Context format
        traceHeaders['traceparent'] = `00-${spanContext.traceId}-${spanContext.spanId}-01`;
      }

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            ...traceHeaders,
          },
        });

        span.setAttributes({
          'http.status_code': response.status,
          'http.response_content_length': response.headers.get('content-length') || '0',
        });

        if (!response.ok) {
          span.setStatus({ code: 2, message: `HTTP ${response.status}` });
        }

        return response;
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: 2, message: error.message });
        throw error;
      } finally {
        span.end();
      }
    }
  );
}
```

### Usage in Components

```typescript
// apps/frontend/app/features/data-fetching/_shared/api-client.ts
import { tracedFetch } from '@/lib/traced-fetch';
import { createSpan } from '@/instrumentation';

export async function fetchPosts() {
  return createSpan('fetchPosts', async () => {
    const response = await tracedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  });
}

// Cache operations with custom attributes
export async function getCachedData(key: string) {
  const tracer = trace.getTracer('ecs-performance-nextjs');
  return tracer.startActiveSpan('cache.get', async (span) => {
    span.setAttributes({
      'cache.key': key,
      'cache.operation': 'get',
    });

    const hit = await cache.get(key);
    
    span.setAttributes({
      'cache.hit': !!hit,
    });

    span.end();
    return hit;
  });
}
```

## 6. ECS Task Definition Update

For production ECS deployment, add the OpenTelemetry collector as a sidecar:

```json
{
  "family": "ecs-performance-app",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "otel-collector",
      "image": "public.ecr.aws/aws-observability/aws-otel-collector:latest",
      "cpu": 256,
      "memory": 512,
      "essential": false,
      "command": ["--config=/etc/ecs/ecs-default-config.yaml"],
      "environment": [
        {
          "name": "AWS_REGION",
          "value": "us-east-1"
        }
      ],
      "healthCheck": {
        "command": ["CMD", "/healthcheck"],
        "interval": 5,
        "timeout": 6,
        "retries": 5,
        "startPeriod": 1
      },
      "portMappings": [
        {
          "containerPort": 4317,
          "protocol": "tcp"
        },
        {
          "containerPort": 4318,
          "protocol": "tcp"
        }
      ]
    },
    {
      "name": "nextjs",
      "dependsOn": [
        {
          "containerName": "otel-collector",
          "condition": "HEALTHY"
        }
      ],
      "environment": [
        {
          "name": "OTEL_SERVICE_NAME",
          "value": "ecs-performance-nextjs"
        },
        {
          "name": "OTEL_EXPORTER_OTLP_ENDPOINT",
          "value": "http://localhost:4318"
        }
      ]
      // ... rest of container definition
    },
    {
      "name": "backend",
      "dependsOn": [
        {
          "containerName": "otel-collector",
          "condition": "HEALTHY"
        }
      ],
      "environment": [
        {
          "name": "OTEL_SERVICE_NAME",
          "value": "ecs-performance-backend"
        },
        {
          "name": "OTEL_EXPORTER_OTLP_ENDPOINT",
          "value": "http://localhost:4318"
        }
      ]
      // ... rest of container definition
    }
  ]
}
```

## 7. Monitoring and Visualization

### Local Development
- Access Jaeger UI at http://localhost:16686
- View traces across all services
- Analyze latency breakdown

### Production (AWS)
- Traces are sent to AWS X-Ray
- Metrics are sent to CloudWatch
- Create CloudWatch dashboards for:
  - Request rate by service
  - Error rate by service
  - P50/P95/P99 latencies
  - Trace sampling statistics

### Custom Dashboards

Create CloudWatch dashboard with widgets for:
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["ECSPerformanceApp", "http.server.duration", {"stat": "p99"}],
          ["...", {"stat": "p95"}],
          ["...", {"stat": "p50"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "API Latency Percentiles"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/X-Ray", "TracesReceived", {"stat": "Sum"}],
          [".", "TracesProcessed", {"stat": "Sum"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Trace Processing"
      }
    }
  ]
}
```

## Summary

This implementation provides:
1. ✅ Distributed tracing across all services
2. ✅ Automatic instrumentation for HTTP, database, and framework operations
3. ✅ Custom spans for business logic and cache operations
4. ✅ Trace context propagation between frontend and backend
5. ✅ Local visualization with Jaeger
6. ✅ Production integration with AWS X-Ray and CloudWatch
7. ✅ Performance metrics collection without impacting application performance

The OpenTelemetry Collector running as a sidecar ensures efficient batching and forwarding of telemetry data, minimizing the performance impact on your application services.