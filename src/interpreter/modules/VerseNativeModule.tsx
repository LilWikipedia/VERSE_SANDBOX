import { VerseNativeImpl } from '../VerseNativeImpl';
import { NativeModule } from './NativeModule';

export class VerseNativeModule implements NativeModule {
    @VerseNativeImpl
    static Print(message: string): void {
        console.log(message);
    }

    @VerseNativeImpl
    static Sqrt(value: number): number {
        return Math.sqrt(value);
    }

    @VerseNativeImpl
    static Join(strings: string[], separator: string): string {
        return strings.join(separator);
    }

    @VerseNativeImpl
    static ToString(character: string): string {
        if (character.length !== 1) {
            throw new Error('ToString expects a single character');
        }
        return character;
    }
}
