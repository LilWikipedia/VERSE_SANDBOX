import { AstVisitor } from '../../AstVisitor';
import { AstExpr } from '../AstExpr';
import { AstStmt } from '../AstStmt';

export class AstExpressionStmt extends AstStmt {
    expression: AstExpr;

    constructor(expression: AstExpr) {
        super();
        this.expression = expression;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitExpressionStmt(this);
    }
}
