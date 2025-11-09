"use client";

import { useState } from 'react';

type ContactModalProps = {
  beekeeper: {
    name: string;
    phone?: string;
    email?: string;
  };
  onClose: () => void;
};

export default function ContactModal({ beekeeper, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState<'phone' | 'email' | null>(null);

  const copyToClipboard = (text: string, type: 'phone' | 'email') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Неуспешно копиране');
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Свържете се с {beekeeper.name}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Затвори"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-6 space-y-4">
          {beekeeper.phone && (
            <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <div className="text-sm text-gray-600 mb-2 font-medium">📞 Телефон:</div>
              <div className="text-lg font-bold text-gray-900 mb-3 font-mono">
                {beekeeper.phone}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(beekeeper.phone!, 'phone')}
                  className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 text-sm font-medium transition-colors"
                >
                  {copied === 'phone' ? '✓ Копирано' : '📋 Копирай'}
                </button>
                <a
                  href={`tel:${beekeeper.phone}`}
                  className="flex-1 px-3 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 text-sm text-center font-medium transition-colors"
                >
                  📞 Обади се
                </a>
              </div>
            </div>
          )}

          {beekeeper.email && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="text-sm text-gray-600 mb-2 font-medium">✉️ Имейл:</div>
              <div className="text-base font-semibold text-gray-900 mb-3 break-all">
                {beekeeper.email}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(beekeeper.email!, 'email')}
                  className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
                >
                  {copied === 'email' ? '✓ Копирано' : '📋 Копирай'}
                </button>
                <a
                  href={`mailto:${beekeeper.email}`}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 text-sm text-center font-medium transition-colors"
                >
                  ✉️ Изпрати
                </a>
              </div>
            </div>
          )}

          {!beekeeper.phone && !beekeeper.email && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">
                Пчеларът не е споделил контактна информация
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
}

