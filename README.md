# Doc Link Checker CLI

[![CI](https://github.com/djmattyg007/doc-link-checker-cli/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/djmattyg007/doc-link-checker-cli/actions/workflows/ci.yml)

Doc Link Checker verifies links in your documentation. Primarily, this is targeted at verifying
internal (relative) references, to ensure broken links are detected early.

This is the CLI tool, built on top of the underlying [`doc-link-checker`](https://github.com/djmattyg007/doc-link-checker) package.

At the moment the detection is limited to links and definitions in Markdown files only. Future
support for images and link references is planned, as well as reStructured Text support. Please
see the [ideas list](./ideas.txt) for other currently planned features.

Doc Link Checker is 100% native Typescript.

## Install

With yarn:

```
$ yarn add doc-link-checker-cli
```

Or with npm:

```
$ npm add doc-link-checker-cli
```

This installs a binary named `doc-link-checker`. You may run this using `yarn run` or `npm run`, or directly in the `node_modules/.bin` folder, or as a global install.

## Usage

Currently the program has a single command: `lint`. To use all of the defaults, run this with no
other arguments:

```
doc-link-checker lint
```

It will automatically scan for all Markdown files in the current working directory, and report on
all of them. The default output looks a bit like this:

```
README.md [OK]
-- CONTRIBUTING.md --
line 20: ../README.md (Link references a file outside of the base directory.)
docs/support.md [OK]
-- docs/new-doc.md --
line 5: ../nope.md (Link references a file that does not exist.)
docs/test.md [OK]
-- docs/faq.md --
line 12: ../README.md#nope (Link references a non-existent header.)
other-docs/something.md [OK]
other-docs/another-thing.md [OK]
```

### Custom directory

To run the program for a different directory, simply pass it as a positional argument:

```
doc-link-checker lint /path/to/docs
```

### Custom include and exclude globs

By default it excludes common directories that hold vendor code, such as `node_modules` and `venv`. You can control what files are included or excluded by using `--include` and `--exclude`:

```
doc-link-checker lint --include 'docs/**/*.md' --exclude 'docs/exclude-me/**/*.md'
```

Note how the glob strings are single-quoted. This prevents your shell from interpreting them,
ensuring that `doc-link-checker` can parse them. This is important for correct operation.

### Extend the default include and exclude globs

Use of the `--include` or `--exclude` flags overrides the default inclusion and exclusion globs. If
instead you just want to extend these defaults, you can use `--include-extend` and `--exclude-extend` instead:

```
doc-link-checker lint --include-extend '**/*.mark' --exclude-extend '**/hidden/**'
```

### Case sensitivity

Globbing is case-insensitive by default. To make it case-sensitive, pass the `--case-sensitive` flag:

```
doc-link-checker lint --case-sensitive
```

### Markdown type

By default, Markdown is parsed using the CommonMark spec. If your Markdown is targeting Github, or
you're using Docusaurus, you should specify `gfm` as your Markdown type:

```
doc-link-checker lint --md-type gfm
```

### Exit codes

If for some reason you need to control exit codes, you can do so with `--success-code` and `--failure-code`. They default to `0` and `1` respectively.

```
doc-link-checker lint --success-code 42 --failure-code 13
```

Customising the failure exit code only has an impact when everything else performs correctly, and
linting issues are discovered by the checker. If something else goes wrong, the value specified by
`--failure-code` is not used. An example of this is when the supplied directory to scan does not exist.

## Errors

For a full description of errors that may be displayed, check the upstream
[Doc Link Checker readme](https://github.com/djmattyg007/doc-link-checker#error-codes).

Note that the checker currently makes no attempt to verify URLs.

## Backwards compatibility

This project aims to follow [semantic versioning](https://semver.org).

- The CLI is the only public API. The code itself is not covered by any BC promises, and may change
  at any time for any reason.
- The CLI arguments in the `lint` command will only change with major version bumps.
- The output of the `lint` is not currently guaranteed to be stable. In future, it may be possible
  to utilise different reporters with different output, some of which may be declared as stable.
- What the `lint` command reports as an error may change with minor version bumps. The maintainers
  endeavour to ensure it will not change with patch version bumps, except where there are genuine
  bugs or regressions in behaviour.

## Development

### Typescript

The code is written in Typescript. You can check that the code compiles sucessfully by running
`tsc` lkike so:

```
$ yarn run build
```

### Linting

The tool `xo` is used for linting the code. This wraps eslint and `prettier` with a strict set of
default rules. You can run `xo` like so:

```
$ yarn run lint
```

### Debugging

At the moment, this package is mostly a thing wrapper around the underlying `doc-link-checker`
package. If you find any issues with detection of files or handling of links, the issue is likely
to be upstream:

https://github.com/djmattyg007/doc-link-checker

## Contributing

All contributions are welcome! Please make sure that any code changes are accompanied by updated
tests. I also recommend running prettier before committing, like so:

```
$ yarn run reformat
```

## License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
