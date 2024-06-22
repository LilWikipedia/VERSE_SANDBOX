import { AstVisitor } from '../../AstVisitor';
import { Token } from '../../lexer/Token';
import { AstExpr } from '../AstExpr';

export class AstVariableExpr extends AstExpr {
    name: Token;

    constructor(name: Token) {
        super();
        this.name = name;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitVariableExpr(this);
    }
}
