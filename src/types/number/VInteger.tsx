import { VNumber } from './VNumber';

export class VInteger extends VNumber<VInteger> {
    private value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    static parseInt(text: string): VInteger {
        return new VInteger(Number.parseInt(text));
    }

    negate(): VInteger {
        return new VInteger(-this.value);
    }

    add(rightVal: VNumber<any>): VInteger {
        this.ensureSameType(rightVal);
        return new VInteger(this.value + (rightVal as VInteger).value);
    }

    subtract(rightVal: VNumber<any>): VInteger {
        this.ensureSameType(rightVal);
        return new VInteger(this.value - (rightVal as VInteger).value);
    }

    multiply(rightVal: VNumber<any>): VInteger {
        this.ensureSameType(rightVal);
        return new VInteger(this.value * (rightVal as VInteger).value);
    }

    divide(rightVal: VNumber<any>): VInteger {
        this.ensureSameType(rightVal);
        return new VInteger(this.value / (rightVal as VInteger).value);
    }

    getRawValue(): number {
        return this.value;
    }

    toString(): string {
        return String(this.value);
    }

    equals(other: any): boolean {
        if (!(other instanceof VNumber)) {
            return false;
        }
        return this.value === (other as VNumber<any>).getRawValue();
    }
}
