import { AstVisitor } from '../../AstVisitor';
import { AstExpr } from '../AstExpr';

export class AstLiteralExpr extends AstExpr {
    value: any;

    constructor(value: any) {
        super();
        this.value = value;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitLiteralExpr(this);
    }

    toString(): string {
        if (typeof this.value === 'string') {
            return `"${this.value}"`;
        }

        return String(this.value);
    }
}
