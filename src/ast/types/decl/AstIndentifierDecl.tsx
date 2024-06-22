import { Token } from '../../lexer/Token';
import { AstType } from '../AstType';

export class AstIdentifierDecl {
    name: Token;
    specifiers: AstType[];

    constructor(name: Token, specifiers: AstType[]) {
        this.name = name;
        this.specifiers = specifiers;
    }
}
