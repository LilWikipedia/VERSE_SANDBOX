import { VNumber } from './VNumber';

export class VFloat extends VNumber<VFloat> {
    private value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    static parseFloat(text: string): VFloat {
        return new VFloat(Number.parseFloat(text));
    }

    negate(): VFloat {
        this.ensureSameType(this);
        return new VFloat(-this.value);
    }

    add(rightVal: VNumber<any>): VFloat {
        this.ensureSameType(rightVal);
        return new VFloat(this.value + (rightVal as VFloat).value);
    }

    subtract(rightVal: VNumber<any>): VFloat {
        this.ensureSameType(rightVal);
        return new VFloat(this.value - (rightVal as VFloat).value);
    }

    multiply(rightVal: VNumber<any>): VFloat {
        this.ensureSameType(rightVal);
        return new VFloat(this.value * (rightVal as VFloat).value);
    }

    divide(rightVal: VNumber<any>): VFloat {
        this.ensureSameType(rightVal);
        return new VFloat(this.value / (rightVal as VFloat).value);
    }

    getRawValue(): number {
        return this.value;
    }

    equals(other: any): boolean {
        if (!(other instanceof VNumber)) {
            return false;
        }
        return this.value === (other as VNumber<any>).getRawValue();
    }

    toString(): string {
        return String(this.value);
    }
}
