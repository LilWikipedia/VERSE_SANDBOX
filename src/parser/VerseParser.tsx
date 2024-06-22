import { VerseLang } from '../../VerseLang';
import { AstBlock, AstExpressionStmt, AstStmt } from '../ast/types';
import { AstFunctionDecl, AstVariableDecl } from '../ast/types/decl';
import { AstParameter } from '../ast/types/decl/AstParameter';
import { AstType } from '../ast/types/decl/AstType';
import { AstAssignExpr, AstBinaryExpr, AstCallExpr, AstExpr, AstGetExpr, AstIfExpr, AstLiteralExpr, AstUnaryExpr, AstVariableExpr } from '../ast/types/expr';
import { Token } from '../lexer/Token';
import { TokenType } from '../lexer/TokenType';

const ALLOWED_AFTER_DECL_IDENTIFIER: TokenType[] = [TokenType.COLON, TokenType.LESS, TokenType.LEFT_PAREN, TokenType.INFERRED_DECL];
const VALID_STATEMENT_ENDS: Set<TokenType> = new Set([TokenType.RIGHT_BRACE, TokenType.SEMICOLON, TokenType.NEW_LINE, TokenType.EOF]);

export class VerseParser {
    private debug: boolean;
    private tokens: Token[];
    private current: number = 0;
    private backtrackTo: number = -1;

    constructor(debug: boolean, tokens: Token[]) {
        this.debug = debug;
        this.tokens = tokens;
    }

    parse(): AstStmt[] {
        const statements: AstStmt[] = [];
        while (!this.eatBlankLines()) {
            statements.push(this.declaration());
            this.advanceExpressionEnd();
        }
        return statements;
    }

    private anonymousBlock(): AstStmt[] {
        const statements: AstStmt[] = [];
        while (!this.eatBlankLines()) {
            if (this.peekIs(TokenType.RIGHT_BRACE)) {
                break;
            }
            statements.push(this.declaration());
            this.advanceExpressionEnd();
        }
        this.advanceExpectToken(TokenType.RIGHT_BRACE, "after block");
        return statements;
    }

    private declaration(): AstStmt {
        try {
            const mutableVar = this.advanceIfAny(TokenType.VAR);
            if (this.peekExpectConditional(mutableVar, TokenType.IDENTIFIER) && this.peekNextIsAny(ALLOWED_AFTER_DECL_IDENTIFIER)) {
                try {
                    this.markBacktrack();

                    const name = this.advanceExpectToken(TokenType.IDENTIFIER, "in declaration");
                    const specifiers = this.maybeSpecifiers("in declaration");

                    if (mutableVar || this.peekIsAny(TokenType.COLON, TokenType.INFERRED_DECL)) {
                        return this.variableDecl(mutableVar, name, specifiers);
                    }

                    if (!this.peekIs(TokenType.LEFT_PAREN)) {
                        throw this.error("Expected function definition but found " + this.peek());
                    }

                    if (this.peekAfterTokenIs(TokenType.RIGHT_PAREN, TokenType.COLON)) {
                        return this.functionDecl(name, specifiers);
                    } else {
                        this.backtrack();
                    }
                } finally {
                    this.unmarkBacktrack();
                }
            }
            return this.statement();
        } catch (error) {
            if (this.debug) {
                console.error(error);
            }
            this.synchronize();
            return null;
        }
    }

    private peekAfterTokenIs(untilToken: TokenType, isToken: TokenType): boolean {
        let advance = 1;
        while (true) {
            const peek = this.peek(advance);
            if (peek === null) {
                return false;
            }

            if (VALID_STATEMENT_ENDS.has(peek.type)) {
                return false;
            }

            if (peek.type === untilToken) {
                const afterToken = this.peek(advance + 1);
                return afterToken !== null && afterToken.type === isToken;
            }

            advance++;
        }
    }

    private markBacktrack() {
        this.backtrackTo = this.current;
    }

    private unmarkBacktrack() {
        this.backtrackTo = -1;
    }

    private backtrack() {
        if (this.backtrackTo === -1) {
            throw new Error("Tried to backtrack but no backtrack point was set");
        }
        this.updateCurrentPosition(this.backtrackTo);
    }

    private functionDecl(name: Token, specifiers: AstType[]): AstFunctionDecl {
        this.advanceExpectToken(TokenType.LEFT_PAREN, "in function declaration");

        const parameters: AstParameter[] = [];
        if (!this.peekIs(TokenType.RIGHT_PAREN)) {
            do {
                const parameterName = this.advanceExpectToken(TokenType.IDENTIFIER, "in parameter declaration");
                this.advanceExpectToken(TokenType.COLON, "in parameter declaration");
                const parameterType = this.type("in parameter declaration");
                parameters.push(new AstParameter(parameterName, parameterType));
            } while (this.advanceIfAny(TokenType.COMMA));
        }

        this.advanceExpectToken(TokenType.RIGHT_PAREN, "in function declaration");

        const effects = this.maybeSpecifiers("in function declaration");

        this.advanceExpectToken(TokenType.COLON, "in function declaration");
        const type = this.type("in function declaration");

        let body: AstStmt[];
        if (this.peekIs(TokenType.EQUALS)) {
            this.advanceExpectToken(TokenType.EQUALS, "in function declaration");
            this.advanceExpectToken(TokenType.LEFT_BRACE);
            body = this.anonymousBlock();
        } else {
            body = null;
        }

        return new AstFunctionDecl(name, specifiers, effects, parameters, type, body);
    }

    private variableDecl(mutableVar: boolean, identifier: Token, specifiers: AstType[]): AstVariableDecl {
        if (mutableVar && this.peekIs(TokenType.INFERRED_DECL)) {
            throw this.error("Missing type for `^` or `var` definition");
        }

        let type: AstType = null;

        if (!this.advanceIfAny(TokenType.INFERRED_DECL)) {
            this.advanceExpectToken(TokenType.COLON, "in variable definition");
            type = this.type("in variable definition");
            this.advanceExpectToken(TokenType.EQUALS, "in variable definition");
        }

        const initializer = this.expression();
        return new AstVariableDecl(identifier, specifiers, type, initializer, mutableVar);
    }

    private maybeSpecifiers(context: string): AstType[] {
        const specifiers: AstType[] = [];
        if (this.advanceIfAny(TokenType.LESS)) {
            do {
                specifiers.push(this.type("specifier type", ""));
                this.advanceExpectToken(TokenType.GREATER, "after specifier type");
            } while (this.advanceIfAny(TokenType.LESS));
        }
        return specifiers;
    }

    private type(context: string): AstType;
    private type(tokenName: string | null, context: string): AstType;
    private type(tokenName: string | null = null, context: string): AstType {
        tokenName = tokenName || "type";

        let array = false;
        let map = false;
        let keyType: AstType = null;

        if (this.advanceIfAny(TokenType.LEFT_BRACKET)) {
            if (!this.peekIs(TokenType.RIGHT_BRACKET)) {
                map = true;
                keyType = this.type("in map declaration");
            } else {
                array = true;
            }
            this.advanceExpectToken(TokenType.RIGHT_BRACKET, "in type declaration");
        }

        const optional = this.advanceIfAny(TokenType.QUESTION_MARK);
        const name = this.advanceExpectToken(tokenName, TokenType.IDENTIFIER, context);
        return new AstType(name, array, map, keyType, optional);
    }

    private statement(): AstStmt {
        if (this.advanceThroughIfConsecutive(TokenType.BLOCK, TokenType.LEFT_BRACE)) {
            return new AstBlock(this.anonymousBlock());
        }
        return this.expressionStmt();
    }

    private expressionStmt(): AstStmt {
        const value = this.expression();
        return new AstExpressionStmt(value);
    }

    private advanceExpressionEnd() {
        if (this.peekIs(TokenType.RIGHT_BRACE)) {
            return;
        }
        this.advanceExpectAny("Unexpected " + this.peek() + " following expression", TokenType.SEMICOLON, TokenType.NEW_LINE, TokenType.EOF);
    }

    private expression(): AstExpr {
        return this.assignment();
    }

    private assignment(): AstExpr {
        const expr = this.ifExpr();

        if (this.advanceIfAny(TokenType.EQUALS)) {
            const value = this.assignment();

            if (expr instanceof AstVariableExpr) {
                const name = expr.name;
                return new AstAssignExpr(name, value);
            }

            throw this.error("Invalid assignment target");
        }

        return expr;
    }

    private ifExpr(): AstExpr {
        if (this.advanceIfAny(TokenType.IF)) {
            this.advanceExpectToken(TokenType.LEFT_PAREN, "in if statement");
            const expr = this.expression();
            this.advanceExpectToken(TokenType.RIGHT_PAREN, "in if statement");

            this.advanceExpectToken(TokenType.LEFT_BRACE, "in if statement");
            const thenBranch = this.anonymousBlock();

            let elseBranch: AstStmt[] = [];
            if (this.advanceIfAny(TokenType.ELSE)) {
                this.advanceExpectToken(TokenType.LEFT_BRACE, "in else statement");
                elseBranch = this.anonymousBlock();
            }

            return new AstIfExpr(expr, thenBranch, elseBranch);
        }

        return this.equality();
    }

    private equality(): AstExpr {
        let expr = this.comparison();

        while (this.advanceIfAny(TokenType.EQUALS)) {
            const operator = this.peekPrevious();
            const right = this.comparison();
            expr = new AstBinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private comparison(): AstExpr {
        let expr = this.addition();

        while (this.advanceIfAny(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            const operator = this.peekPrevious();
            const right = this.addition();
            expr = new AstBinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private addition(): AstExpr {
        let expr = this.multiplication();

        while (this.advanceIfAny(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.peekPrevious();
            const right = this.multiplication();
            expr = new AstBinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private multiplication(): AstExpr {
        let expr = this.unary();

        while (this.advanceIfAny(TokenType.STAR, TokenType.SLASH)) {
            const operator = this.peekPrevious();
            const right = this.unary();
            expr = new AstBinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private unary(): AstExpr {
        if (this.advanceIfAny(TokenType.MINUS, TokenType.NOT)) {
            const operator = this.peekPrevious();
            const right = this.unary();
            return new AstUnaryExpr(operator, right);
        }

        return this.call();
    }

    private call(): AstExpr {
        let expr = this.primary();

        while (true) {
            if (this.advanceIfAny(TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr);
            } else if (this.advanceIfAny(TokenType.DOT)) {
                const name = this.advanceExpectToken(TokenType.IDENTIFIER);
                expr = new AstGetExpr(expr, name);
            } else {
                break;
            }
        }

        return expr;
    }

    private finishCall(callee: AstExpr): AstExpr {
        const args: AstExpr[] = [];

        if (!this.peekIs(TokenType.RIGHT_PAREN)) {
            do {
                if (args.length >= 255) {
                    throw this.error("Cannot have more than 255 arguments");
                }
                args.push(this.expression());
            } while (this.advanceIfAny(TokenType.COMMA));
        }

        this.advanceExpectToken(TokenType.RIGHT_PAREN, "after function arguments");

        return new AstCallExpr(callee, args);
    }

    private primary(): AstExpr {
        if (this.advanceIfAny(TokenType.FALSE)) {
            return new AstLiteralExpr(false);
        }

        if (this.advanceIfAny(TokenType.TRUE)) {
            return new AstLiteralExpr(true);
        }

        if (this.advanceIfAny(TokenType.NUMBER_INT, TokenType.NUMBER_FLOAT, TokenType.STRING)) {
            return new AstLiteralExpr(this.peekPrevious().literal);
        }

        if (this.advanceIfAny(TokenType.IDENTIFIER)) {
            return new AstVariableExpr(this.peekPrevious());
        }

        throw this.error("Expected expression, instead got " + this.peek());
    }

    private synchronize() {
        this.advance();

        while (!this.isAtEnd()) {
            if (VALID_STATEMENT_ENDS.has(this.peek().type)) {
                return;
            }

            switch (this.peek().type) {
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }

    private peekIs(offset: number, type: TokenType): boolean {
        if (this.isAtEnd()) {
            return type === TokenType.EOF;
        }

        return this.peek().type === type;
    }

    private peekIs(type: TokenType): boolean {
        if (this.isAtEnd()) {
            return type === TokenType.EOF;
        }

        return this.peek().type === type;
    }

    private peekNextIs(tokenType: TokenType): boolean {
        if (this.isAtEnd()) {
            return tokenType === TokenType.EOF;
        }

        return this.peekNext().type === tokenType;
    }

    private errorIfPeekIs(message: string, type: TokenType) {
        if (this.peekIs(type)) {
            throw this.error(message);
        }
    }

    private peekExpectConditional(shouldError: boolean, type: TokenType): boolean;
    private peekExpectConditional(shouldError: boolean, context: string | null, type: TokenType): boolean;
    private peekExpectConditional(shouldError: boolean, context: string | null = null, type: TokenType): boolean {
        if (shouldError) {
            this.peekExpect(context, type);
        }
        return this.peekIs(type);
    }

    private peekExpect(context: string | null, type: TokenType) {
        if (!this.peekIs(type)) {
            throw this.expectError(null, type, context);
        }
    }

    private peekIsAny(...anyOfTypes: TokenType[]): boolean {
        return anyOfTypes.some(type => this.peekIs(type));
    }

    private peekNextIsAny(...anyOfTypes: TokenType[]): boolean {
        return anyOfTypes.some(type => this.peekNextIs(type));
    }

    private peekIsConsecutive(...types: TokenType[]): boolean {
        let advance = 0;
        for (const type of types) {
            const ahead = this.peek(advance);
            if (ahead === null || ahead.type !== type) {
                return false;
            }
            advance++;
        }
        return true;
    }

    private advanceThroughIfConsecutive(...types: TokenType[]): boolean {
        let advance = 0;
        for (const type of types) {
            const ahead = this.peek(advance);
            if (ahead === null || ahead.type !== type) {
                return false;
            }
            advance++;
        }
        for (let i = 0; i < advance; i++) {
            this.advance();
        }
        return true;
    }

    private advance(): Token {
        if (!this.isAtEnd()) {
            this.updateCurrentPosition(this.current + 1);
        }
        return this.peekPrevious();
    }

    private updateCurrentPosition(newCurrent: number) {
        this.current = newCurrent;
    }

    private advanceIfAny(...anyOfTypes: TokenType[]): boolean {
        if (this.peekIsAny(...anyOfTypes)) {
            this.advance();
            return true;
        }
        return false;
    }

    private eatBlankLines(): boolean {
        while (this.advanceIfAny(TokenType.NEW_LINE)) { }
        return this.isAtEnd();
    }

    private advanceExpectAny(message: string, ...anyOfTypes: TokenType[]) {
        if (!this.advanceIfAny(...anyOfTypes)) {
            throw this.error(message);
        }
    }

    private advanceExpectToken(tokenType: TokenType): Token;
    private advanceExpectToken(tokenType: TokenType, context: string | null): Token;
    private advanceExpectToken(expectedName: string | null, tokenType: TokenType, context: string | null): Token;
    private advanceExpectToken(expectedName: string | null = null, tokenType: TokenType, context: string | null = null): Token {
        if (this.peekIs(tokenType)) {
            return this.advance();
        }
        throw this.expectError(expectedName, tokenType, context);
    }

    private expectError(expectedName: string | null, tokenType: TokenType, context: string | null): SyntaxError {
        throw this.error(`Expected ${(expectedName || tokenType)} ${(context ? " " + context : "")} after ${this.peekPrev()}, instead got ${this.peek()}`);
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        const peek = this.peekAt(0);
        if (peek === null) {
            throw new Error("Advanced over EOF");
        }
        return peek;
    }

    private peekNext(): Token | null {
        return this.peekAt(1);
    }

    private peekPrevious(): Token | null {
        return this.peekAt(-1);
    }

    private peekAt(offset: number): Token | null {
        const pos = this.current + offset;
        if (pos >= this.tokens.length || pos < 0) {
            return null;
        }
        return this.tokens[pos];
    }

    private error(message: string): SyntaxError {
        this.unmarkBacktrack();
        VerseLang.syntaxError(this.peekPrevious(), this.peek(), this.peekNext(), message);
        return new SyntaxError();
    }

    private static SyntaxError = class extends Error { };
}
