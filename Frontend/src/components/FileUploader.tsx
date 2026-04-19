import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploaderProps {
  label: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: Record<string, string[]>;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  description,
  file,
  onFileSelect,
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
  },
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
      <div
        {...getRootProps()}
        className={cn(
          "relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center text-center",
          isDragActive ? "border-emerald-500 bg-emerald-500/5" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50",
          file ? "border-emerald-500/50 bg-emerald-500/5" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{file.name}</p>
              <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <Upload className="w-6 h-6 text-zinc-400 group-hover:text-zinc-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">Click or drag to upload</p>
              <p className="text-xs text-zinc-500 mt-1">{description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
