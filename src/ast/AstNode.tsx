import { AstVisitor } from './AstVisitor';

export abstract class AstNode {
    abstract accept<R>(visitor: AstVisitor<R>): R;
}
