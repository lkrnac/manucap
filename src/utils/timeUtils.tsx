export const padWithZeros = (value: number, length: number): string => {
    return value.toString().padStart(length, "0");
};

export const removeNonNumeric = (value: string): string => {
    return value.replace(/\D/g, "");
};
