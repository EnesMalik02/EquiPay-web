'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { localeCookieName, type Locale } from './config';

type LocaleContextType = {
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

export const useLocaleSwitch = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocaleSwitch must be used within LocaleProvider');
  return ctx;
};

async function loadMessages(locale: Locale) {
  return (await import(`../../messages/${locale}.json`)).default;
}

export function LocaleProvider({
  children,
  initialLocale,
  initialMessages,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialMessages: Record<string, unknown>;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState(initialMessages);

  const setLocale = async (newLocale: Locale) => {
    if (newLocale === locale) return;
    const newMessages = await loadMessages(newLocale);
    document.cookie = `${localeCookieName}=${newLocale}; path=/; max-age=31536000`;
    setMessages(newMessages);
    setLocaleState(newLocale);
  };

  return (
    <LocaleContext.Provider value={{ setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Istanbul">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
