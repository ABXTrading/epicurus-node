export type serverCallback<T, S> = (body: T & {channel: string}, responseCallback: (error: any, response?: S) => any) => any
export type subscribeCallback<T> = (body: T & {channel: string}) => any

export interface EpicurusPubSubCallbackReference {
  [channel: string]: Function[]
}

export interface EpicurusRequest {
  reqId: string
  body: any
  ttl: number
}

export interface EpicurusResponse {
  error?: any
  result?: any
}

export interface EpicurusRedisConfig {
  host: string
  port: number
}
