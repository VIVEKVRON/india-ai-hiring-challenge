'use client';

import React, { useCallback, useRef } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DropzoneProps {
  label: string;
  accept?: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export function Dropzone({ label, accept, file, onFileSelect, className }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        onFileSelect(droppedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors',
        file
          ? 'border-zinc-400 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/50'
          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      {file ? (
        <div className="flex flex-col items-center text-center space-y-3 w-full">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
            <FileIcon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
              {file.name}
            </p>
            <p className="text-xs text-zinc-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="absolute top-2 right-2 p-1 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div 
          className="flex flex-col items-center text-center space-y-3 cursor-pointer w-full"
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <UploadCloud className="h-6 w-6 text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {label}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Drag & drop or click to upload
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
