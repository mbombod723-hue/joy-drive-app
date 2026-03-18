import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useAppStore, type Language } from '../store/useStore';

interface LanguagePageProps {
  onBack: () => void;
}

export function LanguagePage({ onBack }: LanguagePageProps) {
  const { language, setLanguage } = useAppStore();
  
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] overflow-y-auto">
      <div className="p-4 border-b flex items-center gap-3 dark:border-gray-700">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Select Language</h1>
      </div>

      <div className="p-4 space-y-2">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code as Language);
              onBack();
            }}
            className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition-all ${
              language === lang.code
                ? 'border-green-500 bg-green-50 dark:bg-green-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-semibold">{lang.name}</span>
            </div>
            {language === lang.code && <Check className="w-6 h-6 text-green-600" />}
          </button>
        ))}
      </div>
    </div>
  );
}
