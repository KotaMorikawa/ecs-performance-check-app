import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import "../../../../../vitest.setup.ui"; // UI環境用setup
import { PostForm } from "../_components/post-form";

// React hooksをモック
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useActionState: vi.fn(() => [
      { success: false }, // state
      vi.fn(), // action
      false, // isPending
    ]),
  };
});

// Server Actions をモック（何もしない関数）
vi.mock("../_actions/post-actions", () => ({
  createPost: vi.fn(),
  updatePost: vi.fn(),
  createPostWithState: vi.fn(),
  updatePostWithState: vi.fn(),
}));

describe("PostForm Component", () => {
  describe("新規作成フォーム", () => {
    it("should render create form with all required fields", () => {
      render(<PostForm mode="create" />);

      expect(screen.getByRole("textbox", { name: /タイトル/ })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /コンテンツ/ })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /スラッグ/ })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /公開/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /投稿を作成/ })).toBeInTheDocument();
    });

    it("should have proper form attributes for useActionState", () => {
      render(<PostForm mode="create" />);

      const form = screen.getByRole("form");
      expect(form).toHaveAttribute("noValidate"); // HTML5バリデーション無効化
      // useActionStateを使用する場合、methodは不要
      expect(form).not.toHaveAttribute("method");
    });

    it("should have required attributes on form fields", () => {
      render(<PostForm mode="create" />);

      expect(screen.getByRole("textbox", { name: /タイトル/ })).toHaveAttribute("required");
      expect(screen.getByRole("textbox", { name: /コンテンツ/ })).toHaveAttribute("required");
      expect(screen.getByRole("textbox", { name: /スラッグ/ })).toHaveAttribute("required");
    });

    it("should generate slug when typing title", async () => {
      const user = userEvent.setup();
      render(<PostForm mode="create" />);

      const titleInput = screen.getByRole("textbox", { name: /タイトル/ });
      const slugInput = screen.getByRole("textbox", { name: /スラッグ/ });

      // タイトルを入力
      await user.type(titleInput, "Hello World");

      // スラッグが自動生成されることを確認（Reactの状態更新を待つ）
      await waitFor(() => {
        expect(slugInput).toHaveValue("hello-world");
      });
    });

    it("should show Progressive Enhancement explanation", () => {
      render(<PostForm mode="create" />);

      expect(screen.getByText(/Progressive Enhancement/)).toBeInTheDocument();
      expect(screen.getByText(/JavaScriptが無効でも動作します/)).toBeInTheDocument();
    });
  });

  describe("編集フォーム", () => {
    const mockPost = {
      id: 1,
      title: "Existing Post",
      content: "Existing content",
      slug: "existing-post",
      published: true,
      views: 100,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      author: null,
      tags: [],
    };

    it("should render edit form with existing post data", () => {
      render(<PostForm mode="edit" post={mockPost} />);

      expect(screen.getByDisplayValue("Existing Post")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Existing content")).toBeInTheDocument();
      expect(screen.getByDisplayValue("existing-post")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeChecked();
      expect(screen.getByRole("button", { name: /投稿を更新/ })).toBeInTheDocument();
    });

    it("should allow field updates", async () => {
      const user = userEvent.setup();
      render(<PostForm mode="edit" post={mockPost} />);

      const titleInput = screen.getByDisplayValue("Existing Post");

      // フィールドをクリアして新しい値を入力
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Post");

      expect(titleInput).toHaveValue("Updated Post");
    });
  });

  describe("フォーム構造", () => {
    it("should render form elements correctly", () => {
      render(<PostForm mode="create" />);

      expect(screen.getByRole("textbox", { name: /タイトル/ })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /スラッグ/ })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /コンテンツ/ })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /公開する/ })).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("should have proper form structure", () => {
      render(<PostForm mode="create" />);

      const titleInput = screen.getByRole("textbox", { name: /タイトル/ });
      const contentInput = screen.getByRole("textbox", { name: /コンテンツ/ });

      expect(titleInput).toHaveAttribute("required");
      expect(contentInput).toHaveAttribute("required");
    });

    it("should have accessible form labels", () => {
      render(<PostForm mode="create" />);

      const titleInput = screen.getByRole("textbox", { name: /タイトル/ });
      const contentInput = screen.getByRole("textbox", { name: /コンテンツ/ });
      const slugInput = screen.getByRole("textbox", { name: /スラッグ/ });

      expect(titleInput).toHaveAttribute("id", "title");
      expect(contentInput).toHaveAttribute("id", "content");
      expect(slugInput).toHaveAttribute("id", "slug");
    });
  });
});
