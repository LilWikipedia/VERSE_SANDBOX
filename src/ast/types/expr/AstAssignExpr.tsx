import { AstVisitor } from '../../AstVisitor';
import { Token } from '../../lexer/Token';
import { AstExpr } from '../AstExpr';

export class AstAssignExpr extends AstExpr {
    name: Token;
    value: AstExpr;

    constructor(name: Token, value: AstExpr) {
        super();
        this.name = name;
        this.value = value;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitAssignExpr(this);
    }
}
