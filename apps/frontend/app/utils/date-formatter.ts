// 日付フォーマット用ユーティリティ
// Hydrationエラーを防ぐため、サーバー・クライアント間で一貫した形式を使用

export function formatDate(date: string | Date): string {
  return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}
