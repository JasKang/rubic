module.exports = {
  git: {
    commitMessage: 'chore: release v${version}',
  },
  npm: {
    skipChecks: true,
  },
  hooks: {
    // 'before:init': ['yarn test'],
    'before:release': 'pnpm build',
    'after:release': 'echo Successfully released ${name} v${version} to ${repo.repository}.',
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: 'angular',
      infile: 'CHANGELOG.md',
    },
  },
}
