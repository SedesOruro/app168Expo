import numeral from 'numeral';

// ----------------------------------------------------------------------

export function fCurrency(number: unknown) {
    return numeral(number).format(Number.isInteger(number) ? '$0,0' : '$0,0.00').replace('$', 'Bs. ');
}

export function fPercent(number: number) {
    return numeral(number / 100).format('0.0%');
}

export function fNumber(number: any) {
    return numeral(number).format();
}

export function fShortenNumber(number: number) {
    return numeral(number).format('0.00a').replace('.00', '');
}

export function fData(number: any) {
    return numeral(number).format('0.0 b');
}

export function fCurrency2(numero: number, locale?: string): string {
    return numero.toLocaleString(locale??'de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
