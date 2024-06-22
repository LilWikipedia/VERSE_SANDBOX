import { VerseLang } from '../../VerseLang';
import { VFloat } from '../types/VFloat';
import { VInteger } from '../types/VInteger';
import { Token } from './Token';
import { TokenType } from './TokenType';

export class VerseScanner {
    private source: string;
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;
    private col: number = 1;

    constructor(source: string) {
        this.source = source;
    }

    scanTokens(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.addToken(TokenType.EOF);
        return this.tokens;
    }

    private scanToken() {
        const c = this.advance();

        switch (c) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case '[': this.addToken(TokenType.LEFT_BRACKET); break;
            case ']': this.addToken(TokenType.RIGHT_BRACKET); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case ':': this.addToken(this.advanceIf('=') ? TokenType.INFERRED_DECL : TokenType.COLON); break;
            case '?': this.addToken(TokenType.QUESTION_MARK); break;
            case '\n':
                this.addToken(TokenType.NEW_LINE);
                this.newLine();
                break;
            case '=': this.addToken(TokenType.EQUALS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '/': this.addToken(TokenType.SLASH); break;
            case '>': this.addToken(this.advanceIf('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
            case '<': this.addToken(this.advanceIf('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
            case '"': this.string(); break;
            case '#': this.advanceTillEol(); break;
            case ' ':
            case '\t':
            case '\r':
                // Ignore whitespace
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isIdentifierStart(c)) {
                    this.identifier();
                } else {
                    this.error(`Unexpected character: '${c}'`);
                }
                break;
        }
    }

    private number() {
        let isFloat = false;
        while (this.isDigit(this.peek())) {
            this.advance();
        }

        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            isFloat = true;
            this.advance();

            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }

        const text = this.source.substring(this.start, this.current);
        if (isFloat) {
            this.addToken(TokenType.NUMBER_FLOAT, VFloat.parseFloat(text));
        } else {
            this.addToken(TokenType.NUMBER_INT, VInteger.parseInt(text));
        }
    }

    private identifier() {
        while (this.isIdentifierPart(this.peek())) {
            this.advance();
        }

        const text = this.source.substring(this.start, this.current);
        let type = TokenType.IDENTIFIER;
        switch (text) {
            case 'and': type = TokenType.AND; break;
            case 'or': type = TokenType.OR; break;
            case 'not': type = TokenType.NOT; break;
            case 'true': type = TokenType.TRUE; break;
            case 'false': type = TokenType.FALSE; break;
            case 'var': type = TokenType.VAR; break;
            case 'return': type = TokenType.RETURN; break;
            case 'self': type = TokenType.SELF; break;
            case 'if': type = TokenType.IF; break;
            case 'else': type = TokenType.ELSE; break;
            case 'for': type = TokenType.FOR; break;
            case 'block': type = TokenType.BLOCK; break;
            case 'spawn': type = TokenType.SPAWN; break;
            case 'break': type = TokenType.BREAK; break;
            case 'class': type = TokenType.CLASS; break;
            case 'module': type = TokenType.MODULE; break;
        }

        this.addToken(type);
    }

    private string() {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.newLine();
            }
            this.advance();
        }

        if (this.isAtEnd()) {
            this.error("Unterminated string");
            return;
        }

        this.advance();
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private newLine() {
        this.line++;
        this.col = 1;
    }

    private isIdentifierStart(c: string): boolean {
        return /[a-zA-Z_]/.test(c);
    }

    private isIdentifierPart(c: string): boolean {
        return /[a-zA-Z0-9_]/.test(c);
    }

    private peek(): string {
        if (this.isAtEnd()) {
            return '\0';
        }
        return this.source.charAt(this.current);
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) {
            return '\0';
        }
        return this.source.charAt(this.current + 1);
    }

    private advance(): string {
        this.col++;
        return this.source.charAt(this.current++);
    }

    private advanceTillEol() {
        while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
        }
    }

    private advanceIf(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) !== expected) return false;

        this.current++;
        return true;
    }

    private addToken(type: TokenType, literal: any = null) {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line, this.col - (this.current - this.start)));
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private error(message: string) {
        VerseLang.syntaxError(this.line, this.col, message);
    }

    private isDigit(c: string): boolean {
        return /[0-9]/.test(c);
    }
}
