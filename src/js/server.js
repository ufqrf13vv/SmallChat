const WebSocketServer = require('ws').Server;
const http = require('http');
const wss = new WebSocketServer({ port: 8080 });

var connections = [];

wss.on('connection', function connection(ws) {
    console.log('new connection');
    connections.push(ws);

    ws.on('message', function incoming(message) {
        console.log('==========');
        console.log('new message "%s"', message);

        connections.forEach(function(connection) {
            console.log('sending data to client');
            let data = JSON.parse(message);
            console.log(data.type);

            connection.send(message, function(e) {
                if (e) {
                    connections = connections.filter(function(current) {
                        return current !== connection;
                    });

                    console.log('close connection');
                }
            });
        });

        console.log('==========');
    });

    ws.on('close', function() {
        connections = connections.filter(function(current) {
            return current !== ws;
        });

        console.log('close connection');
    });
});

//http.createServer(function(request, response) {
//    console.log(request.url);
//}).listen(8080);