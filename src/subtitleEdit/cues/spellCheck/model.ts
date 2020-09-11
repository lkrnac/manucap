export interface Replacement {
    value: string;
}

export interface SpellCheckHash {
    cueId: string;
    keyword: string;
    ruleId: string;
    //
    //
    // constructor(cueId: string, context: SpellCheckContext) {
    //     this.cueId= cueId;
    //     this.context = context;
    // }
}


export interface SpellcheckRule {
    id: string;
}
export interface SpellcheckContext {
    length: number;
    offset: number;
    text: string;
}

export interface Match {
    context: SpellcheckContext;
    message: string;
    replacements: Replacement[];
    offset: number;
    length: number;
    rule: SpellcheckRule
}

export interface SpellCheck {
    matches: Match[];
}
