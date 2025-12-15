import React from 'react';
import { X, Wand2, ArrowUp, ArrowDown, Type } from 'lucide-react';
import { ProcessedImage } from '../types';

interface ImageCardProps {
  image: ProcessedImage;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onCaptionChange: (id: string, caption: string) => void;
  onAiGenerate: (id: string, file: File) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  total,
  onRemove,
  onMove,
  onCaptionChange,
  onAiGenerate,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-video bg-slate-100 border-b border-slate-100">
        <img
          src={image.previewUrl}
          alt="Preview"
          className="w-full h-full object-contain p-2"
        />
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="p-2 bg-white/90 rounded-full hover:bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
            title="Move Earlier"
          >
            <ArrowUp size={18} />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            disabled={index === total - 1}
            className="p-2 bg-white/90 rounded-full hover:bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
            title="Move Later"
          >
            <ArrowDown size={18} />
          </button>
          <div className="w-px h-6 bg-white/40 mx-1" />
          <button
            onClick={() => onRemove(image.id)}
            className="p-2 bg-red-500/90 rounded-full hover:bg-red-500 text-white transform hover:scale-105 transition-all"
            title="Remove Image"
          >
            <X size={18} />
          </button>
        </div>

        {/* Page Number Badge */}
        <div className="absolute top-2 left-2 bg-slate-900/75 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
          Page {index + 1}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Type size={12} />
            Caption
          </label>
          <button
            onClick={() => onAiGenerate(image.id, image.file)}
            disabled={image.isAiLoading}
            className={`
              text-xs flex items-center gap-1.5 px-2 py-1 rounded-md font-medium transition-all
              ${image.isAiLoading 
                ? 'bg-indigo-50 text-indigo-400 cursor-wait' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }
            `}
          >
            <Wand2 size={12} className={image.isAiLoading ? 'animate-spin' : ''} />
            {image.isAiLoading ? 'Analyzing...' : 'Auto-Caption'}
          </button>
        </div>
        
        <textarea
          value={image.caption}
          onChange={(e) => onCaptionChange(image.id, e.target.value)}
          placeholder="Add a description for this page..."
          className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors h-20"
        />
      </div>
    </div>
  );
};