# Angular-websocket

Expands upon the [AngularJS Socket.IO Seed](https://github.com/btford/angular-socket-io-seed) demo by adding Docker support, a Fleet unit file, and Kafka integration.

## Running locally
```
npm install
node app.js
```
And navigate to `localhost:3000`

## Running locally with Docker
```
docker build -t angular-websocket-kafka .
docker run -p 3000:3000 -d angular-websocket-kafka
```
The app should now be running on `localhost:3000`, or if you are using boot2docker on port 3000 of your boot2docker IP address (run `echo $(boot2docker ip)` to find it).

## Deploying to CoreOS
```
fleetctl start angular-websocket-kafka.service
```
