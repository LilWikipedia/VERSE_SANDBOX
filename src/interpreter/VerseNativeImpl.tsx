import 'reflect-metadata';

export function VerseNativeImpl(target: any, propertyKey: string): void {
    Reflect.defineMetadata('VerseNativeImpl', true, target, propertyKey);
}
