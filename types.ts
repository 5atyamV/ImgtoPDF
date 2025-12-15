export interface ProcessedImage {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  isAiLoading: boolean;
  width: number;
  height: number;
}

export interface PdfGenerationConfig {
  includeCaptions: boolean;
  paperSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
}