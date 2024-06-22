import { AstNode } from '../AstNode';
import { AstVisitor } from '../AstVisitor';
import { Token } from '../lexer/Token';

export class AstType extends AstNode {
    name: Token;
    array: boolean;
    map: boolean;
    keyType: AstType | null;
    optional: boolean;

    constructor(name: Token, array: boolean, map: boolean, keyType: AstType | null, optional: boolean) {
        super();
        this.name = name;
        this.array = array;
        this.map = map;
        this.keyType = keyType;
        this.optional = optional;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitTypeExpr(this);
    }

    toString(): string {
        return (this.array ? "[]" : "") + (this.map ? "[" + this.keyType + "]" : "") + (this.optional ? "?" : "") + this.name.lexeme;
    }
}
