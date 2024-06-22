import { AstNode, AstVisitor } from '../ast/AstNode';
import { AstAssignExpr, AstBinaryExpr, AstCallExpr, AstExpr, AstGetExpr, AstGroupingExpr, AstIfExpr, AstLiteralExpr, AstParameter, AstType, AstUnaryExpr, AstVariableExpr } from '../ast/types';
import { AstFunctionDecl, AstVariableDecl } from '../ast/types/decl';
import { AstBlock, AstExpressionStmt } from '../ast/types/stmt';

export class AstPrinter implements AstVisitor<string> {
    print(expr: AstExpr): string {
        return expr.accept(this);
    }

    print(stmt: AstStmt): string {
        return stmt.accept(this);
    }

    visitExpressionStmt(expression: AstExpressionStmt): string {
        return expression.expression.accept(this);
    }

    visitBlock(block: AstBlock): string {
        const builder: string[] = ['{\n'];
        this.appendStatements(block.statements, builder);
        builder.push('}');
        return builder.join('');
    }

    visitTypeExpr(type: AstType): string {
        return type.toString();
    }

    visitFunctionDecl(functionDecl: AstFunctionDecl): string {
        const builder: string[] = [functionDecl.name.lexeme, '('];
        this.appendCommaSeparatedStatements(functionDecl.parameters, builder);
        builder.push(') : ', functionDecl.type.toString());

        if (functionDecl.body != null) {
            builder.push(' = {\n');
            this.appendStatements(functionDecl.body, builder);
            builder.push('}');
        }

        return builder.join('');
    }

    visitParameter(parameter: AstParameter): string {
        return `${parameter.name.lexeme} : ${parameter.type.toString()}`;
    }

    visitIf(astIf: AstIfExpr): string {
        const builder: string[] = ['if (', astIf.condition.accept(this), ') {\n'];
        this.appendStatements(astIf.thenBranch, builder);
        builder.push('}');

        if (astIf.elseBranch.length > 0) {
            builder.push(' else {\n');
            this.appendStatements(astIf.elseBranch, builder);
            builder.push('}');
        }

        return builder.join('');
    }

    visitVariableDecl(variableDeclaration: AstVariableDecl): string {
        const type = variableDeclaration.type ? ` : ${variableDeclaration.type.accept(this)} = ` : ' := ';
        return `${variableDeclaration.mutable ? 'var ' : ''}${variableDeclaration.name.lexeme}${type}${variableDeclaration.initializer.accept(this)}`;
    }

    visitAssignExpr(assign: AstAssignExpr): string {
        return `${assign.name.lexeme} = ${assign.value.accept(this)}`;
    }

    visitBinaryExpr(binary: AstBinaryExpr): string {
        return `(${binary.left.accept(this)} ${binary.operator.lexeme} ${binary.right.accept(this)})`;
    }

    visitGroupingExpr(grouping: AstGroupingExpr): string {
        return this.parenthesize('group', grouping.expression);
    }

    visitLiteralExpr(literal: AstLiteralExpr): string {
        return literal.value.toString();
    }

    visitUnaryExpr(unary: AstUnaryExpr): string {
        return `${unary.operator.lexeme}${unary.right.accept(this)}`;
    }

    visitVariableExpr(variable: AstVariableExpr): string {
        return variable.name.lexeme;
    }

    visitCallExpr(call: AstCallExpr): string {
        const builder: string[] = [call.callee.accept(this), '('];
        this.appendCommaSeparatedExpressions(call.arguments, builder);
        builder.push(')');
        return builder.join('');
    }

    visitGetExpr(astGet: AstGetExpr): string {
        return astGet.toString();
    }

    private appendCommaSeparatedStatements(statements: AstNode[], builder: string[]): void {
        for (let i = 0; i < statements.length; i++) {
            builder.push(statements[i].accept(this));
            if (i !== statements.length - 1) {
                builder.push(', ');
            }
        }
    }

    private appendCommaSeparatedExpressions(expressions: AstExpr[], builder: string[]): void {
        for (let i = 0; i < expressions.length; i++) {
            builder.push(expressions[i].accept(this));
            if (i !== expressions.length - 1) {
                builder.push(', ');
            }
        }
    }

    private appendStatements(statements: AstStmt[], builder: string[]): void {
        for (const stmt of statements) {
            builder.push(stmt.accept(this), '\n');
        }
    }

    private parenthesize(name: string, ...exprs: AstExpr[]): string {
        const builder: string[] = ['(', name];
        for (const expr of exprs) {
            builder.push(' ', expr.accept(this));
        }
        builder.push(')');
        return builder.join('');
    }
}
