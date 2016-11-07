
var amqp = require('amqplib/callback_api');

function generateUuid() {
  return Math.random().toString() +
		 Math.random().toString() +
		 Math.random().toString();
}

module.exports = {
	connect : function(callback) {
		amqp.connect('amqp://localhost', function(err, conn) {
			callback(conn);
		});
	},

	sendMessage : function(queue_name, payload, callback) {
		this.connect(function(conn) {
			conn.createChannel(function(err, ch) {
				ch.assertQueue('', {exclusive: true}, function(err, q) {
					var corr = generateUuid();
					ch.consume(q.queue, function(msg) {
						if (msg.properties.correlationId === corr) {
							callback(JSON.parse(msg.content.toString()));
							var responseWait = setTimeout(function() {
								conn.close();
								// process.exit(0);
							}, 50000);
						}
					}, {noAck: true});
					ch.sendToQueue(queue_name, new Buffer(JSON.stringify(payload)), {
						correlationId: corr,
						replyTo: q.queue
					});
				});
			});
		})
	}
}