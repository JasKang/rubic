import { defineConfig } from 'tsup'
import pkg from './package.json'

function depsFilter(originDeps: string[], deps: string[] = []) {
  return originDeps.filter(dep => {
    return !deps.includes(dep)
  })
}

export default defineConfig(() => {
  // @ts-ignore
  const deps = pkg.dependencies || {}

  return {
    entryPoints: ['src/index.ts'],
    format: ['cjs', 'esm'],
    target: 'es2015',
    splitting: false,
    // legacyOutput: true,
    minify: true,
    sourcemap: true,
    clean: true,
    dts: true,
    define: {
      'process.env.NODE_ENV': '"production"',
      __TEST__: 'false',
    },
    external: depsFilter(Object.keys(deps), []),
    banner: {
      js: `/**\n * name: ${pkg.name}\n * version: ${pkg.version}\n */`,
    },
    onSuccess: ``,
  }
})
