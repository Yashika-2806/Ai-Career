import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Check } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange: (base64Image: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImage,
  onImageChange,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-3">
        Profile Picture (Optional)
      </label>
      
      {preview ? (
        <div className="relative group">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-500/50 mx-auto">
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleClick}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition"
              title="Change picture"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition"
              title="Remove picture"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            <span>Picture uploaded</span>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-40 h-40 mx-auto border-2 border-dashed rounded-full flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-400 bg-purple-500/10 scale-105'
              : 'border-white/20 bg-white/5 hover:border-purple-400 hover:bg-white/10'
          }`}
        >
          <Upload className={`w-10 h-10 mb-2 ${isDragging ? 'text-purple-400' : 'text-gray-400'}`} />
          <span className="text-sm text-gray-400 text-center px-4">
            {isDragging ? 'Drop here' : 'Click or drag image'}
          </span>
          <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500 text-center mt-3">
        Best results with square images (1:1 ratio)
      </p>
    </div>
  );
};
