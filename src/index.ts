export { run } from "@oclif/core";
import { Command, Flags } from "@oclif/core";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";

class Link extends Command {
  static description = "Link two packages together";

  static examples = [
    `<%= config.bin %> ../path/to/package1 ./node_modules/package1`,
  ];

  static flags = {
    watch: Flags.boolean({
      char: "w",
      description: "watch for changes",
      default: false,
    }),
    verbose: Flags.boolean({
      char: "v",
      description: "output more information",
      default: false,
    }),
  };

  static args = [{ name: "input" }, { name: "output" }];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Link);
    const root = path.join(process.cwd());
    let input = args.input;
    let output = args.output;

    if (!input || !output) {
      this.logEvent({
        message: "input and output are required",
        level: "error",
      });
    }

    if (!path.isAbsolute(input)) {
      input = path.join(root, input);
    }

    if (!path.isAbsolute(output)) {
      output = path.join(root, output);
    }

    if (fs.existsSync(input)) {
      let id: number | NodeJS.Timeout = -1;

      if (!fs.existsSync(path.dirname(output))) {
        this.warn(
          `output path ${path.dirname(output)} does not exist, creating it`
        );
      }

      try {
        fs.copySync(input, output);
      } catch (error) {
        this.logEvent({ message: (error as Error).message, level: "error" });
      }

      if (flags.watch) {
        this.logEvent({ message: "Watching for changes...", level: "info" });
        fs.watch(input, { recursive: true }, (_type, file) => {
          // adding check to see if file is null.
          if (!file || file.indexOf(".DS_Store") !== -1) return;

          if (id === -1) {
            // this happens a lot! lets throttle..
            id = setTimeout(() => {
              id = -1;
              try {
                fs.copySync(input, output);
                if (!flags.verbose)
                  this.logEvent({
                    message: `Copied: ${input} -> ${output}`,
                    level: "info",
                  });
              } catch (error) {
                this.logEvent({
                  message: (error as Error).message,
                  level: "error",
                });
              }
            }, 100);
          }
        });
      }

      if (!flags.verbose)
        this.logEvent({
          message: `Copied: ${input} -> ${output}`,
          level: "info",
        });
    } else {
      this.logEvent({
        message: `Input path not found: ${input}`,
        level: "error",
      });
    }
  }

  private logEvent(event: {
    message: string;
    level: "verbose" | "info" | "warn" | "error";
  }) {
    switch (event.level) {
      case "verbose":
      case "info":
        console.log(
          `${chalk.blue.bold("›")} Info: ${chalk.blue.bold(event.message)}`
        );
        break;
      case "warn":
        console.log(
          `${chalk.yellow.bold("›")} Warn: ${chalk.yellow.bold(event.message)}`
        );
        break;
      case "error":
        console.log(
          `${chalk.red.bold("›")} Error: ${chalk.red.bold(event.message)}`
        );
        process.exit(1);
      default:
        throw new Error(`Unknown log level ${event.level}`);
    }
  }
}

module.exports = Link;
