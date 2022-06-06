import { Cli, Builtins } from "clipanion";

import { LintCommand } from "./commands/lint.js";

export function makeCli(): Cli {
  const cli = new Cli({
    binaryLabel: `Doc Link Checker`,
    binaryName: `doc-link-chcker`,
    binaryVersion: `1.0.0`,
  });

  cli.register(LintCommand);

  cli.register(Builtins.HelpCommand);
  cli.register(Builtins.VersionCommand);

  return cli;
}
