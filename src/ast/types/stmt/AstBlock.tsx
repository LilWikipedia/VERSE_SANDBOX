import { AstVisitor } from '../../AstVisitor';
import { AstStmt } from '../AstStmt';

export class AstBlock extends AstStmt {
    statements: AstStmt[];

    constructor(statements: AstStmt[]) {
        super();
        this.statements = statements;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitBlock(this);
    }
}
