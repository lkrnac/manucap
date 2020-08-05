export interface Replacement {
    value: string;
}

export interface Match {
    message: string;
    replacements: Replacement[];
    offset: number;
    length: number;
}

export interface SpellCheck {
    matches: Match[];
}
