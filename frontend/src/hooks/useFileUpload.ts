import { useState } from 'react';
import { soundEffects } from '../utils/audio';

export interface AttachedFileState {
  name: string;
  content?: string;
  base64?: string;
  mimeType: string;
  size: number;
}

interface UseFileUploadOptions {
  onFileProcessed?: (file: AttachedFileState) => void;
  onError?: (msg: string) => void;
}

export function useFileUpload(options?: UseFileUploadOptions) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = (file: File) => {
    const fileNameLower = file.name.toLowerCase();

    // Security check: block executables, scripts, and potentially malicious files
    const dangerousExtensions = [
      '.exe',
      '.bat',
      '.sh',
      '.js',
      '.vbs',
      '.cmd',
      '.scr',
      '.msi',
      '.pif',
      '.application',
      '.ps1',
    ];
    if (dangerousExtensions.some((ext) => fileNameLower.endsWith(ext))) {
      soundEffects.playCaution();
      options?.onError?.('Security Alert: This file type is not allowed.');
      return;
    }

    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv'];

    // Check for video file attempt
    if (
      videoExtensions.some((ext) => fileNameLower.endsWith(ext)) ||
      file.type.startsWith('video/')
    ) {
      soundEffects.playCaution();
      options?.onError?.(
        'Video analysis is coming soon! Please drop your script, synopsis, treatment, or email for now.',
      );
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      soundEffects.playCaution();
      options?.onError?.('Security Alert: File is too large. Please upload files under 10MB.');
      return;
    }

    setIsProcessing(true);
    const mimeType =
      file.type || (fileNameLower.endsWith('.pdf') ? 'application/pdf' : 'text/plain');

    if (mimeType.startsWith('image/')) {
      // Image cropping/resizing via Canvas
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX_DIMENSION = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL(mimeType, 0.8);
            const base64Data = dataUrl.split(',')[1];
            
            soundEffects.playClick();
            options?.onFileProcessed?.({
              name: file.name,
              base64: base64Data,
              mimeType,
              size: file.size,
            });
            setIsProcessing(false);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    } else if (mimeType.startsWith('application/pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1] || result;
        
        soundEffects.playClick();
        options?.onFileProcessed?.({
          name: file.name,
          base64: base64Data,
          mimeType,
          size: file.size,
        });
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } else {
      // Handle as text document
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        soundEffects.playClick();
        options?.onFileProcessed?.({
          name: file.name,
          content,
          mimeType,
          size: file.size,
        });
        setIsProcessing(false);
      };
      reader.readAsText(file);
    }
  };

  return {
    processFile,
    isProcessing,
  };
}
