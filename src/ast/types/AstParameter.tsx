import { AstNode } from '../AstNode';
import { AstVisitor } from '../AstVisitor';
import { Token } from '../lexer/Token';
import { AstType } from './AstType';

export class AstParameter extends AstNode {
    name: Token;
    type: AstType | null;

    constructor(name: Token, type: AstType | null) {
        super();
        this.name = name;
        this.type = type;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitParameter(this);
    }
}
