import React, { useState, useEffect } from 'react';
import { Dropzone } from './components/Dropzone';
import { ImageCard } from './components/ImageCard';
import { ProcessedImage, PdfGenerationConfig } from './types';
import { generateImageCaption } from './services/geminiService';
import { generatePdf } from './utils/pdfGenerator';
import { FileText, Download, Settings, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Actually we will use crypto.randomUUID for simplicity if no uuid pkg

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<PdfGenerationConfig>({
    includeCaptions: true,
    paperSize: 'a4',
    orientation: 'portrait'
  });

  // Helper to get image dimensions
  const getImageDimensions = (src: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = src;
    });
  };

  const handleFilesDropped = async (files: File[]) => {
    const newImages: ProcessedImage[] = [];

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      const dimensions = await getImageDimensions(previewUrl);
      
      newImages.push({
        id: crypto.randomUUID(),
        file,
        previewUrl,
        caption: '',
        isAiLoading: false,
        width: dimensions.width,
        height: dimensions.height,
      });
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const imgToRemove = prev.find(img => img.id === id);
      if (imgToRemove) {
        URL.revokeObjectURL(imgToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) return;

    setImages(prev => {
      const newImages = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      return newImages;
    });
  };

  const updateCaption = (id: string, caption: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, caption } : img
    ));
  };

  const handleAiGenerate = async (id: string, file: File) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, isAiLoading: true } : img
    ));

    try {
      const caption = await generateImageCaption(file);
      updateCaption(id, caption);
    } catch (error) {
      alert("Failed to generate caption. Please check your API key or connection.");
    } finally {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, isAiLoading: false } : img
      ));
    }
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      await generatePdf(images, config);
    } catch (error) {
      console.error("PDF Gen Error", error);
      alert("Failed to generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <FileText size={20} />
            </div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">SnapDoc <span className="text-indigo-600">PDF</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               {images.length} page{images.length !== 1 ? 's' : ''} ready
            </div>
            <button
              onClick={handleGeneratePdf}
              disabled={images.length === 0 || isGenerating}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-full font-medium text-white shadow-sm transition-all
                ${images.length === 0 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 shadow-indigo-100 active:scale-95'
                }
              `}
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Intro / Empty State */}
        {images.length === 0 && (
          <div className="text-center py-12 space-y-4">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
               <Sparkles size={32} />
             </div>
             <h2 className="text-3xl font-bold text-slate-800">Transform Images to PDF with AI</h2>
             <p className="text-slate-500 max-w-lg mx-auto">
               Upload your photos, arrange the order, and let our Gemini AI integration auto-caption your document before exporting to a clean, professional PDF.
             </p>
          </div>
        )}

        {/* Upload Area */}
        <Dropzone onFilesDropped={handleFilesDropped} />

        {/* Controls & Grid */}
        {images.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <ImageIcon size={18} className="text-slate-400" />
                Pages Overview
              </h3>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    id="showCaptions"
                    checked={config.includeCaptions}
                    onChange={(e) => setConfig(prev => ({ ...prev, includeCaptions: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="showCaptions" className="cursor-pointer select-none text-slate-600">Include Captions in PDF</label>
                </div>

                <div className="h-4 w-px bg-slate-200"></div>

                <select 
                  value={config.orientation}
                  onChange={(e) => setConfig(prev => ({...prev, orientation: e.target.value as any}))}
                  className="bg-transparent text-slate-600 font-medium focus:outline-none cursor-pointer hover:text-indigo-600"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img, idx) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  index={idx}
                  total={images.length}
                  onRemove={removeImage}
                  onMove={moveImage}
                  onCaptionChange={updateCaption}
                  onAiGenerate={handleAiGenerate}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;