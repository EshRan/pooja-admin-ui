export const getS3ImageUrl = (key?: string | null): string | null => {
    if (!key) return null;
    if (key.startsWith('http')) return key;
    return `https://rituals-basket.s3.ap-south-1.amazonaws.com/${key}`;
};

export const getS3ImageName = (key?: string | null): string => {
    if (!key) return '';
    try {
        const url = new URL(key);
        const parts = url.pathname.split('/');
        return parts[parts.length - 1] || key;
    } catch {
        const parts = key.split('/');
        return parts[parts.length - 1] || key;
    }
};
