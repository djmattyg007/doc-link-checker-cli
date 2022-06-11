import process from "node:process";
import type { stdout } from "node:process";

import { Cli as BaseCli, Builtins } from "clipanion";

import { LintCommand } from "./commands/lint.js";

function getColorDepth() {
  if ("getColorDepth" in process.stdout) {
    return process.stdout.getColorDepth();
  }

  if ("isTTY" in process.stdout && (process.stdout as typeof stdout).isTTY) {
    return 8;
  }

  return 1;
}

class Cli extends BaseCli {
  // We need to override this because the built-in detection is broken.
  override format() {
    return super.format(getColorDepth() > 1);
  }
}

export function makeCli(): Cli {
  const cli = new Cli({
    binaryLabel: "Doc Link Checker",
    binaryName: "doc-link-chcker",
    binaryVersion: "1.0.2",
  });

  cli.register(LintCommand);

  cli.register(Builtins.HelpCommand);
  cli.register(Builtins.VersionCommand);

  return cli;
}
