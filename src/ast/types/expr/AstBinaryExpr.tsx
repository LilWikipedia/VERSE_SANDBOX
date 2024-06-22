import { AstVisitor } from '../../AstVisitor';
import { Token } from '../../lexer/Token';
import { AstExpr } from '../AstExpr';

export class AstBinaryExpr extends AstExpr {
    left: AstExpr;
    operator: Token;
    right: AstExpr;

    constructor(left: AstExpr, operator: Token, right: AstExpr) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitBinaryExpr(this);
    }
}
