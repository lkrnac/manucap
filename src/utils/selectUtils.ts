export const getNumberArrayByRange = (start = 0, limit = 1) => {
    return Array.from({length: (limit - start) + 1}).map((_value, index) => {
        return start + index;
    });
};
