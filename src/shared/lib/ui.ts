const AVATAR_COLORS = [
    "#1F8A4C", "#2563EB", "#D97706", "#7C3AED",
    "#E11D48", "#0D9488", "#EA580C", "#0891B2",
];

const COVER_PALETTE: [string, string][] = [
    ["#d1fae5", "#6ee7b7"],
    ["#dbeafe", "#93c5fd"],
    ["#fef3c7", "#fcd34d"],
    ["#fce7f3", "#f9a8d4"],
    ["#ede9fe", "#c4b5fd"],
    ["#fee2e2", "#fca5a5"],
];

const GROUP_TINTS = [
    { bg: "#1F8A4C", ink: "#FFFFFF" },
    { bg: "#E0A32A", ink: "#FFFFFF" },
    { bg: "#2E7BC9", ink: "#FFFFFF" },
    { bg: "#D7456B", ink: "#FFFFFF" },
    { bg: "#7C5AD9", ink: "#FFFFFF" },
    { bg: "#D46A3A", ink: "#FFFFFF" },
];

function hashStr(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return Math.abs(h);
}

export function avatarColor(seed: string, offset = 0): string {
    return AVATAR_COLORS[(hashStr(seed) + offset) % AVATAR_COLORS.length];
}

export function coverColors(name: string): [string, string] {
    return COVER_PALETTE[hashStr(name) % COVER_PALETTE.length];
}

export function groupTint(name: string): { bg: string; ink: string } {
    let hash = 0;
    for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    return GROUP_TINTS[hash % GROUP_TINTS.length];
}

export function formatMoney(val: number | string, symbol: string): string {
    const n = typeof val === "string" ? parseFloat(val) : val;
    return `${symbol}${Math.abs(n).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
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
