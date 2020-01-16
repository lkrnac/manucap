export const padWithZeros = (value: number, length: number): string => {
    return value.toString().padStart(length, "0");
};

export const removeNonNumeric = (value: string): string => {
    return value.replace(/\D/g, "");
};

export interface TimeInUnits {
    minutes: number;
    minutesInSeconds: number;
    seconds: number;
    millis: number;
}

export const getTimeInUnits = (timeInSeconds: number): TimeInUnits => {
    const minutes = Math.floor(timeInSeconds / 60);
    const minutesInSeconds = minutes * 60;
    const seconds = Math.floor(timeInSeconds - minutesInSeconds);
    const millis = Math.round((timeInSeconds - seconds - minutesInSeconds) * 1000);
    return {
        minutes: minutes,
        minutesInSeconds: minutesInSeconds,
        seconds: seconds,
        millis: millis
    } as TimeInUnits;
};
