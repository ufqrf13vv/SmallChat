var http = require('http');
var WebSocketServer = new require('ws');

// подключенные клиенты
var clients = {};

// WebSocket-сервер на порту 8080
var webSocketServer = new WebSocketServer.Server({port: 8080});
webSocketServer.on('connection', function(ws) {

    var id = Math.random();
    clients[id] = ws;
    console.log("новое соединение " + id);

    ws.on('message', function(message) {
        console.log('получено сообщение ' + message);

        for(var key in clients) {
            clients[key].send(message);
        }
    });

    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        delete clients[id];
    });

});

console.log("Сервер запущен на портах 8080");