export interface Replacement {
    value: string;
}

export interface SpellCheckHash {
    cueId: string;
    keyword: string;
    //
    //
    // constructor(cueId: string, context: SpellCheckContext) {
    //     this.cueId= cueId;
    //     this.context = context;
    // }
}


export interface SpellCheckContext {
    length: number;
    offset: number;
    text: string;
}

export interface Match {
    context: SpellCheckContext;
    message: string;
    replacements: Replacement[];
    offset: number;
    length: number;
}

export interface SpellCheck {
    matches: Match[];
}
