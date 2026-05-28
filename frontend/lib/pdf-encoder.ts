export interface JpegPage {
  bytes: Uint8Array;
  width: number;
  height: number;
}

const encoder = new TextEncoder();

function ascii(value: string): Uint8Array {
  return encoder.encode(value);
}

function join(parts: Uint8Array[]): Uint8Array {
  const byteLength = parts.reduce((total, part) => total + part.length, 0);
  const combined = new Uint8Array(byteLength);
  let offset = 0;

  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }

  return combined;
}

function object(id: number, body: Uint8Array): Uint8Array {
  return join([ascii(`${id} 0 obj\n`), body, ascii("\nendobj\n")]);
}

function stream(dictionary: string, bytes: Uint8Array): Uint8Array {
  return join([
    ascii(`<< ${dictionary} /Length ${bytes.length} >>\nstream\n`),
    bytes,
    ascii("\nendstream"),
  ]);
}

export function encodeJpegPagesAsPdf(pages: JpegPage[]): Uint8Array {
  if (pages.length === 0) {
    throw new Error("PDF cần ít nhất một trang.");
  }

  const objects: Uint8Array[] = [];
  const pageObjectIds = pages.map((_, index) => 3 + index * 3);

  objects.push(object(1, ascii("<< /Type /Catalog /Pages 2 0 R >>")));
  objects.push(
    object(
      2,
      ascii(
        `<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectIds
          .map((id) => `${id} 0 R`)
          .join(" ")}] >>`,
      ),
    ),
  );

  pages.forEach((page, index) => {
    const pageId = pageObjectIds[index];
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const widthPoints = 595.28;
    const heightPoints = 841.89;
    const paintImage = ascii(
      `q\n${widthPoints} 0 0 ${heightPoints} 0 0 cm\n/WorksheetImage Do\nQ`,
    );

    objects.push(
      object(
        pageId,
        ascii(
          `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPoints} ${heightPoints}] ` +
            `/Resources << /XObject << /WorksheetImage ${imageId} 0 R >> >> ` +
            `/Contents ${contentId} 0 R >>`,
        ),
      ),
    );
    objects.push(object(contentId, stream("", paintImage)));
    objects.push(
      object(
        imageId,
        stream(
          `/Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} ` +
            "/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode",
          page.bytes,
        ),
      ),
    );
  });

  const header = ascii("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const offsets: number[] = [0];
  let offset = header.length;

  for (const entry of objects) {
    offsets.push(offset);
    offset += entry.length;
  }

  const xrefOffset = offset;
  const xrefRows = offsets
    .map((entryOffset, index) =>
      index === 0
        ? "0000000000 65535 f \n"
        : `${entryOffset.toString().padStart(10, "0")} 00000 n \n`,
    )
    .join("");
  const trailer = ascii(
    `xref\n0 ${objects.length + 1}\n${xrefRows}` +
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
      `startxref\n${xrefOffset}\n%%EOF\n`,
  );

  return join([header, ...objects, trailer]);
}
