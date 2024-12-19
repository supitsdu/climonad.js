# 🤝 Contributing to Climonad.js

We welcome contributions! Whether you’re fixing a bug, suggesting a feature, or improving documentation, your help is appreciated.

## 📝 How to Contribute

### 1. **Report Bugs**

Found a bug? Please check existing issues first. If it’s not reported, open a new issue with a clear description, including steps to reproduce and error messages.

### 2. **Suggest Features**

Got an idea for a feature? Check if it’s already suggested, then open an issue with a brief description of the feature and its benefits.

### 3. **Submit a Pull Request (PR)**

To contribute code:

1. Fork the repository and clone it locally.
2. Create a new branch: `git checkout -b feature/my-feature`.
3. Make your changes, add tests if necessary, and commit with clear messages.
4. Push your branch and create a PR.

### 4. **Code Style**

Please follow the existing code style (simple, clean, and easy to follow). We use **Biome** for linting and **Prettier** for formatting:

- Run linter: `npm run lint`
- Fix linting issues: `npm run lint:fix`
- Format Markdown files: `npm run format`

### 5. **Tests**

If you're adding a feature or fixing a bug, please add tests using **Vitest**. Ensure all tests pass before submitting your PR:

- Run tests: `npm run test`
- Watch tests: `npm run test:watch`
- Check test coverage: `npm run test:coverage`

### 6. **Build**

Before submitting your PR, ensure the project builds successfully:

- Build the project: `npm run build`
- Clean build artifacts: `npm run clean`

### 7. **Benchmarks**

For performance improvements, run benchmarks using **Deno's bench tool**:

- Run benchmarks: `npm run bench`

## 📚 Resources

- [Deno Docs](https://docs.deno.com/)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Rollup Documentation](https://rollupjs.org/introduction/)
- [Biome Documentation](https://biomejs.dev/guides/getting-started/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🛠 Example Workflow

1. Fork the repo.
2. Clone it locally.
3. Create a new branch: `git checkout -b feat/my-feature`.
4. Make your changes, commit, and push.
5. Open a PR.

## 🙋‍♀️ Need Help?

If you have questions, feel free to open an issue or discussion.

Thank you for contributing! 🎉
