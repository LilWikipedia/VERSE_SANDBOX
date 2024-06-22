import { AstVisitor } from '../../AstVisitor';
import { AstExpr } from '../AstExpr';

export class AstCallExpr extends AstExpr {
    callee: AstExpr;
    arguments: AstExpr[];

    constructor(callee: AstExpr, args: AstExpr[]) {
        super();
        this.callee = callee;
        this.arguments = args;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCallExpr(this);
    }
}
