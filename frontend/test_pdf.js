const { PDFDocument, BlendMode } = require('pdf-lib');
const fs = require('fs');

async function test() {
  const templateBytes = fs.readFileSync('public/templates/tian_10c_13h.pdf');
  const bgBytes = fs.readFileSync('public/background_pdf/1.jpeg');
  
  const newDoc = await PDFDocument.create();
  const embeddedPages = await newDoc.embedPdf(templateBytes);
  const embeddedTemplate = embeddedPages[0];
  const embeddedBg = await newDoc.embedJpg(bgBytes);
  
  const page = newDoc.addPage([embeddedTemplate.width, embeddedTemplate.height]);
  page.drawPage(embeddedTemplate, { x: 0, y: 0, width: embeddedTemplate.width, height: embeddedTemplate.height });
  page.drawImage(embeddedBg, {
    x: 0,
    y: 0,
    width: embeddedTemplate.width,
    height: embeddedTemplate.height,
    opacity: 1 - 0.6,
    blendMode: BlendMode.Multiply,
  });
  
  const pdfBytes = await newDoc.save();
  fs.writeFileSync('out.pdf', pdfBytes);
  console.log("PDF generated.");
}
test();
