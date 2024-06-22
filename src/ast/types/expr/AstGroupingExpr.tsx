import { AstVisitor } from '../../AstVisitor';
import { AstExpr } from '../AstExpr';

export class AstGroupingExpr extends AstExpr {
    expression: AstExpr;

    constructor(expression: AstExpr) {
        super();
        this.expression = expression;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitGroupingExpr(this);
    }
}
