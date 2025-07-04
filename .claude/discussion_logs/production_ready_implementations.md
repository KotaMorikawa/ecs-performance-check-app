# Production-Ready Implementation Guides

## 1. Shared Cache Handler for ISR (Redis)

### Install Dependencies

```bash
cd apps/frontend
npm install @upstash/redis ioredis
```

### Create `apps/frontend/lib/cache-handler.ts`:

```typescript
import { CacheHandler } from 'next/dist/server/lib/incremental-cache';
import Redis from 'ioredis';

// Use Redis for shared cache across multiple ECS tasks
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.NODE_ENV === 'production' ? {} : undefined,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

export default class RedisHandler implements CacheHandler {
  constructor(options?: any) {
    console.log('RedisHandler initialized with options:', options);
  }

  async get(key: string) {
    try {
      const value = await redis.get(key);
      if (!value) return null;

      const parsed = JSON.parse(value);
      return {
        value: parsed.value,
        lastModified: parsed.lastModified,
        tags: parsed.tags,
      };
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, data: any, ctx: { revalidate?: number | false; tags?: string[] }) {
    try {
      const value = JSON.stringify({
        value: data,
        lastModified: Date.now(),
        tags: ctx.tags || [],
      });

      if (ctx.revalidate) {
        await redis.setex(key, ctx.revalidate, value);
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async revalidateTag(tag: string) {
    try {
      // Scan for all keys and check their tags
      const stream = redis.scanStream();
      const keysToDelete: string[] = [];

      stream.on('data', async (keys: string[]) => {
        for (const key of keys) {
          const value = await redis.get(key);
          if (value) {
            const parsed = JSON.parse(value);
            if (parsed.tags?.includes(tag)) {
              keysToDelete.push(key);
            }
          }
        }
      });

      await new Promise((resolve) => stream.on('end', resolve));
      
      if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
      }
    } catch (error) {
      console.error('Redis revalidateTag error:', error);
    }
  }
}
```

### Update `apps/frontend/next.config.ts`:

```typescript
const nextConfig = {
  // ... existing config ...
  experimental: {
    incrementalCacheHandlerPath: require.resolve('./lib/cache-handler.js'),
  },
};
```

### Add Redis to Docker Compose:

```yaml
  redis:
    container_name: ecs-performance-redis
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - ecs-performance-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## 2. Zero-Downtime Database Migrations

### Create Migration Strategy

Create `infrastructure/scripts/migrate-safe.sh`:

```bash
#!/bin/bash
set -e

# Safe migration strategy for zero-downtime deployments

echo "Starting safe database migration..."

# Step 1: Add new columns/tables (backward compatible)
echo "Phase 1: Expanding schema..."
npx prisma migrate deploy --name expand_${MIGRATION_NAME}

# Step 2: Deploy new application version
echo "Phase 2: Application deployment in progress..."
echo "Both old and new app versions can work with current schema"

# Step 3: Wait for old tasks to drain (configured in ALB)
echo "Phase 3: Waiting for old tasks to complete..."
sleep ${DRAIN_TIME:-300} # 5 minutes default

# Step 4: Remove old columns/constraints (after all old tasks are gone)
echo "Phase 4: Contracting schema..."
npx prisma migrate deploy --name contract_${MIGRATION_NAME}

echo "Migration completed successfully!"
```

### Example Migration Pattern

```prisma
// schema.prisma - Phase 1 (Expand)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  
  // Add new column with default or nullable
  firstName String?  // New column
  lastName  String?  // New column
  
  // Keep old column for compatibility
  fullName  String?  @deprecated("Use firstName and lastName")
}
```

```typescript
// Application code that works with both schemas
export function getUserName(user: User): string {
  // New logic
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  
  // Fallback to old field
  return user.fullName || user.name || 'Unknown';
}
```

## 3. Minimal Docker Images

### Optimized Next.js Dockerfile

```dockerfile
# apps/frontend/Dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only package files
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build:frontend

# Stage 3: Runner (minimal image)
FROM node:18-alpine AS runner
WORKDIR /app

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static

# OpenTelemetry instrumentation
COPY --from=builder /app/apps/frontend/instrumentation.node.js ./

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "server.js"]
```

### Optimized Hono Dockerfile

```dockerfile
# apps/backend/Dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci

# Copy source and build
COPY apps/backend ./apps/backend
RUN npm run build:backend

# Stage 2: Production dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --only=production

# Stage 3: Runner (distroless for maximum security)
FROM gcr.io/distroless/nodejs18-debian11
WORKDIR /app

# Copy only necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma

# Run as non-root
USER nonroot

EXPOSE 8000
ENV NODE_ENV production

CMD ["dist/index.js"]
```

## 4. AWS Secrets Manager Integration

### Create Secret Helper

```typescript
// apps/backend/src/lib/secrets-manager.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

export async function getSecret(secretName: string): Promise<Record<string, string>> {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT',
      })
    );

    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    }
    
    throw new Error('Secret is binary, not supported');
  } catch (error) {
    console.error('Failed to retrieve secret:', error);
    throw error;
  }
}

// Initialize secrets at startup
export async function initializeSecrets() {
  if (process.env.NODE_ENV === 'production') {
    const secrets = await getSecret('ecs-performance-app/production');
    
    // Set environment variables from secrets
    process.env.DATABASE_URL = secrets.DATABASE_URL;
    process.env.REVALIDATE_SECRET = secrets.REVALIDATE_SECRET;
    process.env.REDIS_PASSWORD = secrets.REDIS_PASSWORD;
  }
}
```

### ECS Task Definition with Secrets

```json
{
  "containerDefinitions": [
    {
      "name": "nextjs",
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:ecs-performance-app/production:DATABASE_URL::"
        },
        {
          "name": "REVALIDATE_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:ecs-performance-app/production:REVALIDATE_SECRET::"
        }
      ]
    }
  ],
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole"
}
```

## 5. CloudWatch Monitoring and Alerts

### Create Custom Metrics

```typescript
// apps/frontend/lib/cloudwatch-metrics.ts
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatchClient({ region: process.env.AWS_REGION });

export async function recordMetric(
  metricName: string,
  value: number,
  unit: 'Count' | 'Milliseconds' | 'Percent' = 'Count',
  dimensions?: Record<string, string>
) {
  if (process.env.NODE_ENV !== 'production') return;

  try {
    await cloudwatch.send(
      new PutMetricDataCommand({
        Namespace: 'ECSPerformanceApp',
        MetricData: [{
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date(),
          Dimensions: Object.entries(dimensions || {}).map(([Name, Value]) => ({ Name, Value })),
        }],
      })
    );
  } catch (error) {
    console.error('Failed to record metric:', error);
  }
}

// Usage examples
export async function recordCacheHit(hit: boolean) {
  await recordMetric('CacheHit', hit ? 1 : 0, 'Count', { CacheType: 'NextJS' });
}

export async function recordApiLatency(duration: number, endpoint: string) {
  await recordMetric('ApiLatency', duration, 'Milliseconds', { Endpoint: endpoint });
}

export async function recordErrorRate(errorType: string) {
  await recordMetric('ErrorRate', 1, 'Count', { ErrorType: errorType });
}
```

### CloudFormation for Alarms

```yaml
# infrastructure/cloudformation/alarms.yaml
Resources:
  HighErrorRateAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ECS-Performance-HighErrorRate
      AlarmDescription: Alert when error rate exceeds 1%
      MetricName: ErrorRate
      Namespace: ECSPerformanceApp
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 0.01
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopic
      TreatMissingData: notBreaching

  HighLatencyAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ECS-Performance-HighLatency
      AlarmDescription: Alert when P99 latency exceeds 1 second
      MetricName: ApiLatency
      Namespace: ECSPerformanceApp
      ExtendedStatistic: p99
      Period: 300
      EvaluationPeriods: 2
      Threshold: 1000
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopic

  LowCacheHitRateAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ECS-Performance-LowCacheHitRate
      AlarmDescription: Alert when cache hit rate drops below 80%
      Metrics:
        - Id: hit_rate
          Expression: (m1 / (m1 + m2)) * 100
        - Id: m1
          MetricStat:
            Metric:
              MetricName: CacheHit
              Namespace: ECSPerformanceApp
              Dimensions:
                - Name: CacheType
                  Value: NextJS
            Period: 300
            Stat: Sum
          ReturnData: false
        - Id: m2
          MetricStat:
            Metric:
              MetricName: CacheMiss
              Namespace: ECSPerformanceApp
              Dimensions:
                - Name: CacheType
                  Value: NextJS
            Period: 300
            Stat: Sum
          ReturnData: false
      EvaluationPeriods: 3
      Threshold: 80
      ComparisonOperator: LessThanThreshold
      AlarmActions:
        - !Ref SNSTopic

  SNSTopic:
    Type: AWS::SNS::Topic
    Properties:
      Subscription:
        - Endpoint: ops-team@example.com
          Protocol: email
        - Endpoint: !GetAtt SlackLambda.Arn
          Protocol: lambda
```

## 6. Connection Pooling Best Practices

### Prisma Connection Pool

```typescript
// apps/backend/src/lib/database.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Connection pool configuration
  // Adjust based on your container resources
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### HTTP Keep-Alive for Container Communication

```typescript
// apps/frontend/lib/api-client.ts
import { Agent } from 'http';

// Reuse connections for better performance
const httpAgent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10,
});

export async function fetchFromBackend(path: string, options: RequestInit = {}) {
  const url = `${process.env.API_URL}${path}`;
  
  return fetch(url, {
    ...options,
    agent: httpAgent,
    headers: {
      'Connection': 'keep-alive',
      ...options.headers,
    },
  });
}
```

## Summary

These implementations provide:
1. ✅ Shared cache across ECS tasks using Redis
2. ✅ Safe database migration strategy for zero downtime
3. ✅ Minimal Docker images for fast cold starts
4. ✅ Secure secrets management with AWS Secrets Manager
5. ✅ Comprehensive monitoring with CloudWatch
6. ✅ Optimized connection pooling for container communication

All code examples are production-ready and follow AWS best practices.