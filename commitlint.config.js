/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "test",
        "docs",
        "ci",
        "chore",
        "refactor",
        "perf",
        "build",
        "style",
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        "contract",
        "backend",
        "frontend",
        "e2e",
        "ci",
        "docs",
        "chore",
        "release",
      ],
    ],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "header-max-length": [2, "always", 100],
  },
};
