import epicurusConnector from '../index'
const epicurus = epicurusConnector()

epicurus.server('findAccountBalanceHistory', function (msg, done) {
  const responseBody = {
    key: 'cake',
    speed: 'slow',
    distance: 'close',
    when: 'now'
  }

  done(null, responseBody)
})

console.log('Epicurus Server booted. Listening on findAccountBalanceHistory')
