import { AstVisitor } from '../ast/AstVisitor';
import { AstParameter } from '../ast/types/AstParameter';
import { AstType } from '../ast/types/AstType';
import { AstFunctionDecl } from '../ast/types/decl/AstFunctionDecl';
import { AstVariableDecl } from '../ast/types/decl/AstVariableDecl';
import { AstAssignExpr, AstBinaryExpr, AstCallExpr, AstGetExpr, AstGroupingExpr, AstIfExpr, AstLiteralExpr, AstUnaryExpr, AstVariableExpr } from '../ast/types/expr';
import { AstBlock, AstExpressionStmt } from '../ast/types/stmt';

export class FunctionSearchVisitor implements AstVisitor<AstFunctionDecl | null> {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    visitTypeExpr(type: AstType): AstFunctionDecl | null {
        return null;
    }

    visitFunctionDecl(astFunctionDecl: AstFunctionDecl): AstFunctionDecl | null {
        if (astFunctionDecl.name.lexeme === this.name) {
            return astFunctionDecl;
        }
        return null;
    }

    visitVariableDecl(astVariableDecl: AstVariableDecl): AstFunctionDecl | null {
        return null;
    }

    visitExpressionStmt(astExpressionStmt: AstExpressionStmt): AstFunctionDecl | null {
        return null;
    }

    visitBlock(astBlock: AstBlock): AstFunctionDecl | null {
        return null;
    }

    visitParameter(astParameter: AstParameter): AstFunctionDecl | null {
        return null;
    }

    visitIf(astIf: AstIfExpr): AstFunctionDecl | null {
        return null;
    }

    visitAssignExpr(astAssign: AstAssignExpr): AstFunctionDecl | null {
        return null;
    }

    visitBinaryExpr(astBinary: AstBinaryExpr): AstFunctionDecl | null {
        return null;
    }

    visitGroupingExpr(astGrouping: AstGroupingExpr): AstFunctionDecl | null {
        return null;
    }

    visitLiteralExpr(astLiteral: AstLiteralExpr): AstFunctionDecl | null {
        return null;
    }

    visitUnaryExpr(astUnary: AstUnaryExpr): AstFunctionDecl | null {
        return null;
    }

    visitVariableExpr(astVariable: AstVariableExpr): AstFunctionDecl | null {
        return null;
    }

    visitCallExpr(astCall: AstCallExpr): AstFunctionDecl | null {
        return null;
    }

    visitGetExpr(astGet: AstGetExpr): AstFunctionDecl | null {
        return null;
    }
}
