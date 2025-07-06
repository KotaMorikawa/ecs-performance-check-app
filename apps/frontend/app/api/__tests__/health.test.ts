import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../health/route";

// fetchのモック
global.fetch = vi.fn();

describe("/api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数のモック
    process.env.API_URL = "http://localhost:8000";
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("バックエンドAPIが正常な場合、ヘルスチェックが成功すべき", async () => {
    // Arrange
    const mockBackendResponse = {
      status: "ok",
      database: "connected",
      timestamp: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBackendResponse),
    } as Response);

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.service).toBe("nextjs-frontend");
    expect(data.backend.status).toBe("healthy");
    expect(data.backend.database).toBe("connected");
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
  });

  it("バックエンドAPIが異常な場合、ヘルスチェックが失敗すべき", async () => {
    // Arrange
    const mockBackendResponse = {
      status: "error",
      database: "disconnected",
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockBackendResponse),
    } as Response);

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(503);
    expect(data.status).toBe("error");
    expect(data.service).toBe("nextjs-frontend");
    expect(data.backend.status).toBe("error");
  });

  it("バックエンドAPIに接続できない場合、エラーを返すべき", async () => {
    // Arrange
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Connection refused"));

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(503);
    expect(data.status).toBe("error");
    expect(data.service).toBe("nextjs-frontend");
    expect(data.backend.status).toBe("error");
    expect(data.backend.message).toBe("Connection refused");
  });

  it("API_URL環境変数が未設定の場合、デフォルトURLを使用すべき", async () => {
    // Arrange
    delete process.env.API_URL;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", database: "connected" }),
    } as Response);

    // Act
    await GET();

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/health",
      expect.objectContaining({
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
    );
  });
});
