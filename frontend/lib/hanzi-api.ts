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
