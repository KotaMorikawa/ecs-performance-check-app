'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { deletePostWithState } from '../_actions/post-actions';
import { INITIAL_DELETE_STATE } from '../_lib/validation';

interface DeleteButtonProps {
  postId: number;
  postTitle: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onOptimisticDelete?: (postId: number) => void;
}

export function DeleteButton({
  postId,
  postTitle,
  variant = 'destructive',
  size = 'default',
  className,
  onOptimisticDelete,
}: DeleteButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // useActionStateで削除状態管理
  const [deleteState, deleteAction, isPending] = useActionState(
    deletePostWithState,
    INITIAL_DELETE_STATE
  );

  // Server Actionの結果を監視してトースト通知とダイアログクローズ
  useEffect(() => {
    if (!deleteState.timestamp) return; // 初期状態では何もしない
    
    if (deleteState.success && deleteState.message) {
      toast({
        title: '成功',
        description: deleteState.message,
      });
      setIsOpen(false);
    } else if (deleteState.error) {
      toast({
        title: 'エラー',
        description: deleteState.error,
        variant: 'destructive',
      });
    }
  }, [deleteState, toast]);

  // 楽観的削除ハンドラー
  const handleOptimisticDelete = () => {
    if (onOptimisticDelete) {
      onOptimisticDelete(postId);
    }
    setIsOpen(false); // ダイアログを閉じる
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className} onClick={() => setIsOpen(true)}>
          <Trash2 className="h-4 w-4" />
          {size !== 'icon' && (size === 'sm' ? '' : '削除')}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">以下の投稿を完全に削除します。この操作は取り消せません。</span>
            <span className="block font-medium text-foreground">「{postTitle}」</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteState.error && (
          <Alert variant="destructive">
            <AlertDescription>{deleteState.error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>

          {/* Server Action フォーム */}
          <form action={deleteAction} onSubmit={handleOptimisticDelete} className="w-full">
            <input type="hidden" name="id" value={postId} />
            <Button type="submit" variant="destructive" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                  削除中...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除を実行
                </>
              )}
            </Button>
          </form>
        </AlertDialogFooter>

        {/* Progressive Enhancement のフォールバック */}
        <noscript>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              JavaScriptが無効の場合は、以下のフォームで削除を実行してください。
            </p>
            <form action={deletePostWithState as unknown as string}>
              <input type="hidden" name="id" value={postId} />
              <Button type="submit" variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                削除を実行
              </Button>
            </form>
          </div>
        </noscript>
      </AlertDialogContent>
    </AlertDialog>
  );
}
