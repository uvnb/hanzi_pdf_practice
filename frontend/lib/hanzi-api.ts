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
