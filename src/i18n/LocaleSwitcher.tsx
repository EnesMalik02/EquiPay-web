'use client';

import { useLocale } from 'next-intl';
import { useLocaleSwitch } from './LocaleProvider';
import { locales, type Locale } from './config';

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const currentLocale = useLocale() as Locale;
  const { setLocale } = useLocaleSwitch();

  return (
    <div className={`flex gap-1 ${className ?? ''}`}>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
          style={{
            background: currentLocale === loc ? 'var(--primary)' : 'var(--surface-muted, rgba(0,0,0,0.06))',
            color: currentLocale === loc ? '#fff' : 'var(--text-secondary)',
          }}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
