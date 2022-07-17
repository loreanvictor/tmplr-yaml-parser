// istanbul ignore file
import { basename, dirname, join, normalize, isAbsolute } from 'path'

import { providerFromFunctions, ProviderNamespace, scopeFromProviders, FileSystem, ChangeLog, EvaluationContext, STANDARD_PIPES } from '@tmplr/core'


function testFS(options: { files: {[key: string]: string} }, root: string, scope: string): FileSystem {
  return {
    read: jest.fn(async (name: string) => {
      if (name in options.files) {
        return options.files[name]!
      }

      throw new Error('File not found.')
    }),
    write: jest.fn(async (name: string, content: string) => {
      options.files[name] = content
    }),
    absolute: jest.fn(path => normalize(isAbsolute(path) ? path : join(root, path))),
    dirname: jest.fn(path => dirname(path)),
    basename: jest.fn(path => basename(path)),
    rm: jest.fn(async (name: string) => {
      delete options.files[name]
    }),
    access: jest.fn(async(name: string) => {
      if (!(name in options.files)) {
        throw new Error('File not found.')
      }
    }),
    fetch: jest.fn(),
    cd: jest.fn(),
    scope,
    root,
  }
}


export function testSetup(options: {
  files?: {[name: string]: string}
  varprefix?: string,
  root?: string,
  scope?: string,
  providers?: {[name: string]: {[name: string]: () => Promise<string>}}
} = {}) {
  const provns: ProviderNamespace = {}

  if (options.providers) {
    Object.entries(options.providers).forEach(([name, fns]) => {
      provns[name] = providerFromFunctions(fns)
    })
  }

  const scope = scopeFromProviders(provns, options?.varprefix || '_')
  const fs = testFS({ files: options.files || {} }, options?.root || '.', options?.scope || '.')
  const log = new ChangeLog()
  const context = new EvaluationContext(scope, STANDARD_PIPES)

  return { scope, fs, log, context }
}
