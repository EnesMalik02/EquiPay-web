export const locales = ['tr', 'en'] as const;
export const defaultLocale = 'tr';
export const localeCookieName = 'NEXT_LOCALE';

export type Locale = (typeof locales)[number];
