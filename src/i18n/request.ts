import { getRequestConfig } from 'next-intl/server';
import { headers, cookies } from 'next/headers';
import { locales, defaultLocale, localeCookieName } from './config';

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(localeCookieName)?.value;

    if (cookieLocale && locales.includes(cookieLocale as any)) {
        return {
            locale: cookieLocale,
            timeZone: 'Europe/Istanbul',
            messages: (await import(`../../messages/${cookieLocale}.json`)).default
        };
    }

    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');

    let locale = acceptLanguage?.split(',')[0]?.split('-')[0] || defaultLocale;

    if (!locales.includes(locale as any)) {
        locale = defaultLocale;
    }

    return {
        locale,
        timeZone: 'Europe/Istanbul',
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
