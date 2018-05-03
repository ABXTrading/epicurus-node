import { EpicurusPubSubCallbackReference, subscribeCallback } from '../../interface'

let callbackReference: EpicurusPubSubCallbackReference = {}
let enableMessageEvents

export function subscribe<T>(subClient, channel: string, callback: subscribeCallback<T>): Promise<void> {
  subClient.subscribe(channel)

  if (callbackReference[channel]) {
    callbackReference[channel].push(callback)
  } else {
    callbackReference[channel] = [callback]
  }

  return new Promise((res) => {
    subClient.on('subscribe', (channelSubscribedTo) => {
      if (channel === channelSubscribedTo) {
        res()
      }
    })
  })
}

export function publish(redisClient, channel: string, body): void {
  const message = JSON.stringify(body)
  redisClient.publish(channel, message)
}

export function setupSubscriptionListener (subClient) {
  enableMessageEvents = true

  subClient.on('message', function (channel: string, message) {
    if (!enableMessageEvents) {
      return
    }

    const callbacks = callbackReference[channel]
    if (callbacks) {
      let response = JSON.parse(message)
      response.channel = channel
      callbacks.forEach(callback => callback(response))
    }
  })
}

export function shutdownSubscribers () {
  enableMessageEvents = false
}

export function removeCallbacks () {
  callbackReference = {}
}
