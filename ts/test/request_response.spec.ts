import { expect } from 'chai'
import Epicurus from '../index'

describe('request response', () => {
  let epicurus: ReturnType<typeof Epicurus>
  beforeEach(() => {
    epicurus = Epicurus()
  })

  afterEach(() => {
    epicurus.close()
  })

  describe('request', () => {
    it('a request returns a promise that is resolved when the server finishes its callback', async () => {
      // Because of the nature of the request response implementation, messages will be picked up from
      // the server from the message queue - even if the server was not running at the point the message was sent.
      // The timeout parameter lets the server know if the message is still valid.
      epicurus.server<null, {msg: string}>('sampleEndpoint', function (request, callback) {
        callback(null, {msg: 'hello'})
      })

      const result = await epicurus.request('sampleEndpoint', {})
      expect(result).to.eql({msg: 'hello'})
    })

    it('a request is appropriately selective', async () => {
      epicurus.server('sampleEndpoint', function (request, callback) {
        callback(null, {msg: 'hello'})
      })

      epicurus.server('nonValidEndpoint', function (request, callback) {
        callback(null, {msg: 'goodbye'})
      })

      const result = await epicurus.request('sampleEndpoint', {})
      expect(result).to.eql({msg: 'hello'})
    })

    it('a request can receive multiple responses from the one server', async () => {
      epicurus.server('sampleEndpoint', function (request, callback) {
        callback(null, {msg: 'hello'})
      })

      const result = await epicurus.request('sampleEndpoint', {})
      expect(result).to.eql({msg: 'hello'})

      const resultTwo = await epicurus.request('sampleEndpoint', {})
      expect(resultTwo).to.eql({msg: 'hello'})

      const resultThree = await epicurus.request('sampleEndpoint', {})
      expect(resultThree).to.eql({msg: 'hello'})
    })

    it('a request promise will be rejected if the server callbacks with an error', (done) => {
      epicurus.server('sampleEndpoint', function (request, callback) {
        callback(new Error('Err'))
      })

      epicurus.request('sampleEndpoint', {}).catch((e) => {
        // This proves that errors are properly cast back to the type of error they were where
        // they were thrown
        expect(e.name).to.eql('Error')
        expect(e.message).to.eql('Err')
        done()
      })
    })

    it('only a single server receives a request', async () => {
      let count = 0
      epicurus.server('sampleEndpoint', function (request, callback) {
        count++
        callback(null, {msg: 'hello'})
      })

      epicurus.server('sampleEndpoint', function (request, callback) {
        count++
        callback(null, {msg: 'hello'})
      })

      const result = await epicurus.request('sampleEndpoint', {})
      expect(result).to.eql({msg: 'hello'})
      expect(count).to.eql(1)
    })

    it('a server receives a request with the channel on it', async () => {
      let serverChannelName = ''
      epicurus.server('sampleEndpoint', function (request, callback) {
        serverChannelName = request.channel
        callback(null, {msg: 'hello'})
      })

      await epicurus.request('sampleEndpoint', {})
      expect(serverChannelName).to.eql('sampleEndpoint')
    })

    it('a server stops processing requests when shutdown is called', async () => {
      const epicurusTwo = Epicurus()
      let count = 0
      let countTwo = 0

      epicurus.server('sampleEndpoint', (request, callback) => {
        count++
        callback(null, {msg: 'hello'})
      })

      await epicurus.request('sampleEndpoint', {})
      epicurus.shutdown()

      await Promise.all([
        epicurus.request('sampleEndpoint', {}).then(() => {
          expect(count).to.eql(1)
          expect(countTwo).to.eql(1)
        }),
        new Promise((res, rej) => {
          // The first server block has been shutdown, so the second request is currently pending without
          // a server to proces the request. So We set this server block on our second instance such
          // that the request will resolve. The interval is to ensure that the original server
          // has stopped accepting requests
          setTimeout(() => {
            res()
            epicurusTwo.server('sampleEndpoint', (request, callback) => {
              countTwo++
              callback(null, {msg: 'hello'})
            })
          }, 20)
        })
      ])
    })
  })
})
