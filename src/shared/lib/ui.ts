const AVATAR_COLORS = [
    "#1F8A4C", "#2563EB", "#D97706", "#7C3AED",
    "#E11D48", "#0D9488", "#EA580C", "#0891B2",
];

export function avatarColor(seed: string, offset = 0): string {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[(Math.abs(h) + offset) % AVATAR_COLORS.length];
}

export function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return "az önce";
    if (mins < 60) return `${mins} dk önce`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} saat önce`;
    if (hrs < 48) return "dün";
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} gün önce`;
    return `${Math.floor(days / 7)} hafta önce`;
}
