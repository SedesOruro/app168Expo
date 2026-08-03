import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
// ----------------------------------------------------------------------

export function fDate(date: string | number | Date) {
    return format(new Date(date), 'dd MMMM yyyy');
}

export function fDateTime(date: string | number | Date) {
    return format(new Date(date), 'dd MMM yyyy', { locale: es });
}

export function fDateTimeSuffix(date: string | number | Date) {
    return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fToNow(date: string | number | Date) {
    return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: es
    });
}
