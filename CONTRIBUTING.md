# Contributing

Contributions are welcome! Whether you’re fixing a bug, suggesting a feature, or improving documentation, your help is much appreciated.

## Introduction

The goal behing creating this framework was to add a extra layer of modularization, performance, security, and usability which would help developers around the world on writing small or larger Node.js CLI tools.

## Developers Guide

### Basic Workflow

1. Fork the original repo `https://github.com/supitsdu/climonad.js`.
2. Clone it locally `git clone <your-fork-url>`
3. Create a new branch: `git checkout -b feat/my-feature`.
4. Make your changes, commit, and push.
5. Open a PR.

### Code Style

Please follow the existing code style (simple, clean, and easy to follow).

- Run linter: `npm run lint`
- Fix linting issues: `npm run lint:fix`
- Format Markdown files: `npm run format`

### Tests

If you're adding a feature or fixing a bug, please add tests using **Vitest**. Ensure all tests pass before submitting your PR:

- Run tests: `npm run test`
- Watch tests: `npm run test:watch`
- Check test coverage: `npm run test:coverage`

### Build

Before submitting your PR, ensure the project builds successfully:

- Build the project: `npm run build`
- Clean build artifacts: `npm run clean`

### Benchmarks

For performance improvements, run benchmarks using **Deno's bench tool**:

- Run benchmarks: `npm run bench`

### Project Structure

```toml
src\
    cli.ts                   # CLI entry point
    flags.ts                 # Flag parsing logic
    main.ts                  # Exposes public API
    parser.ts                # Command-line argument parser
    types.ts                 # Type definitions
    usageGenerator.ts        # Usage information generator
    utils.ts                 # Utility functions
test\
    bench.ts                 # Benchmark tests
    cli.test.ts              # Tests for CLI functionality
    flags.test.ts            # Tests for flag parsing
    parser.test.ts           # Tests for argument parser
    types.test.ts            # Tests for type definitions
    usageGenerator.test.ts   # Tests for usage generator
    utils.test.ts            # Tests for utility functions
```

## Help Needed

Climonad is a community-driven project and any help you can provide is much appreciated. Here are some areas where you can contribute:

### Issue Triage

Help us manage issues by:

- Reproducing reported bugs
- Clarifying issue descriptions
- Tagging issues with appropriate labels

### Pull Requests

We encourage you to open pull requests, especially for issues tagged with the help-needed label.

### Community Support

Assist other users by participating in the issue tracker, and GitHub discussions. Your expertise can help others solve problems and improve their experience with Climonad.js.

## Resources

- [Deno Docs](https://docs.deno.com/)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Rollup Documentation](https://rollupjs.org/introduction/)
- [Eslint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Conventional Commits](https://www.conventionalcommits.org/)
