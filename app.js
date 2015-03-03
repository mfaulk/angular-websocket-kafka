
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  socket = require('./routes/socket.js');

var app = module.exports = express.createServer();

// Hook Socket.io into Express
var io = require('socket.io').listen(app);

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

// Kafka example
var kafka = require('kafka-node');

var KAFKA_BROKER = 'localhost:2181';
var KAFKA_CLIENT_ID = "angular-websocket-kafka";
var kafkaClient = new kafka.Client(KAFKA_BROKER, KAFKA_CLIENT_ID);
var producer = new kafka.Producer(kafkaClient);
var consumer = new kafka.Consumer(kafkaClient, [], {autoCommit: true});
var topics = ['topic1', 'topic2'];

producer.on('error', function (err) {
  console.log("Producer", err);
});

producer.on('ready', function (message) {
  initializeTopics(topics);
  setInterval(sendMessage, 1000); 
});

consumer.on('message', function (message) {
  console.log(message);
});

// Attempt to auto-create topics, and then add those topics to the consumer.
function initializeTopics(topics) {
  producer.createTopics(topics, false, function (err, data) {
    if(err) {
      console.log(err);
    } else {
      console.log('Created topics.');
      console.log(data);
    }

    consumer.addTopics(topics, function (err, added) {
      if (err) {
        // If topics don't exist yet, an error is expected.
        console.log(err);
      } else {
        console.log(added);
      }
    });

  });

}

function sendMessage() {
  var payloads = [
    { topic: 'topic1', messages: 'hi', partition: 0 },
    { topic: 'topic2', messages: ['hello', 'world'] }
    ];
  console.log('Sending...');
  producer.send(payloads, function(err, data){
    console.log('.');
  });
}






