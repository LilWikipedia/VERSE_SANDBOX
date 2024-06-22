import { AstVisitor } from '../../AstVisitor';
import { Token } from '../../lexer/Token';
import { AstExpr } from '../AstExpr';
import { AstStmt } from '../AstStmt';
import { AstType } from '../AstType';

export class AstVariableDecl extends AstStmt {
    name: Token;
    specifier: AstType[];
    type: AstType | null;
    initializer: AstExpr;
    mutable: boolean;

    constructor(
        name: Token,
        specifier: AstType[],
        type: AstType | null,
        initializer: AstExpr,
        mutable: boolean
    ) {
        super();
        this.name = name;
        this.specifier = specifier;
        this.type = type;
        this.initializer = initializer;
        this.mutable = mutable;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitVariableDecl(this);
    }
}
