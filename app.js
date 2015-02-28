
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  socket = require('./routes/socket.js');

var app = module.exports = express.createServer();

// Hook Socket.io into Express
var io = require('socket.io').listen(app);

// Kafka
// TODO: get Kafka broker(s) IP from environment variable or etcd
// This may raise an exception when a new topic is created...
var KAFKA_BROKER = '192.168.86.5:2181';
var KAFKA_CLIENT_ID = "angular-websocket-kafka";
var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    Consumer = kafka.Consumer,
    kafkaClient = new kafka.Client(KAFKA_BROKER, KAFKA_CLIENT_ID),
    kafkaProducer = new Producer(kafkaClient),
    kafkaConsumer = new Consumer(
        kafkaClient,
        [], // no payloads
        {
            autoCommit: false
        }
    );

// send a message on a topic
var payloads = [
        { topic: 'topic1', messages: 'hi', partition: 0 },
        { topic: 'topic2', messages: ['hello', 'world'] }
    ];
kafkaProducer.on('ready', function () {
    kafkaProducer.send(payloads, function (err, data) {
        console.log("producer");
        console.log(data);
    });

});
// console.log the received message
kafkaConsumer.addTopics(['topic1', 'topic2'], function (err, added) {
  console.log("consumer");
  console.log(err);
  console.log(added);
});

kafkaConsumer.on('message', function (message) {
    console.log(message);
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Socket.io Communication

io.sockets.on('connection', socket);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
