import { encodeJpegPagesAsPdf, JpegPage } from "@/lib/pdf-encoder";

export type GridStyle = "tian" | "mi";

interface CharacterData {
  strokes: string[];
}

export interface HanziMetadata {
  character: string;
  pinyin: string;
  meaning_vi: string;
}

export interface WorksheetResult {
  pdfBytes: Uint8Array;
  previewUrls: string[];
  pageCount: number;
}

export interface WorksheetLabels {
  title: string;
  subtitleTian: string;
  subtitleMi: string;
  page: (page: number, pages: number) => string;
  sample: string;
  trace: string;
  selfPractice: string;
  footer: string;
  loading: (page: number, pages: number) => string;
  rendering: (page: number, pages: number) => string;
  packaging: string;
  strokeMissing: (character: string) => string;
  strokeInvalid: (character: string) => string;
  canvasError: string;
  imageError: string;
  emptyError: string;
}

const CHARACTER_DATA_URL =
  "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/";
const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const MARGIN = 60;
const COLUMNS = 10;
const ROWS = 10;
const CELL_SIZE = 106;
const ROW_PITCH = 137;
const GRID_TOP = 272;
const characterCache = new Map<string, Promise<CharacterData>>();

export function collectHanzi(text: string): string[] {
  const unique = new Set<string>();
  for (const character of Array.from(text)) {
    if (/\p{Script=Han}/u.test(character)) {
      unique.add(character);
    }
  }
  return Array.from(unique);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function loadCharacterData(
  character: string,
  labels: WorksheetLabels,
): Promise<CharacterData> {
  const cached = characterCache.get(character);
  if (cached) {
    return cached;
  }

  const request = fetch(`${CHARACTER_DATA_URL}${encodeURIComponent(character)}.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(labels.strokeMissing(character));
      }
      return response.json() as Promise<CharacterData>;
    })
    .then((data) => {
      if (!Array.isArray(data.strokes) || data.strokes.length === 0) {
        throw new Error(labels.strokeInvalid(character));
      }
      return data;
    })
    .catch((error: unknown) => {
      characterCache.delete(character);
      throw error;
    });

  characterCache.set(character, request);
  return request;
}

function drawGuideGrid(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  style: GridStyle,
) {
  context.save();
  context.strokeStyle = "#d6bca8";
  context.lineWidth = 1.4;
  context.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
  context.setLineDash([5, 5]);
  context.strokeStyle = "#decbbc";
  context.beginPath();
  context.moveTo(x + CELL_SIZE / 2, y);
  context.lineTo(x + CELL_SIZE / 2, y + CELL_SIZE);
  context.moveTo(x, y + CELL_SIZE / 2);
  context.lineTo(x + CELL_SIZE, y + CELL_SIZE / 2);
  if (style === "mi") {
    context.moveTo(x, y);
    context.lineTo(x + CELL_SIZE, y + CELL_SIZE);
    context.moveTo(x + CELL_SIZE, y);
    context.lineTo(x, y + CELL_SIZE);
  }
  context.stroke();
  context.restore();
}

function drawCharacter(
  context: CanvasRenderingContext2D,
  paths: string[],
  x: number,
  y: number,
  alpha: number,
) {
  const contentSize = CELL_SIZE - 22;
  const scale = contentSize / 1024;

  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = "#28211c";
  context.translate(x + 11, y + CELL_SIZE - 14);
  context.scale(scale, -scale);
  for (const path of paths) {
    context.fill(new Path2D(path));
  }
  context.restore();
}

function drawHeader(
  context: CanvasRenderingContext2D,
  pageNumber: number,
  pageCount: number,
  style: GridStyle,
  labels: WorksheetLabels,
  bgImage: HTMLImageElement | null,
) {
  if (bgImage) {
    context.drawImage(bgImage, 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  } else {
    context.fillStyle = "#fffdf9";
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  }
  context.fillStyle = "#241e19";
  context.font = 'bold 42px Georgia, "Noto Serif SC", serif';
  context.fillText(labels.title, MARGIN, 94);
}

function drawFooter(
  context: CanvasRenderingContext2D,
  pageNumber: number,
  pageCount: number,
  labels: WorksheetLabels
) {
  context.fillStyle = "#554b45";
  context.font = "16px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText(
    labels.page(pageNumber, pageCount),
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 60
  );
  context.textAlign = "left";
  context.fillText(
    "cre: uvnb",
    MARGIN,
    PAGE_HEIGHT - 60
  );
}

function truncateText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (context.measureText(text).width <= maxWidth) {
    return text;
  }

  let truncated = text;
  while (truncated.length > 0 && context.measureText(`${truncated}...`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}...`;
}

function drawMetadata(
  context: CanvasRenderingContext2D,
  character: string,
  metadata: HanziMetadata | undefined,
  y: number,
) {
  const text = metadata
    ? `${character}  ${metadata.pinyin}  -  ${metadata.meaning_vi}`
    : character;
  context.save();
  context.fillStyle = "#745c4e";
  context.font = '17px Arial, "Noto Sans SC", sans-serif';
  context.fillText(
    truncateText(context, text, COLUMNS * CELL_SIZE),
    MARGIN,
    y - 9,
  );
  context.restore();
}

function createPageCanvas(
  characters: string[],
  data: CharacterData[],
  metadata: Map<string, HanziMetadata>,
  style: GridStyle,
  pageNumber: number,
  pageCount: number,
  labels: WorksheetLabels,
  bgImage: HTMLImageElement | null,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error(labels.canvasError);
  }

  drawHeader(context, pageNumber, pageCount, style, labels, bgImage);
  characters.forEach((character, row) => {
    const y = GRID_TOP + row * ROW_PITCH;
    drawMetadata(context, character, metadata.get(character), y);
    for (let column = 0; column < COLUMNS; column += 1) {
      drawGuideGrid(context, MARGIN + column * CELL_SIZE, y, style);
    }
    drawCharacter(context, data[row].strokes, MARGIN, y, 1);
    drawCharacter(context, data[row].strokes, MARGIN + CELL_SIZE, y, 0.16);
  });
  drawFooter(context, pageNumber, pageCount, labels);
  return canvas;
}

function canvasToJpeg(
  canvas: HTMLCanvasElement,
  labels: WorksheetLabels,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(labels.imageError));
          return;
        }
        blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)), reject);
      },
      "image/jpeg",
      0.94,
    );
  });
}

export async function buildWorksheet(
  characters: string[],
  style: GridStyle,
  background: string,
  labels: WorksheetLabels,
  metadata: HanziMetadata[] = [],
  onProgress?: (progress: string) => void,
): Promise<WorksheetResult> {
  if (characters.length === 0) {
    throw new Error(labels.emptyError);
  }

  const pageCount = Math.ceil(characters.length / ROWS);
  const pages: JpegPage[] = [];
  const metadataByCharacter = new Map(
    metadata.map((entry) => [entry.character, entry]),
  );
  
  let bgImageElement: HTMLImageElement | null = null;
  if (background && background !== "none") {
    try {
      bgImageElement = await loadImage(`/background_pdf/${background}`);
    } catch (e) {
      console.error("Failed to load background image", e);
    }
  }

  const previewUrls: string[] = [];

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const pageCharacters = characters.slice(pageIndex * ROWS, (pageIndex + 1) * ROWS);
    onProgress?.(labels.loading(pageIndex + 1, pageCount));
    const characterData = await Promise.all(
      pageCharacters.map((character) => loadCharacterData(character, labels)),
    );
    const canvas = createPageCanvas(
      pageCharacters,
      characterData,
      metadataByCharacter,
      style,
      pageIndex + 1,
      pageCount,
      labels,
      bgImageElement
    );
    onProgress?.(labels.rendering(pageIndex + 1, pageCount));
    pages.push({
      bytes: await canvasToJpeg(canvas, labels),
      width: canvas.width,
      height: canvas.height,
    });
    previewUrls.push(canvas.toDataURL("image/jpeg", 0.85));
  }

  onProgress?.(labels.packaging);
  return {
    pdfBytes: encodeJpegPagesAsPdf(pages),
    previewUrls,
    pageCount,
  };
}
