import { apiFetch } from "@/lib/api-client";

export interface NotebookEntry {
  character: string;
  pinyin: string;
  meaning_vi: string;
}

export async function fetchNotebook(): Promise<NotebookEntry[]> {
  const response = await apiFetch("/api/users/me/notebook");
  if (!response.ok) {
    throw new Error("Không thể tải sổ tay.");
  }
  return (await response.json()) as NotebookEntry[];
}

export async function saveCharacter(character: string): Promise<NotebookEntry> {
  const response = await apiFetch("/api/users/me/notebook", {
    method: "POST",
    body: JSON.stringify({ character }),
  });
  if (response.status === 404) {
    throw new Error("Chữ này chưa có metadata để lưu vào sổ tay.");
  }
  if (!response.ok) {
    throw new Error("Không thể lưu chữ vào sổ tay.");
  }
  return (await response.json()) as NotebookEntry;
}

export async function removeCharacter(character: string): Promise<void> {
  const response = await apiFetch(
    `/api/users/me/notebook/${encodeURIComponent(character)}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error("Không thể xóa chữ khỏi sổ tay.");
  }
}
