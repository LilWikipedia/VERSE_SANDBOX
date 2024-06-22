import { VerseInterpreter } from '../interpreter/VerseInterpreter';

export abstract class VNumber<T extends VNumber<T>> {
    abstract negate(): T;
    abstract add(rightVal: VNumber<any>): T;
    abstract subtract(rightVal: VNumber<any>): T;
    abstract multiply(rightVal: VNumber<any>): T;
    abstract divide(rightVal: VNumber<any>): T;
    abstract getRawValue(): number;
    abstract toString(): string;

    protected ensureSameType(rightVal: VNumber<any>): void {
        if (!this.isSameType(rightVal)) {
            throw VerseInterpreter.runtimeError(null, "Cannot operate on different types");
        }
    }

    private isSameType(other: VNumber<any>): boolean {
        return this.constructor === other.constructor;
    }

    equals(other: any): boolean {
        if (!(other instanceof VNumber)) {
            return false;
        }
        return this.getRawValue() === (other as VNumber<any>).getRawValue();
    }

    greaterThan(other: VNumber<any>): boolean {
        this.ensureSameType(other);
        return this.getRawValue() > other.getRawValue();
    }

    greaterThanOrEqual(other: VNumber<any>): boolean {
        this.ensureSameType(other);
        return this.getRawValue() >= other.getRawValue();
    }

    lessThan(other: VNumber<any>): boolean {
        this.ensureSameType(other);
        return this.getRawValue() < other.getRawValue();
    }

    lessThanOrEqual(other: VNumber<any>): boolean {
        this.ensureSameType(other);
        return this.getRawValue() <= other.getRawValue();
    }
}
