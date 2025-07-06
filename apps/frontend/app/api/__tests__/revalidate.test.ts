import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "../revalidate/route";

// Next.js関数のモック
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { revalidatePath, revalidateTag } from "next/cache";

describe("/api/revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REVALIDATE_SECRET = "test-secret-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/revalidate", () => {
    it("APIの情報を返すべき", async () => {
      // Arrange & Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.service).toBe("nextjs-revalidate-api");
      expect(data.supportedMethods).toContain("POST");
      expect(data.requiredFields).toContain("secret");
      expect(data.example).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });
  });

  describe("POST /api/revalidate", () => {
    it("有効なシークレットとパスでリバリデートが成功すべき", async () => {
      // Arrange
      const requestBody = {
        path: "/test-path",
        secret: "test-secret-key",
      };

      const request = new NextRequest("http://localhost:3000/api/revalidate", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.revalidated).toContain("path: /test-path");
      expect(data.errors).toBeUndefined();
      expect(revalidatePath).toHaveBeenCalledWith("/test-path");
      expect(data.timestamp).toBeDefined();
    });

    it("有効なシークレットとタグでリバリデートが成功すべき", async () => {
      // Arrange
      const requestBody = {
        tag: "posts",
        secret: "test-secret-key",
      };

      const request = new NextRequest("http://localhost:3000/api/revalidate", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.revalidated).toContain("tag: posts");
      expect(data.errors).toBeUndefined();
      expect(revalidateTag).toHaveBeenCalledWith("posts");
      expect(data.timestamp).toBeDefined();
    });

    it("パスとタグ両方でリバリデートが成功すべき", async () => {
      // Arrange
      const requestBody = {
        path: "/test-path",
        tag: "posts",
        secret: "test-secret-key",
      };

      const request = new NextRequest("http://localhost:3000/api/revalidate", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.revalidated).toContain("path: /test-path");
      expect(data.revalidated).toContain("tag: posts");
      expect(data.errors).toBeUndefined();
      expect(revalidatePath).toHaveBeenCalledWith("/test-path");
      expect(revalidateTag).toHaveBeenCalledWith("posts");
    });

    it("無効なシークレットで401エラーを返すべき", async () => {
      // Arrange
      const requestBody = {
        path: "/test-path",
        secret: "invalid-secret",
      };

      const request = new NextRequest("http://localhost:3000/api/revalidate", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid secret");
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it("シークレットが未設定の場合401エラーを返すべき", async () => {
      // Arrange
      delete process.env.REVALIDATE_SECRET;

      const requestBody = {
        path: "/test-path",
        secret: "any-secret",
      };

      const request = new NextRequest("http://localhost:3000/api/revalidate", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid secret");
    });

    it("パスもタグも指定されていない場合400エラーを返すべき", async () => {
      // Arrange
      const requestBody = {
        secret: "test-secret-key",
      };

      const request = new NextRequest("http://localhost:3000/api/revalidate", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Either path or tag must be provided");
    });

    it("revalidatePathがエラーを投げた場合、エラー情報を含むべき", async () => {
      // Arrange
      vi.mocked(revalidatePath).mockImplementationOnce(() => {
        throw new Error("Revalidation failed");
      });

      const requestBody = {
        path: "/test-path",
        secret: "test-secret-key",
      };

      const request = new NextRequest("http://localhost:3000/api/revalidate", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(207); // 部分的成功
      expect(data.errors).toContain("Failed to revalidate path /test-path: Revalidation failed");
      expect(data.revalidated).toBeUndefined();
    });
  });
});
