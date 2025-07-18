"use client";

import { Calendar, Edit, Eye, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "./delete-button";

// date-fns removed to prevent hydration issues

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  tags?: {
    id: number;
    name: string;
  }[];
}

interface PostListProps {
  posts: Post[];
  onEdit?: (post: Post) => void;
  onOptimisticDelete?: (postId: number) => void;
  emptyMessage?: string;
}

export function PostList({
  posts,
  onEdit,
  onOptimisticDelete,
  emptyMessage = "投稿がありません",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <Alert>
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  {post.title}
                  {post.published ? (
                    <Badge variant="default" className="ml-2">
                      公開中
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">
                      下書き
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.createdAt.slice(0, 10)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views} 回表示
                  </span>
                  {post.author && (
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author.name || "Anonymous"}
                    </span>
                  )}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(post)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    編集
                  </Button>
                )}
                <DeleteButton
                  postId={post.id}
                  postTitle={post.title}
                  variant="outline"
                  size="sm"
                  onOptimisticDelete={onOptimisticDelete}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700 line-clamp-3">
                {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">タグ:</span>
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  スラッグ:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">/{post.slug}</code>
                </span>
                {post.updatedAt !== post.createdAt && (
                  <span className="text-sm text-muted-foreground">
                    最終更新: {post.updatedAt.slice(5, 10)} {post.updatedAt.slice(11, 16)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
