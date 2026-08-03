import * as yup from 'yup';
import { format as formatParse, formatISO, parse as dateParse, parseISO as dateParseISO, isValid as isDateValid, isAfter, isBefore } from 'date-fns';

export const dateTest = (format: string, message?: string): yup.TestConfig => ({
    name: 'is-date',
    message: message || 'El formato no es válido',
    test: (value) => {
        if (!value) return true;
        const dateString = String(value);
        const parsedDate = dateParse(dateString, "EEE MMM dd yyyy HH:mm:ss 'GMT'xxxx '(hora de Bolivia)'", new Date());

        return isDateValid(parsedDate);
    }
});

export const afterDateTest = (initialDateValue: string, format: string, message?: string): yup.TestConfig => ({
    name: 'is-after-date',
    message: message || 'Debe ser posterior a la fecha de inicio',
    test: (value) => {
        if (!value) return true;
        const date = dateParse(initialDateValue, "EEE MMM dd yyyy HH:mm:ss 'GMT'xxxx '(hora de Bolivia)'", new Date());
        const dateToCompare = dateParse(String(value), "EEE MMM dd yyyy HH:mm:ss 'GMT'xxxx '(hora de Bolivia)'", new Date());
        
        return !isAfter(date, dateToCompare);
    }
});

export const beforeDateTest = (finalDateValue: string, format: string, message?: string): yup.TestConfig => ({
    name: 'is-before-date',
    message: message || 'Debe ser anterior a la fecha de finalización',
    test: (value) => {
        if (!value) return true;
        const date = dateParse(finalDateValue, format, new Date());
        const dateToCompare = dateParse(String(value), format, new Date());
        return !isBefore(date, dateToCompare);
    }
});

export const isEmailValidTest = (): yup.TestConfig => ({
    name: 'is-email-valid',
    message: 'Debe ser un email válido',
    test: (value) => {
        if (!value) return true;
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(String(value));
    }
});

export const isNumberValidTest = (mayorIgualQue?: number, menorIgualQue?: number): yup.TestConfig => ({
    name: 'is-number-valid',
    message: `Debe ser un número${
        typeof mayorIgualQue !== 'undefined' && typeof menorIgualQue !== 'undefined'
            ? ' entre ' + mayorIgualQue + ' y ' + menorIgualQue
            : typeof mayorIgualQue !== 'undefined'
            ? ' mayor o igual a ' + mayorIgualQue
            : typeof menorIgualQue !== 'undefined'
            ? ' menor o igual a ' + menorIgualQue
            : ''
    }`,
    test: (value) => {
        if (!value) return true;
        const numberSafe = Number(value);
        if (isNaN(numberSafe)) return false;
        if (typeof mayorIgualQue !== 'undefined' && typeof menorIgualQue !== 'undefined') return numberSafe >= mayorIgualQue && numberSafe <= menorIgualQue;
        if (typeof mayorIgualQue !== 'undefined') return numberSafe >= mayorIgualQue;
        if (typeof menorIgualQue !== 'undefined') return numberSafe <= menorIgualQue;
        return true;
    }
});

export const isURLValidTest = (): yup.TestConfig => ({
    name: 'is-url-valid',
    message: 'El enlace no corresponde a un recurso válido. Formato de Ej.: https://www.youtube.com/watch?v=SG9j7XuiZdk',
    test: (value: any | null) => {
        try {
            if (!value) return true;
            if (!/^(ftp|http|https):\/\/[^ "]+$/.test(String(value))) return false;
            if (value.indexOf('youtube.com') === -1) return true;
            const text = String(value);
            const youtubeCode = text.split('v=')[1].substring(0, 11);
            return youtubeCode.length === 11;
        } catch (err) {
            return false;
        }
    }
});

export const isPhoneNumberValidTest = (): yup.TestConfig => ({
    name: 'is-phone-valid',
    message: 'Debe ser un número de teléfono válido',
    test: (value) => {
        if (!value) return true;
        const rePhoneNumber = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/;
        return rePhoneNumber.test(String(value));
    }
});
