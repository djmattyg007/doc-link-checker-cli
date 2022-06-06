import path from "node:path";
import process from "node:process";

import { Command, Option } from "clipanion";
import * as t from "typanion";

import { markdownOptions, scanFiles, verifyLinks } from "doc-link-checker";

import { fileErrorMsgs, anchorErrorMsgs } from "../error-msg.js";

const defaultIncludeGlobs: ReadonlyArray<string> = ["**/*.md", "**/*.mdown", "**/*.markdown"];
const defaultExcludeGlobs: ReadonlyArray<string> = [
  "**/node_modules/**",
  "**/.venv/**",
  "**/venv/**",
  "**/vendor/**",
];

const exitCode = t.cascade(t.isNumber(), [t.isInteger(), t.isInInclusiveRange(0, 255)]);

function resolveBasePath(cwd: string | undefined): string {
  if (!cwd) {
    return process.cwd();
  }

  if (path.isAbsolute(cwd)) {
    return cwd;
  }

  return path.resolve(process.cwd(), cwd);
}

export class LintCommand extends Command {
  static override paths = [["lint"]];

  /* eslint-disable @typescript-eslint/lines-between-class-members */
  caseSensitive = Option.Boolean("--case-sensitive", false, {
    description: "Make glob matching case-sensitive. Defaults to case-insensitive.",
  });
  mdType = Option.String("--md-type", markdownOptions.mdDefaultType, {
    description: "Use a custom markdown parser. Defaults to standard commonmark.",
    validator: t.isEnum(markdownOptions.mdTypes),
  });

  include = Option.Array("--include", [], {
    description: "A glob string to match files that should be checked. Can specify multiple times.",
  });
  exclude = Option.Array("--exclude", [], {
    description:
      "A glob string to match files that should NOT be checked. Can specify multiple times.",
  });

  includeExtend = Option.Array("--include-extend", [], {
    description:
      "A glob string added to the default include glob strings to match files that should be checked. Can specify multiple times.",
  });
  excludeExtend = Option.Array("--exclude-extend", [], {
    description:
      "A glob string added to the default exclude glob strings to match files that should NOT be checked. Can specify multiple times.",
  });

  successCode = Option.String("--success-code", "0", {
    description: "The status code to exit with when there are no errors.",
    validator: exitCode,
  });
  failureCode = Option.String("--failure-code", "1", {
    description: "The status code to exit with when there are errors.",
    validator: exitCode,
  });

  cwd = Option.String({ name: "directory", required: false });
  /* eslint-enable @typescript-eslint/lines-between-class-members */

  static override usage = {
    description: "Check documentation files for broken links.",
    details: `
      Supply a directory to look in for documentation files that have broken links.
      Uses the current working directory by default.
    `,
  };

  async execute(): Promise<number> {
    const includeGlobs =
      this.include.length > 0 ? this.include : defaultIncludeGlobs.concat(this.includeExtend);
    const excludeGlobs =
      this.exclude.length > 0 ? this.exclude : defaultExcludeGlobs.concat(this.excludeExtend);

    const scanOptions = {
      basePath: resolveBasePath(this.cwd),
      caseSensitive: this.caseSensitive,
      mdType: this.mdType,
    };

    let foundAnyError = false;
    const scan = scanFiles(includeGlobs, excludeGlobs, scanOptions);
    for await (const result of scan) {
      let foundError = false;
      const verify = verifyLinks(scanOptions.basePath, result.file, result.links);
      for await (const verifyError of verify) {
        if (!foundError) {
          this.context.stdout.write(`--- ${result.file.path} ---`);
          foundError = true;
        }

        const errorMessage =
          verifyError.errorType === "file"
            ? fileErrorMsgs[verifyError.errorCode]
            : anchorErrorMsgs[verifyError.errorCode];

        const { href, position } = verifyError.link;
        const lineMarker = position ? String(position.start.line) : "?";
        this.context.stdout.write(`line ${lineMarker}: ${href} (${errorMessage})`);
      }

      if (foundError) {
        foundAnyError = true;
      } else {
        this.context.stdout.write(`${result.file.path} [OK]`);
      }
    }

    return foundAnyError ? this.failureCode : this.successCode;
  }
}
