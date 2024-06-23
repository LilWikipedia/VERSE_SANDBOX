import * as fs from 'fs';
import * as path from 'path';
import { AstStmt } from './ast/types/AstStmt';
import { VerseInterpreter } from './interpreter/VerseInterpreter';
import { Token } from './lexer/Token';
import { VerseScanner } from './lexer/VerseScanner';
import { VerseParser } from './parser/VerseParser';
import { AstPrinter } from './util/AstPrinter';

export class VerseLang {
    static PRINTER = new AstPrinter();
    static LOGGER: Console = console;
    static hadSyntaxError = false;

    static async main(args: string[]): Promise<void> {
        if (args.length !== 2) {
            this.LOGGER.error('Usage: verse [script] [debug]');
            process.exit(64);
        }

        const fileName = args[0];
        const filePath = path.resolve(fileName);

        if (!fs.existsSync(filePath)) {
            this.LOGGER.error(`File does not exist: ${fileName}`);
            process.exit(64);
        }

        if (!fs.statSync(filePath).isFile()) {
            this.LOGGER.error(`Input is not a file: ${fileName}`);
            process.exit(64);
        }

        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const debug = args[1] === 'true';

        const tokens = new VerseScanner(fileContent).scanTokens();
        const parser = new VerseParser(debug, tokens);

        let statements: AstStmt[];
        const start = Date.now();
        try {
            statements = parser.parse();
        } catch (e) {
            this.LOGGER.error('Error while parsing', e);
            return;
        }

        if (this.hadSyntaxError) {
            return;
        }

        this.LOGGER.info(`Parsed ${statements.length} statements in ${Date.now() - start}ms`);

        try {
            const writer = fs.createWriteStream('out.txt', { flags: 'w' });
            for (const stmt of statements) {
                writer.write(`${this.PRINTER.print(stmt)}\n`);
            }
            writer.end();
        } catch (e) {
            this.LOGGER.error('Error while writing to file', e);
        }

        console.log();
        this.LOGGER.info('Running interpreter...');

        const interp = new VerseInterpreter(statements);
        const mainFunction = interp.lookupFunctionDecl('Main');
        

        if (!mainFunction) {
            this.LOGGER.error('No main function found');
            return;
        }

        interp.interpret(mainFunction.body);
    }

    static syntaxError(previous: Token | null, current: Token, next: Token | null, message: string): void {
        message = message.replace('{peek}', current.errorString());
        message = message.replace('{peekNext}', next ? next.errorString() : 'null');
        message = message.replace('{peekPrev}', previous ? previous.errorString() : 'null');
        this.syntaxErrorAt(current.line, current.col, message);
    }

    static syntaxErrorAt(line: number, col: number, message: string): void {
        this.hadSyntaxError = true;
        this.LOGGER.error(`Syntax Error: ${message} [ Ln ${line}, Col ${col} ]`);
    }
}

// To run the script with command line arguments
VerseLang.main(process.argv.slice(2)).catch(e => console.error(e));
