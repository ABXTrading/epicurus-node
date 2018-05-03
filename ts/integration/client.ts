import * as http from 'http'
import epicurusConnector from '../index'
const epicurus = epicurusConnector()

const server = http.createServer((req, res) => {
  epicurus.request('findAccountBalanceHistory', {hello: 'world'}).then((r) => {
    // console.log(r)
    res.setHeader('Content-Type', 'text/html')
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('ok')
  }).catch((e) => {
    console.log(e.message)
    res.writeHead(500, {'Content-Type': 'text/plain'})
    res.end()
  })
})

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.listen(22222)
console.log('Epicurus Client booted on 22222. Will request findAccountBalanceHistory')
