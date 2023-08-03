import { Runnable, Execution, Flow } from '@tmplr/core'
import { Location } from 'mapped-file'


export class LocatedError extends Error {
  constructor(
    readonly proxy: Error | string | unknown,
    readonly location: Location
  ) { super(typeof proxy === 'string' ? proxy : (proxy as any).message) }

  source() {
    return this.location.file.range(this.location.range, { surrounding: 1 })
  }
}


export class LocatedExecution<T> extends Execution<T> {
  constructor(
    public readonly runnable: LocatedRunnable<T>,
    flow: Flow,
  ) {
    super(flow)
  }

  async run() {
    try {
      return await this.delegate(this.runnable.proxy.run(this.flow))
    } catch (err) {
      if (err instanceof LocatedError) {
        throw err
      } else {
        throw new LocatedError(err, this.runnable.location)
      }
    }
  }
}


export class LocatedRunnable<T> extends Runnable<T> {
  constructor(
    public readonly proxy: Runnable<T>,
    public readonly location: Location,
  ) {
    super()
  }

  run(flow: Flow): LocatedExecution<T> {
    return new LocatedExecution(this, flow)
  }
}
