// istanbul ignore file

import { providerFromFunctions, ProviderNamespace, scopeFromProviders, FileSystem, ChangeLog, EvaluationContext, STANDARD_PIPES } from '@tmplr/core'


function testFS(files: {[key: string]: string}, root: string, scope: string): FileSystem {
  return {
    read: jest.fn(async (name: string) => {
      if (name in files) {
        return files[name]!
      }

      throw new Error('File not found.')
    }),
    write: jest.fn(async (name: string, content: string) => {
      files[name] = content
    }),
    absolute: jest.fn(_ => _),
    rm: jest.fn(async (name: string) => {
      delete files[name]
    }),
    access: jest.fn(async(name: string) => {
      if (!(name in files)) {
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
  const fs = testFS(options.files || {}, options?.root || '.', options?.scope || '.')
  const log = new ChangeLog()
  const context = new EvaluationContext(scope, STANDARD_PIPES)

  return { scope, fs, log, context }
}
