import { TokenType } from './TokenType';

export class Token {
    type: TokenType;
    lexeme: string;
    literal: any;
    line: number;
    col: number;

    constructor(type: TokenType, lexeme: string, literal: any, line: number, col: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.col = col;
    }

    toString(): string {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }

    errorString(): string {
        if (this.type === TokenType.EOF) {
            return 'end of file';
        }

        if (this.type.isSelfDescribing()) {
            return this.type.toString();
        }

        return `${this.type} \`${this.lexeme}\``;
    }
}
