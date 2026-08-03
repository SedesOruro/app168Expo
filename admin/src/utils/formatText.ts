export function truncateText(text: string, max: number = 20) {
    if (text.length <= max) return text;
    const middle = parseInt(`${max / 2}`);
    const a = text.substring(0, middle);
    const b = text.substring(text.length - middle);
    const truncated = `${a} ... ${b}`;
    return truncated;
}

export function truncateTextLong(text: string, max: number = 20) {
    if (text.length <= max) return text;
    const a = text.substring(0, max);
    const truncated = `${a} ...`;
    return truncated;
}
