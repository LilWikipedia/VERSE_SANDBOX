import 'reflect-metadata';
import { VNumber } from '../types/number/VNumber';
import { VerseNativeModule } from './modules/VerseNativeModule';

type Method = (...args: any[]) => any;

export class VerseNative {
    private nativeMethods: Map<string, Method> = new Map();

    constructor() {
        this.registerModule(new VerseNativeModule());
    }

    callNative(name: string, ...args: any[]): any {
        const method = this.nativeMethods.get(name);
        if (!method) {
            throw new Error(`Native method ${name} not found`);
        }

        if (method.length !== args.length) {
            throw new Error(`Native method ${name} requires ${method.length} arguments`);
        }

        // Convert args to correct type
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg instanceof VNumber) {
                args[i] = (arg as VNumber<any>).getRawValue();
            }
        }

        // Check each type
        for (let i = 0; i < args.length; i++) {
            const paramType = method.length[i];

            if (typeof paramType === 'number') {
                if (!(args[i] instanceof Number)) {
                    throw new Error(`Native method ${name} requires argument ${i} to be of type ${paramType}, but got ${typeof args[i]}`);
                }
            } else if (typeof paramType === 'string') {
                if (!(args[i] instanceof String)) {
                    throw new Error(`Native method ${name} requires argument ${i} to be of type ${paramType}, but got ${typeof args[i]}`);
                }
            }
        }

        try {
            return method(...args);
        } catch (e) {
            throw new Error(`Calling native method ${name} failed: ${e}`);
        }
    }

    private registerModule(verseNativeModule: VerseNativeModule): void {
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(verseNativeModule))
            .filter(prop => typeof (verseNativeModule as any)[prop] === 'function' && Reflect.getMetadata('VerseNativeImpl', verseNativeModule, prop));

        for (const methodName of methods) {
            this.nativeMethods.set(methodName, (verseNativeModule as any)[methodName]);
        }
    }
}
