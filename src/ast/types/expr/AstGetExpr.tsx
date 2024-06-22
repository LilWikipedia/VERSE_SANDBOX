import { AstVisitor } from '../../AstVisitor';
import { Token } from '../../lexer/Token';
import { AstExpr } from '../AstExpr';

export class AstGetExpr extends AstExpr {
    expr: AstExpr;
    name: Token;

    constructor(expr: AstExpr, name: Token) {
        super();
        this.expr = expr;
        this.name = name;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitGetExpr(this);
    }
}
