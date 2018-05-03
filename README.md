# Epicurus

Epicurus provides a simple Request/Response and Publish/Subscribe abstraction on top of Redis.

## Usage

### Instantiation
Instantiate Epicurus by giving it credentials to your Redis database.

```
let epicurus = Epicurus('yourRedisHost', 6379)
```

Epicurus is not a singleton. It is simply a function that instantiates an instance of the redis client, and gives the returned functions access to this instance. Each time you instantiate Epicurus, you create a new Redis client. This isn't usually a problem, but if you wish to use Epicurus through your project, it is sensible to instantiate and export the instance from one location.

### Request Response
The true power of Epicurus is highly performant request/response communication between micro-services. Epicurus removes the complexity of HTTP service discovery, and has load-balancing built in.

The request/response abstraction utilises the BRPOP mechanism of Redis to generate server listeners. These servers respond to the requesters by pushing to uniquely identified list.

```
epicurus.server('sampleEndpoint', function (request, callback) {
  expect(request.body).to.eql('boo')
  callback(null, {msg: 'hello'})
})

const result = await epicurus.request('sampleEndpoint', {body: 'boo'})
expect(result).to.eql({msg: 'hello'})
```

### PUBSUB
Epicurus provides a convenience wrapper around Redis PUBSUB, that allows the declaration of message channels.

This plays particularly with TypeScript enums.

```
epicurus.subscribe('sampleChannel', (msgReceived) => {
  expect(msgReceived).to.eql({hello: 'world', channel: 'sampleChannel'})
})

epicurus.publish('sampleChannel', {hello: 'world'})

```

## TypeScript
Epicurus is written in TypeScript, and ships with type declarations. It's use is highly recommended.
