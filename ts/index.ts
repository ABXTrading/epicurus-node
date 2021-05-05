import { subscribe, publish, setupSubscriptionListener, removeCallbacks, shutdownSubscribers } from './lib/pub_sub'
import { request, server, closeAllClients, enableServers, disableServers } from './lib/request_response'
import { EpicurusRedisConfig, serverCallback, subscribeCallback } from './interface'
import * as redis from 'redis'
import * as bluebird from 'bluebird'
import { RedisClient } from 'redis'
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

export default function Epicurus (redisConfig: EpicurusRedisConfig = {
  host: 'localhost',
  port: 6379
}): EpicurusPublicInterface {
  // A separate subscription Redis client is required as once a client has
  // called SUBSCRIBE, it is put into a slave mode the does not allow any other
  // kind of action
  const redisClient = redis.createClient(redisConfig)
  const redisSub = redis.createClient(redisConfig)

  setupSubscriptionListener(redisSub)
  enableServers()

  return {
    getRedisClient: () => redisClient,
    getRedisSubClient: () => redisSub,
    subscribe: <T = any>(channel: string, callback: subscribeCallback<T>) => subscribe(redisSub, channel, callback),
    publish: (channel: string, body: any) => publish(redisClient, channel, body),
    server: <T = any, S = any>(channel: string, callback: serverCallback<T, S>) => server(redisClient, channel, callback),
    request: <T = any>(channel: string, body: any) => request<T>(redisClient, channel, body),
    shutdown: () => {
      shutdownSubscribers()
      disableServers()
    },
    close: () => {
      redisSub.unsubscribe()
      redisSub.quit()
      redisClient.quit()
      removeCallbacks()
      closeAllClients()
    }
  }
}

export type EpicurusPublicInterface = {
  getRedisClient: () => RedisClient
  getRedisSubClient: () => RedisClient
  subscribe: <T = any>(channel: string, callback: subscribeCallback<T>) => Promise<void>
  publish: (channel: string, body: any) => void
  server: <T = any, S = any>(channel: string, callback: serverCallback<T, S>) => Promise<void>
  request: <T = any>(channel: string, body: any) => Promise<T>
  shutdown: () => void
  close: () => void
}
