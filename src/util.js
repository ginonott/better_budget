export function getDateRange(date) {
    let from = new Date(date.getFullYear(), date.getMonth(), 1);
    let to = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return { from, to };
}

/**
 * @description Test if d1 < d2
 *
 * @param {Date} d1
 * @param {Date} d2
 */
export function isDateBefore(d1, d2) {
    d1 = new Date(d1);
    d2 = new Date(d2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    return d1.getTime() < d2.getTime();
}