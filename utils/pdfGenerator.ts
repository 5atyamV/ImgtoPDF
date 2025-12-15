import jsPDF from 'jspdf';
import { ProcessedImage, PdfGenerationConfig } from '../types';

export const generatePdf = async (images: ProcessedImage[], config: PdfGenerationConfig): Promise<void> => {
  if (images.length === 0) return;

  const doc = new jsPDF({
    orientation: config.orientation,
    unit: 'mm',
    format: config.paperSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxContentWidth = pageWidth - (margin * 2);
  const maxContentHeight = pageHeight - (margin * 2) - (config.includeCaptions ? 20 : 0); // Reserve space for caption

  for (let i = 0; i < images.length; i++) {
    if (i > 0) {
      doc.addPage();
    }

    const img = images[i];
    
    // Calculate scaling to fit page while maintaining aspect ratio
    const imgRatio = img.width / img.height;
    const pageRatio = maxContentWidth / maxContentHeight;

    let finalWidth, finalHeight;

    if (imgRatio > pageRatio) {
      // Image is wider than page content area
      finalWidth = maxContentWidth;
      finalHeight = finalWidth / imgRatio;
    } else {
      // Image is taller than page content area
      finalHeight = maxContentHeight;
      finalWidth = finalHeight * imgRatio;
    }

    // Center image
    const x = (pageWidth - finalWidth) / 2;
    const y = margin;

    // We use the previewUrl (data URL) for adding image
    doc.addImage(img.previewUrl, 'JPEG', x, y, finalWidth, finalHeight);

    if (config.includeCaptions && img.caption) {
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const textY = y + finalHeight + 10;
      
      // Split text to fit width
      const splitText = doc.splitTextToSize(img.caption, maxContentWidth);
      
      // Center text
      doc.text(splitText, pageWidth / 2, textY, { align: 'center' });
    }
  }

  doc.save('snapdoc-converted.pdf');
};