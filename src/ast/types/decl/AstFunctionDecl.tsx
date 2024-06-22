import { AstVisitor } from '../../AstVisitor';
import { Token } from '../../lexer/Token';
import { AstParameter } from '../AstParameter';
import { AstStmt } from '../AstStmt';
import { AstType } from '../AstType';

export class AstFunctionDecl extends AstStmt {
    name: Token;
    specifiers: AstType[];
    effects: AstType[];
    parameters: AstParameter[];
    type: AstType;
    body: AstStmt[] | null;

    constructor(
        name: Token,
        specifiers: AstType[],
        effects: AstType[],
        parameters: AstParameter[],
        type: AstType,
        body: AstStmt[] | null
    ) {
        super();
        this.name = name;
        this.specifiers = specifiers;
        this.effects = effects;
        this.parameters = parameters;
        this.type = type;
        this.body = body;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitFunctionDecl(this);
    }

    hasSpecifier(specifierName: string): boolean {
        return this.specifiers.some(specifier => specifier.name.lexeme === specifierName);
    }
}
