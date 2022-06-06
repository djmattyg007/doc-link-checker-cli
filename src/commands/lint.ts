import { Command, Option } from "clipanion";
import * as t from "typanion";

import { markdownOptions, scanFiles, verifyLinks } from "doc-link-checker";

import { fileErrorMsgs, anchorErrorMsgs } from "../error-msg.js";

const DEFAULT_INCLUDE_GLOBS: ReadonlyArray<string> = [
  "**/*.md",
  "**/*.mdown",
  "**/*.markdown",
];
const DEFAULT_EXCLUDE_GLOBS: ReadonlyArray<string> = [
  "**/node_modules/**",
  "**/.venv/**",
  "**/venv/**",
  "**/vendor/**",
];

const exitCode = t.cascade(t.isNumber(), [
  t.isInteger(),
  t.isInInclusiveRange(0, 255),
]);

export class LintCommand extends Command {
  static override paths = [["lint"]];

  caseSensitive = Option.Boolean("--case-sensitive", false);
  mdType = Option.String("--md-type", markdownOptions.mdDefaultType, { validator: t.isEnum(markdownOptions.mdTypes) });

  include = Option.Array("--include", []);
  exclude = Option.Array("--exclude", []);

  includeExtend = Option.Array("--include-extend", []);
  excludeExtend = Option.Array("--exclude-extend", []);

  successCode = Option.String("--success-code", "0", { validator: exitCode });
  failureCode = Option.String("--failure-code", "1", { validator: exitCode });

  static override schema = [
    t.hasMutuallyExclusiveKeys(["include", "includeExtend"]),
    t.hasMutuallyExclusiveKeys(["exclude", "excludeExtend"]),
  ];

  async execute(): Promise<number> {
    const includeGlobs = this.include.length > 0
      ? this.include
      : DEFAULT_INCLUDE_GLOBS.concat(this.includeExtend);
    const excludeGlobs = this.exclude.length > 0
      ? this.exclude
      : DEFAULT_EXCLUDE_GLOBS.concat(this.excludeExtend);

    const scanOptions = {
      basePath: process.cwd(),
      caseSensitive: this.caseSensitive,
      mdType: this.mdType,
    };

    let foundAnyError = false;
    const scan = scanFiles(includeGlobs, excludeGlobs, scanOptions);
    for await (const result of scan) {
      let foundError = false;
      const verify = verifyLinks(scanOptions.basePath, result.file, result.links);
      for await (const verifyError of verify) {
        if (foundError === false) {
          this.context.stdout.write(`--- ${result.file.path} ---`);
          foundError = true;
        }

        const errorMsg = verifyError.errorType === "file" ? fileErrorMsgs[verifyError.errorCode] : anchorErrorMsgs[verifyError.errorCode];

        const position = verifyError.link.position;
        const lineMarker = position ? String(position.start.line) : "?";
        const href = verifyError.link.href;
        this.context.stdout.write(`line ${lineMarker}: ${href} (${errorMsg})`);
      }

      if (foundError === true) {
        foundAnyError = true;
      } else {
        this.context.stdout.write(`${result.file.path} [OK]`);
      }
    }

    if (foundAnyError === true) {
      return this.failureCode;
    } else {
      return this.successCode;
    }
  }
}
