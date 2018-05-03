# Integration Testing

This is a utility directory that allows simple load testing of this library

None of this code is compiled into the published module.

Request Response Testing:

Start x number of servers

```
node js/integration/server.js
```

Start the HTTP client

```
node js/integration/client.js
```

Use a tool like loadtest (npm i -g loadtest) to see request response in action

```
loadtest -c 3 --rps 1000 http://localhost:22222
```
