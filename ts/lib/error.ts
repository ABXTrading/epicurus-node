export class EpicurusError extends Error {
  public id: number
  public context: {}
  public status: {}
  public severity: number

  constructor(
    message: string,
    meta: {
      context?: {},
      args?: any,
      requestReference?: any,
      severity: number,
      status?: number,
      id?: number,
      stack?: string,
      name?: string
    }
   ) {
    super(message)
    this.id = meta.id || Number((Math.random() * 100000).toFixed(0))
    this.name = meta.name || this.name
    this.context = meta.context
    this.stack = (<any>new Error()).stack
    this.status = meta.stack || meta.status
    this.severity = meta.severity
  }

  public toString() {
    return this.name + ': ' + this.message
  }
}
