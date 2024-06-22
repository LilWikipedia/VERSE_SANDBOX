export enum TokenType {
    // Punctuation
    LEFT_PAREN = "(",
    RIGHT_PAREN = ")",
    LEFT_BRACE = "{",
    RIGHT_BRACE = "}",
    LEFT_BRACKET = "[",
    RIGHT_BRACKET = "]",
    COMMA = ",",
    DOT = ".",
    SEMICOLON = ";",
    COLON = ":",
    QUESTION_MARK = "?",
    NEW_LINE = "\\n",

    // Math
    EQUALS = "=",
    PLUS = "+",
    MINUS = "-",
    STAR = "*",
    SLASH = "/",
    INFERRED_DECL = ":=",
    GREATER = ">",
    GREATER_EQUAL = ">=",
    LESS = "<",
    LESS_EQUAL = "<=",

    // Literals
    IDENTIFIER = "IDENTIFIER",
    STRING = "STRING",
    NUMBER_INT = "NUMBER_INT",
    NUMBER_FLOAT = "NUMBER_FLOAT",

    // Keywords
    AND = "AND",
    OR = "OR",
    NOT = "NOT",
    TRUE = "TRUE",
    FALSE = "FALSE",
    VAR = "VAR",
    RETURN = "RETURN",
    SELF = "SELF",
    IF = "IF",
    ELSE = "ELSE",
    FOR = "FOR",
    BREAK = "BREAK",

    CLASS = "CLASS",
    MODULE = "MODULE",

    // Effects
    TRANSACTS = "TRANSACTS",
    VARIES = "VARIES",
    COMPUTES = "COMPUTES",
    CONVERGES = "CONVERGES",

    // Effect specifiers
    SUSPENDS = "SUSPENDS",
    DECIDES = "DECIDES",

    // Access specifiers
    PUBLIC = "PUBLIC",
    INTERNAL = "INTERNAL",
    PROTECTED = "PROTECTED",
    PRIVATE = "PRIVATE",

    // Attributes
    OVERRIDE = "OVERRIDE",
    ABSTRACT = "ABSTRACT",
    FINAL = "FINAL",
    UNIQUE = "UNIQUE",

    // Reserved keywords
    CONTINUE = "CONTINUE",
    YIELD = "YIELD",

    // Block statements
    BLOCK = "BLOCK",
    SPAWN = "SPAWN",

    EOF = "EOF"
}

export namespace TokenType {
    const punctuationTypes = new Set<TokenType>([
        TokenType.LEFT_PAREN, TokenType.RIGHT_PAREN, TokenType.LEFT_BRACE, TokenType.RIGHT_BRACE,
        TokenType.LEFT_BRACKET, TokenType.RIGHT_BRACKET, TokenType.COMMA, TokenType.DOT,
        TokenType.SEMICOLON, TokenType.COLON, TokenType.QUESTION_MARK, TokenType.NEW_LINE,
        TokenType.EQUALS, TokenType.PLUS, TokenType.MINUS, TokenType.STAR, TokenType.SLASH,
        TokenType.INFERRED_DECL, TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL
    ]);

    const keywordTypes = new Set<TokenType>([
        TokenType.AND, TokenType.OR, TokenType.NOT, TokenType.TRUE, TokenType.FALSE,
        TokenType.VAR, TokenType.RETURN, TokenType.SELF, TokenType.IF, TokenType.ELSE,
        TokenType.FOR, TokenType.BREAK, TokenType.CLASS, TokenType.MODULE
    ]);

    export function isSelfDescribing(type: TokenType): boolean {
        return punctuationTypes.has(type) || keywordTypes.has(type);
    }

    export function toString(type: TokenType): string {
        if (keywordTypes.has(type)) {
            return `keyword \`${type.toLowerCase()}\``;
        }

        if (punctuationTypes.has(type)) {
            return `\`${type.toLowerCase()}\``;
        }

        return type.toLowerCase();
    }
}
