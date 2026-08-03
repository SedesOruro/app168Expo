// ----------------------------------------------------------------------
export function descendingComparator(a: { [x: string]: number }, b: { [x: string]: number }, orderBy: string | number) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

export function getComparator(order: string, orderBy: any) {
    return order === 'desc' ? (a: any, b: any) => descendingComparator(a, b, orderBy) : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

export function applySortFilter(array: any[], comparator: (arg0: any, arg1: any) => any, query: string) {
    const stabilizedThis = array.map((el: any, index: any) => [el, index]);
    stabilizedThis.sort((a: number[], b: number[]) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    if (query) {
        return array.filter((_user) => _user.name.toLowerCase().includes(query.toLowerCase()));
    }
    return stabilizedThis.map((el: any[]) => el[0]);
}
