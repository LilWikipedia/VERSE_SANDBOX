import { AstVisitor } from '../../AstVisitor';
import { AstExpr } from '../AstExpr';
import { AstStmt } from '../AstStmt';

export class AstIfExpr extends AstExpr {
    condition: AstExpr;
    thenBranch: AstStmt[];
    elseBranch: AstStmt[];

    constructor(condition: AstExpr, thenBranch: AstStmt[], elseBranch: AstStmt[]) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitIf(this);
    }
}
