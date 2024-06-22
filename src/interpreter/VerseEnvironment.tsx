import { VerseInterpreter } from './VerseInterpreter';

export class VerseEnvironment {
    private parent: VerseEnvironment | null;
    private values: Map<string, any>;

    constructor(parent: VerseEnvironment | null = null) {
        this.parent = parent;
        this.values = new Map<string, any>();
    }

    defineVariable(name: string, value: any): void {
        if (this.values.has(name)) {
            throw VerseInterpreter.internalError(`Variable '${name}' already defined.`);
        }
        this.values.set(name, value);
    }

    getValue(name: string): any {
        if (this.values.has(name)) {
            return this.values.get(name);
        }
        if (this.parent !== null) {
            return this.parent.getValue(name);
        }
        throw VerseInterpreter.internalError(`Undefined variable '${name}'.`);
    }

    setValue(name: string, value: any): void {
        if (this.values.has(name)) {
            this.values.set(name, value);
            return;
        }
        if (this.parent !== null) {
            this.parent.setValue(name, value);
            return;
        }
        throw VerseInterpreter.internalError(`Undefined variable '${name}'.`);
    }
}
