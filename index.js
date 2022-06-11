#!/usr/bin/env node

import process from "node:process";

import { makeCli } from "./dist/cli.js";

const cli = makeCli();

cli.runExit(process.argv.slice(2));
