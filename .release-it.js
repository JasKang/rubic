module.exports = {
  git: {
    commitMessage: 'chore: release v${version}',
  },
  npm: {
    skipChecks: true,
    tag: 'latest',
  },
  hooks: {
    'before:init': ['pnpm test', 'pnpm build'],
    // 'before:release': 'pnpm build',
    'after:release': 'echo Successfully released ${name} v${version} to ${repo.repository}.',
  },
  github: {
    release: true,
    preRelease: false,
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: 'angular',
      infile: 'CHANGELOG.md',
    },
  },
}
