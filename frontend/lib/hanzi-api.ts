import { HanziMetadata } from "@/lib/pdf-worksheet";
import { apiFetch, apiUrl } from "@/lib/api-client";

export async function fetchHanziMetadata(
  characters: string[],
): Promise<HanziMetadata[]> {
  const url = apiUrl("/api/hanzi/batch");
  url.searchParams.set("characters", characters.join(","));
  const response = await apiFetch(url);

  if (!response.ok) {
    throw new Error(`Metadata API trả về lỗi ${response.status}.`);
  }

  return (await response.json()) as HanziMetadata[];
}

export interface HanziDetail {
  character: string;
  pinyin: string;
  hsk_level: number | null;
  meaning_vi: string;
  example_sentences: Array<{ hanzi: string; pinyin: string; vi: string }>;
  ai_enriched: boolean;
  stroke_count: number | null;
  topic: string | null;
  radicals: string[];
  etymology_vi: string | null;
  audio_url: string | null;
  stroke_svg: string | null;
}

export async function fetchHanziDetail(character: string): Promise<HanziDetail> {
  const url = apiUrl(`/api/hanzi/${encodeURIComponent(character)}`);
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Detail API trả về lỗi ${response.status}.`);
  }
  return await response.json();
}

export async function fetchHskList(level: number): Promise<HanziMetadata[]> {
  const url = apiUrl(`/api/hanzi/hsk/${level}`);
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`HSK API trả về lỗi ${response.status}.`);
  }
  return await response.json();
}

export interface AttemptCreate {
  character: string;
  mistakes: number;
}

export interface AttemptRead {
  character: string;
  mistakes: number;
  is_perfect: boolean;
  practiced_at: string;
}

export interface PracticeStats {
  total_attempts: number;
  total_characters_practiced: number;
  perfect_count: number;
  total_mistakes: number;
  accuracy_rate: number;
  streak_days: number;
  recent_attempts: AttemptRead[];
}

export async function fetchStats(): Promise<PracticeStats> {
  const url = apiUrl("/api/practice/stats");
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Stats API trả về lỗi ${response.status}.`);
  }
  return await response.json();
}

export async function logAttempt(payload: AttemptCreate): Promise<AttemptRead> {
  const url = apiUrl("/api/practice");
  const response = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Log attempt API trả về lỗi ${response.status}.`);
  }
  return await response.json();
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  attempts: number;
  perfect: number;
  streak: number;
  isPremium: boolean;
}

export async function fetchLeaderboard(): Promise<LeaderboardUser[]> {
  const url = apiUrl("/api/practice/leaderboard");
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Leaderboard API trả về lỗi ${response.status}.`);
  }
  return await response.json();
}
