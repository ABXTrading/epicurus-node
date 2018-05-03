import { expect } from 'chai'
import Epicurus from '../index'

describe('pubsub', () => {
  let epicurus: ReturnType<typeof Epicurus>
  beforeEach(() => {
    epicurus = Epicurus()
  })

  afterEach(() => {
    epicurus.close()
  })

  describe('subscribe', () => {
    it('a subscriber receives the correct message as an object', (done) => {
      const msg = {hello: 'world'}
      // Subscribe returns a promise that resolves when a subscription is successfully listening.
      epicurus.subscribe<{hello: 'string'}>('sampleChannel', (msgReceived) => {
        expect(msgReceived).to.eql({hello: 'world', channel: 'sampleChannel'})
        done()
      }).then(() => {
        epicurus.publish('sampleChannel', msg)
      }).catch(done)
    })

    it('subscribers are correctly selective on message identity', (done) => {
      const msg = {hello: 'world'}
      epicurus.subscribe('sampleChannel', (msgReceived) => {
        expect(msgReceived).to.eql({hello: 'world', channel: 'sampleChannel'})
        done()
      }).then(() => {
        return epicurus.subscribe('settlementReserved', (msgReceived) => {
          done(new Error('Incorrect sub block'))
        })
      }).then(() => {
        epicurus.publish('sampleChannel', msg)
      }).catch(done)
    })

    it('does not process a message after the shutdown event has been received', (done) => {
      const msg = {hello: 'world'}
      epicurus.subscribe('sampleChannel', (msgReceived) => {
        done(new Error('Message should not have been received'))
      }).then(() => {
        epicurus.shutdown()
        epicurus.publish('sampleChannel', msg)
        setTimeout(() => {
          done()
        }, 10)
      }).catch(done)
    })
  })

  describe('publish', () => {
    it('is able to send a message to multiple subscribers', (done) => {
      let count = 0
      const msg = {hello: 'world'}

      epicurus.subscribe('sampleChannel', (msgReceived) => {
        expect(msgReceived).to.eql({hello: 'world', channel: 'sampleChannel'})
        count++
        if (count === 2) {
          done()
        }
      }).then(() => {
        return epicurus.subscribe('sampleChannel', (msgReceived) => {
          expect(msgReceived).to.eql({hello: 'world', channel: 'sampleChannel'})
          count++
          if (count === 2) {
            done()
          }
        })
      }).then(() => {
        epicurus.publish('sampleChannel', msg)
      }).catch(done)

    })
  })
})
