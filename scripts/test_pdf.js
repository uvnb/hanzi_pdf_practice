const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function test() {
  const templateBytes = fs.readFileSync('frontend/public/templates/tian_10c_13h.pdf');
  const templateDoc = await PDFDocument.load(templateBytes);
  const templatePage = templateDoc.getPages()[0];
  console.log('Original MediaBox:', templatePage.getMediaBox());
  console.log('Original CropBox:', templatePage.getCropBox());

  const newDoc = await PDFDocument.create();
  const embeddedPages = await newDoc.embedPdf(templateBytes);
  const embeddedTemplate = embeddedPages[0];
  console.log('Embedded width:', embeddedTemplate.width);
  console.log('Embedded height:', embeddedTemplate.height);
}
test();
