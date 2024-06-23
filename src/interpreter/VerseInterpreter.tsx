import { AstNode } from '../ast/AstNode';
import { AstVisitor } from '../ast/AstVisitor';
import { AstExpr } from '../ast/types/AstExpr';
import { AstParameter } from '../ast/types/AstParameter';
import { AstStmt } from '../ast/types/AstStmt';
import { AstType } from '../ast/types/AstType';
import { AstFunctionDecl } from '../ast/types/decl/AstFunctionDecl';
import { AstVariableDecl } from '../ast/types/decl/AstVariableDecl';
import { AstAssignExpr } from '../ast/types/expr/AstAssignExpr';
import { AstBinaryExpr } from '../ast/types/expr/AstBinaryExpr';
import { AstCallExpr } from '../ast/types/expr/AstCallExpr';
import { AstGetExpr } from '../ast/types/expr/AstGetExpr';
import { AstGroupingExpr } from '../ast/types/expr/AstGroupingExpr';
import { AstLiteralExpr } from '../ast/types/expr/AstLiteralExpr';
import { AstUnaryExpr } from '../ast/types/expr/AstUnaryExpr';
import { AstVariableExpr } from '../ast/types/expr/AstVariableExpr';
import { AstIfExpr } from '../ast/types/expr/AstlfExpr';
import { AstBlock } from '../ast/types/stmt/AstBlock';
import { AstExpressionStmt } from '../ast/types/stmt/AstExpressionStmt';
import { VNumber } from '../types/number/VNumber';
import { FunctionSearchVisitor } from './FunctionSearchVisitor';
import { VerseNative } from './VerseNative';

export class VerseInterpreter implements AstVisitor<any> {
    private statements: AstStmt[];
    private verseNative: VerseNative = new VerseNative();

    constructor(statements: AstStmt[]) {
        this.statements = statements;
    }

    interpret(statements: AstStmt[]): void {
        for (const stmt of statements) {
            this.interpretStmt(stmt);
        }
    }

    private interpretStmt(stmt: AstStmt): void {
        stmt.accept(this);
    }

    interpretExpr(expr: AstExpr): void {
        const value = this.evaluate(expr);
        console.log(value);
    }

    visitExpressionStmt(expression: AstExpressionStmt): any {
        this.evaluate(expression.expression);
        return null;
    }

    visitBlock(block: AstBlock): any {
        return null;
    }

    visitFunctionDecl(functionDecl: AstFunctionDecl): any {
        return null;
    }

    visitParameter(parameter: AstParameter): any {
        return null;
    }

    visitIf(astIf: AstIfExpr): any {
        return null;
    }

    visitVariableDecl(variableDecl: AstVariableDecl): any {
        return null;
    }

    visitAssignExpr(assign: AstAssignExpr): any {
        return null;
    }

    visitBinaryExpr(binary: AstBinaryExpr): any {
        const left = this.evaluate(binary.left);
        const right = this.evaluate(binary.right);

        switch (binary.operator.type) {
            case 'PLUS':
                if (left instanceof VNumber && right instanceof VNumber) {
                    return left.add(right);
                }
                throw VerseInterpreter.runtimeError(binary, "Expected numbers");

            case 'MINUS':
                if (left instanceof VNumber && right instanceof VNumber) {
                    return left.subtract(right);
                }
                throw VerseInterpreter.runtimeError(binary, "Expected numbers");

            case 'STAR':
                if (left instanceof VNumber && right instanceof VNumber) {
                    return left.multiply(right);
                }
                throw VerseInterpreter.runtimeError(binary, "Expected numbers");

            case 'SLASH':
                if (left instanceof VNumber && right instanceof VNumber) {
                    return left.divide(right);
                }
                throw VerseInterpreter.runtimeError(binary, "Expected numbers");

            case 'EQUALS':
                return left.equals(right);

            case 'GREATER':
                if (left instanceof VNumber && right instanceof VNumber) {
                    return left.greaterThan(right);
                }
                throw VerseInterpreter.runtimeError(binary, "Expected numbers");

            case 'GREATER_EQUAL':
                if (left instanceof VNumber && right instanceof VNumber) {
                    return left.greaterThanOrEqual(right);
                }
                throw VerseInterpreter.runtimeError(binary, "Expected numbers");

            case 'LESS':
                if (left instanceof VNumber && right instanceof VNumber) {
                    return left.lessThan(right);
                }
                throw VerseInterpreter.runtimeError(binary, "Expected numbers");

            case 'LESS_EQUAL':
                if (left instanceof VNumber && right instanceof VNumber) {
                    return left.lessThanOrEqual(right);
                }
                throw VerseInterpreter.runtimeError(binary, "Expected numbers");

            default:
                throw VerseInterpreter.internalError(binary, `Unknown binary operator: ${binary.operator.type}`);
        }
    }

    visitGroupingExpr(grouping: AstGroupingExpr): any {
        return this.evaluate(grouping.expression);
    }

    visitLiteralExpr(literal: AstLiteralExpr): any {
        return literal.value;
    }

    visitUnaryExpr(unary: AstUnaryExpr): any {
        const right = this.evaluate(unary.right);

        switch (unary.operator.type) {
            case 'MINUS':
                if (right instanceof VNumber) {
                    return right.negate();
                }
                throw VerseInterpreter.runtimeError(unary, "Expected number");

            case 'NOT':
                return !this.isTruthy(right);

            default:
                return null;
        }
    }

    visitVariableExpr(variable: AstVariableExpr): any {
        return variable;
    }

    visitCallExpr(call: AstCallExpr): any {
        if (call.callee instanceof AstVariableExpr) {
            const functionDecl = this.lookupFunctionDecl(call.callee.name.lexeme);

            if (!functionDecl) {
                throw VerseInterpreter.runtimeError(call, `Undefined function '${call.callee.name.lexeme}'.`);
            }

            if (functionDecl.hasSpecifier("native")) {
                return this.callNativeFunction(functionDecl, call.arguments);
            }

            return null;
        }

        throw VerseInterpreter.runtimeError(call, "Can only call functions");
    }

    private callNativeFunction(functionDecl: AstFunctionDecl, arg: AstExpr[]): any {
        const argsArray = [...arg];
        return argsArray.map((arg) => {
            return this.verseNative.callNative(functionDecl.name.lexeme, ((arg: AstExpr) => this.evaluate(arg)));});
    }

    visitGetExpr(astGet: AstGetExpr): any {
        return null;
    }

    visitTypeExpr(type: AstType): any {
        return null;
    }

    public lookupFunctionDecl(name: string): AstFunctionDecl | any {
        const visitor = new FunctionSearchVisitor(name);
        for (const stmt of this.statements) {
            const functionDecl = stmt.accept(visitor);
            if (functionDecl) {
                return functionDecl;
            }
        }
        return null;
    }

    private isTruthy(obj: any): any {
        if (obj instanceof Boolean) {
            return obj;
        }
        return false;
    }

    private evaluate(expr: AstExpr): any {
        return expr.accept(this);
    }

    static runtimeError(expr: AstNode, message: string): Error {
        return new Error(`Runtime error at ${expr}: ${message}`);
    }

    static internalError(expr: AstExpr, message: string): Error {
        return new Error(`Internal error interpreting expression ${expr}: ${message}`);
    }

    
    static internalErrorDeprecated(message: string): Error {
        return new Error(`Internal error interpreting: ${message}`);
    }
}
