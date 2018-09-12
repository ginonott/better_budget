export function getDateRange(date) {
    let from = new Date(date.getFullYear(), date.getMonth(), 1);
    let to = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {from, to};
}