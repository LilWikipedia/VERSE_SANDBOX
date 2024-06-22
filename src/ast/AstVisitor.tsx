import { AstParameter } from './types/AstParameter';
import { AstType } from './types/AstType';
import { AstFunctionDecl } from './types/decl/AstFunctionDecl';
import { AstVariableDecl } from './types/decl/AstVariableDecl';
import { AstAssignExpr, AstBinaryExpr, AstCallExpr, AstGetExpr, AstGroupingExpr, AstIfExpr, AstLiteralExpr, AstUnaryExpr, AstVariableExpr } from './types/expr';
import { AstBlock } from './types/stmt/AstBlock';
import { AstExpressionStmt } from './types/stmt/AstExpressionStmt';

export interface AstVisitor<R> {
    visitTypeExpr(type: AstType): R;
    visitFunctionDecl(astFunctionDecl: AstFunctionDecl): R;
    visitVariableDecl(astVariableDecl: AstVariableDecl): R;
    visitExpressionStmt(astExpressionStmt: AstExpressionStmt): R;
    visitBlock(astBlock: AstBlock): R;
    visitParameter(astParameter: AstParameter): R;
    visitIf(astIf: AstIfExpr): R;
    visitAssignExpr(astAssign: AstAssignExpr): R;
    visitBinaryExpr(astBinary: AstBinaryExpr): R;
    visitGroupingExpr(astGrouping: AstGroupingExpr): R;
    visitLiteralExpr(astLiteral: AstLiteralExpr): R;
    visitUnaryExpr(astUnary: AstUnaryExpr): R;
    visitVariableExpr(astVariable: AstVariableExpr): R;
    visitCallExpr(astCall: AstCallExpr): R;
    visitGetExpr(astGet: AstGetExpr): R;
}
