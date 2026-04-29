import { localeCookieName } from './config';

export const setUserLocale = (locale: string) => {
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000`;
    window.location.reload();
};
