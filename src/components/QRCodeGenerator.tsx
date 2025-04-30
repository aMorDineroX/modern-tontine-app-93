import React from 'react';
import { QrCode } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

export default function QRCodeGenerator({ value, size = 200 }: QRCodeGeneratorProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div 
          className="flex items-center justify-center bg-gray-100" 
          style={{ width: size, height: size }}
        >
          <QrCode size={size / 2} className="text-gray-800" />
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {value}
      </p>
    </div>
  );
}
