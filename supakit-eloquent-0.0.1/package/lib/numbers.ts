/**
 * Returns a percentage from a numerator and denominator
 * @param num the numerator
 * @param total the denominator
 * @param precision the number of decimal places to round to
 * @returns a string representing the percentage
 */
export function percent(num: number, total: number, precision: number = 0): string {
    return (num / total * 100).toFixed(precision);
}