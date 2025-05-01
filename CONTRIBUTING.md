# Contributing

Contributions are welcome! Whether you're fixing a bug, suggesting a feature, or improving documentation, your help is much appreciated.

Please note that this project has a [Code of Conduct](./CODE_OF_CONDUCT.md), which all contributors are expected to follow.

---

## **Goal**

Climonad.js aims to provide a functional programming library that focuses on monadic operations and control flow abstractions. Our goal is to create a lightweight, efficient, and type-safe library that helps developers write more maintainable, composable, and error-resistant code across both Deno and Node.js environments.

We prioritize:

- Type safety and comprehensive TypeScript support
- High performance with minimal overhead
- Clear documentation and examples
- Cross-platform compatibility
- Adherence to functional programming principles

---

## **Developer Guide**

### **Basic Workflow**

1. **Fork the repository**: [https://github.com/supitsdu/climonad.js](https://github.com/supitsdu/climonad.js)
2. **Clone your fork locally**:
   ```bash
   git clone <your-fork-url>
   ```
3. **Create a new branch**:
   ```bash
   git checkout -b feat/my-feature
   ```
   Branch naming conventions:
   - `feat/` - For new features
   - `fix/` - For bug fixes
   - `docs/` - For documentation changes
   - `refactor/` - For code refactoring
   - `test/` - For adding or improving tests
   - `chore/` - For build process or tooling changes
4. **Make changes, commit, and push**:
   ```bash
   git add .
   git commit -m "feat: add a cool feature"
   git push origin feat/my-feature
   ```
   We follow [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages.
5. **Open a pull request**: Compare your branch against `main` in the original repository and submit your PR.

---

### **Code Style**

Adhere to the existing code style to ensure consistency across the project.

- **Lint your code**:
  ```bash
  npm run lint
  ```
- **Fix linting issues**:
  ```bash
  npm run lint:fix
  ```
- **Format Markdown files**:
  ```bash
  npm run format
  ```

---

### **Testing**

If you're adding a feature or fixing a bug, please add tests using **Vitest**. Ensure all tests pass before submitting your PR:

- Run tests:
  ```bash
  npm run test
  ```
- Watch tests:
  ```bash
  npm run test:watch
  ```
- Check test coverage:
  ```bash
  npm run test:coverage
  ```

---

### **Building the Project**

Ensure the project builds successfully before submitting your PR:

- Build the project:
  ```bash
  npm run build
  ```
- Clean build artifacts:
  ```bash
  npm run clean
  ```

---

### **Benchmarking**

For performance improvements, run benchmarks using **Deno's bench tool**:

- Run benchmarks:
  ```bash
  npm run bench
  ```

---

## **How to Contribute**

### **Help with Issues**

Assist us in managing issues by:

- Reproducing reported bugs
- Clarifying issue descriptions
- Tagging issues with appropriate labels

### **Open Pull Requests**

We encourage you to open PRs, especially for issues tagged with the `help-needed` label.

### **Community Support**

Engage with other developers by participating in discussions on the issue tracker and GitHub discussions. Your expertise helps improve the framework for everyone.

---

## **Resources**

- [Deno Docs](https://deno.land/manual)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Rollup Documentation](https://rollupjs.org/introduction/)
- [Eslint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

Thank you for contributing to Climonad.js! Your support is invaluable to the growth and success of this project.
