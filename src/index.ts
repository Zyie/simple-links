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
                '*.orig',
                '.*.swp',
                '.DS_Store',
                '._*',
                '.git',
                '.hg',
                '.lock-wscript',
                '.npmrc',
                '.svn',
                '.wafpickle-*',
                'CVS',
                'config.gypi',
                'node_modules',
                'npm-debug.log',
                'package-lock.json',
                'pnpm-lock.yaml',
                'yarn.lock',
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

        const ignore = flags.ignore.map((pattern) => path.join(input, pattern));

        if (!output)
        {
            try
            {
                const packageJson = fs.readJSONSync(path.join(input, 'package.json'));

                output = `${path.join(root, 'node_modules', packageJson.name)}/`;

                if (packageJson.files)
                {
                    // Initialize _copyPaths with common files
                    this._copyPaths = new Set(['package.json', 'readme.md', 'README.md', 'README', 'license', 'LICENSE']);

                    // Expand each glob pattern in packageJson.files and add the resolved paths to _copyPaths
                    packageJson.files.forEach((filePattern: string) =>
                    {
                        const fullPathPattern = path.join(input, filePattern);
                        const matchedFiles = glob.sync(fullPathPattern); // Exclude directories

                        matchedFiles.forEach((matchedFile) => this._copyPaths.add(matchedFile));
                    });
                }

                if (packageJson.main)
                {
                    this._copyPaths.add(path.join(input, packageJson.main));
                }

                if (packageJson.bin)
                {
                    for (const key in packageJson.bin)
                    {
                        this._copyPaths.add(path.join(input, packageJson.bin[key]));
                    }
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

        chokidar.watch(input, { ignored: ignore, ignoreInitial: true }).on('all', (eventName, file) =>
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
                            level: 'warn',
                        });
                    }
                }, 100);
            }
        });
    }
}

module.exports = Link;
