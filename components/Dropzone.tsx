import React, { useCallback, useState } from 'react';
import { Upload, FileImage } from 'lucide-react';

interface DropzoneProps {
  onFilesDropped: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesDropped }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file: File) => 
      file.type.startsWith('image/')
    );
    
    if (droppedFiles.length > 0) {
      onFilesDropped(droppedFiles);
    }
  }, [onFilesDropped]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter((file: File) => 
        file.type.startsWith('image/')
      );
      onFilesDropped(selectedFiles);
    }
    // Reset value to allow selecting the same file again if needed
    e.target.value = '';
  }, [onFilesDropped]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer border-2 border-dashed rounded-xl p-10 transition-all duration-300
        flex flex-col items-center justify-center text-center
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className={`
        p-4 rounded-full mb-4 transition-colors duration-300
        ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500'}
      `}>
        {isDragging ? <FileImage size={32} /> : <Upload size={32} />}
      </div>
      
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        {isDragging ? 'Drop images here' : 'Upload Images'}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">
        Drag & drop your images here, or click to browse. Supported formats: JPG, PNG, WEBP.
      </p>
    </div>
  );
};