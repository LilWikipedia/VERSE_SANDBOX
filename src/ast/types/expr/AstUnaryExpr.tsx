import { AstVisitor } from '../../AstVisitor';
import { Token } from '../../lexer/Token';
import { AstExpr } from '../AstExpr';

export class AstUnaryExpr extends AstExpr {
    operator: Token;
    right: AstExpr;

    constructor(operator: Token, right: AstExpr) {
        super();
        this.operator = operator;
        this.right = right;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitUnaryExpr(this);
    }
}
