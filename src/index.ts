export { run } from '@oclif/core';
import { Command, Flags } from '@oclif/core';
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { glob } from 'glob-promise';
import chokidar from 'chokidar';

class Link extends Command
{
    static description = 'Link two packages together';

    static examples = [
        '<%= config.bin %> ../path/to/package1',
        '<%= config.bin %> ../path/to/package1 ./node_modules/package1',
    ];

    static flags = {
        watch: Flags.boolean({
            char: 'w',
            description: 'watch for changes',
            default: false,
        }),
        ignore: Flags.string({
            char: 'i',
            description: 'ignore files matching this pattern',
            default: [
                '**/node_modules/**/*',
                '**/.git/**/*',
            ],
            multiple: true,
        }),
        verbose: Flags.boolean({
            char: 'v',
            description: 'output more information',
            default: false,
        }),
    };

    static args = [{ name: 'input', required: true }, { name: 'output' }];

    private _copyPaths: Set<string> = new Set();
    private _flags!: { verbose: boolean };

    async run(): Promise<void>
    {
        const { args, flags } = await this.parse(Link);
        const root = path.join(process.cwd());
        let input = args.input;
        let output = args.output;
        const ignore = flags.ignore;

        this._flags = flags;

        if (!input)
        {
            this.logEvent({
                message: 'input is required',
                level: 'error',
            });
        }

        if (!path.isAbsolute(input))
        {
            input = path.join(root, input);
        }

        if (!output)
        {
            try
            {
                // read the package.json file of the input and get the name of the package
                const packageJson = fs.readJSONSync(path.join(input, 'package.json'));

                output = `${path.join(root, 'node_modules', packageJson.name)}/`;

                // get the package files from the package.json
                if (packageJson.files)
                {
                    this._copyPaths = new Set(packageJson.files.map((file: string) => path.join(input, file)));
                    this._copyPaths.add('package.json');
                    this._copyPaths.add('readme.md');
                    this._copyPaths.add('README.md');
                    this._copyPaths.add('README');
                    this._copyPaths.add('license');
                    this._copyPaths.add('LICENSE');
                }
            }
            catch (error)
            {
                this.logEvent({
                    message: 'Cannot determine package name from package.json, please provide output path',
                    level: 'error',
                });
            }
        }
        else if (!path.isAbsolute(output))
        {
            output = path.join(root, output);
        }

        // TODO: if it is a package then we should read the files from the package.json and use them as the input

        if (fs.existsSync(input))
        {
            if (!fs.existsSync(path.dirname(output)))
            {
                this.warn(
                    `output path ${path.dirname(output)} does not exist, creating it`,
                );
            }

            try
            {
                this._copy(input, output, ignore);
                this.logEvent({
                    message: `Copied: ${input} -> ${output}`,
                    level: 'info',
                });
            }
            catch (error)
            {
                this.logEvent({ message: (error as Error).message, level: 'error' });
            }

            if (flags.watch)
            {
                this.logEvent({ message: 'Watching for changes...', level: 'info' });
                this._watch(input, output, ignore);
            }
        }
        else
        {
            this.logEvent({
                message: `Input path not found: ${input}`,
                level: 'error',
            });
        }
    }

    private logEvent(event: {
        message: string;
        level: 'verbose' | 'info' | 'warn' | 'error';
    })
    {
        switch (event.level)
        {
            case 'verbose':
                if (this._flags.verbose)
                {
                    console.log(
                        `${chalk.blue.bold('›')} Info: ${chalk.blue.bold(event.message)}`,
                    );
                }
                break;
            case 'info':
                console.log(
                    `${chalk.blue.bold('›')} Info: ${chalk.blue.bold(event.message)}`,
                );
                break;
            case 'warn':
                console.log(
                    `${chalk.yellow.bold('›')} Warn: ${chalk.yellow.bold(event.message)}`,
                );
                break;
            case 'error':
                console.log(
                    `${chalk.red.bold('›')} Error: ${chalk.red.bold(event.message)}`,
                );
                process.exit(1);
                break;
            default:
                throw new Error(`Unknown log level ${event.level}`);
        }
    }

    private _copy(src: string, dest: string, ignore: string[])
    {
        const res = glob.sync(`${src}/**/*`, { ignore, nodir: true });

        fs.ensureDirSync(dest);
        res.forEach((file) =>
        {
            const out = file.replace(src, dest);

            // check if the file is in the copyPaths
            if (this._copyPaths.size > 0)
            {
                const fi = file.replace(src, '');

                // check if fi is included in any of the copyPaths
                const found = Array.from(this._copyPaths).find((cp) => fi.startsWith(cp.replace(src, '')));

                // if not found then ignore the file
                if (!found && !this._copyPaths.has(fi))
                {
                    this.logEvent({
                        message: `Ignoring: ${file}`,
                        level: 'verbose',
                    });

                    return;
                }
            }

            fs.mkdirSync(path.dirname(out), { recursive: true });
            fs.copyFileSync(file, out);
        });
    }

    private _watch(input: string, output: string, ignore: string[])
    {
        let id: number | NodeJS.Timeout = -1;

        chokidar.watch(input, { ignored: ignore }).on('all', (_type, file) =>
        {
            // adding check to see if file is null.
            if (!file || file.includes('.DS_Store')) return;

            if (id === -1)
            {
                // this happens a lot! lets throttle..
                id = setTimeout(() =>
                {
                    id = -1;
                    try
                    {
                        this._copy(input, output, ignore);
                        this.logEvent({
                            message: `Copied: ${input} -> ${output}`,
                            level: 'info',
                        });
                    }
                    catch (error)
                    {
                        this.logEvent({
                            message: (error as Error).message,
                            level: 'error',
                        });
                    }
                }, 100);
            }
        });
    }
}

module.exports = Link;
