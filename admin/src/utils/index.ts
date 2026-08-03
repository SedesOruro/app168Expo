import { STORAGE_URL } from "config/app-config";
import { STORAGE_LOCAL } from "constants/enums";

export function normalizeText(text: string) {
    let result = text.replace(/^\s+|\s+$/g, '').toLowerCase();
    const from = 'ãàáäâèéëêìíïîõòóöôùúüûç·/_,:;';
    const to = 'aaaaaeeeeiiiiooooouuuuc------';
    for (let i = 0; i < from.length; i++) {
        result = result.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    return result
        .replace(/[^a-z0-9ñ -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export function getFileName(title: string, subtitle?: string) {
    const primaryTitle = `${normalizeText(title)}_`;
    const secondaryTitle = subtitle ? `${normalizeText(subtitle)}_` : '';
    const date = Date.now();
    const filename = `${primaryTitle}${secondaryTitle}${date}`;
    //const filename = `${primaryTitle}${secondaryTitle}`;
    return filename;
}

export function compareDates(date1: string, date2: string) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    // Compare the year, month, and day of both dates
    if (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate() &&
        d1.getHours() === d2.getHours() &&
        d1.getMinutes() === d2.getMinutes() &&
        d1.getSeconds() === d2.getSeconds()
    ) {
        return true;
    } else {
        return false;
    }
}


/**
 * Interpreta una cadena de texto y devuelve su valor numérico con un máximo de 2 dígitos.
 * Es útil para obtener números válidos desde un campo de entrada de texto.
 * @param {String} value - Cadena de texto.
 * @return {number}
 */
export const sanitizeStringToNumber = (value: string | number): string => {
    const normalizedValue = removeNonNumericChars(String(value));
    const numericValue = parseFloat(normalizedValue);
    if (isNaN(numericValue)) return '0';
    return `${roundTo(numericValue, 2)}`;
};

const removeNonNumericChars = (text: string): string => {
    return text
        .trim()
        .replace(/,/g, '.')
        .replace(/[^\d.-]/g, '');
};

const roundTo = (value: number, places = 2): number => {
    const power = Math.pow(10, places);
    return Math.round(value * power) / power;
};

export const getAvatarURL = (avatar: string) => avatar ? avatar.endsWith('.jpg') ?
                                                 `${STORAGE_URL}/${avatar}`
                                                : `${STORAGE_LOCAL}/${avatar}`:`${STORAGE_LOCAL}/avatar_default.png`;

export const generateRandomString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}
