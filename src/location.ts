import { Runnable, Execution } from '@tmplr/core'
import { pipe, observe, tap } from 'streamlets'
import { Location } from 'mapped-yaml'


export class LocatedError extends Error {
  constructor(
    readonly proxy: Error | unknown,
    readonly location: Location
  ) { super((proxy as any).message) }

  source() {
    return this.location.file.range(this.location.range, { surrounding: 1 })
  }
}


export class LocatedExecution<T> extends Execution<T> {
  constructor(
    public readonly proxy: Execution<T>,
    public readonly location: Location,
  ) {
    super()
  }

  async run() {
    const observation = pipe(
      this.proxy.tracker,
      tap(stack => this.tracker.receive(stack)),
      observe,
    )

    try {
      return await (this.proxy as any).run()
    } catch (err) {
      throw new LocatedError(err, this.location)
    } finally {
      observation.stop()
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

  run() {
    return new LocatedExecution(this.proxy.run(), this.location)
  }
}
