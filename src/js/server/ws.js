const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({port: 8090});
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let connections = {};

mongoose.Promise = global.Promise;

// Схемы данных
let userSchema = new Schema({
    name: String,
    login: String,
    photo: String
}, {
    versionKey: false
});

let messageSchema = new Schema({
    login: String,
    name: String,
    message: String,
    time: String
}, {
    versionKey: false
});

// подключение
mongoose.connect('mongodb://localhost:27017/chatdb');

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

wss.on('connection', function (ws) {
    let id = getRandomArbitrary(1, 50);

    connections[id] = ws;
    console.log("новое соединение " + id);

    ws.on('message', function (message) {
        console.log('получено сообщение ' + message);

        for (let key in connections) {
            let data = JSON.parse(message);

            if (data.type === 'message') {
                Message.create({ name: data.name,
                                 message: data.message,
                                 time: data.time,
                                 login: data.login
                },
                    (err, doc) => {
                        createCallBack(err, doc, 'message');
                });
            }

            connections[key].send(message);
        }
    });

    ws.on('close', function () {
        console.log('соединение закрыто ' + id);
        delete connections[id];
    });

});

function createCallBack(error, document, object) {
    if (error) return console.log(error);
    console.log(`Сохранен объект ${object}`, document);
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
    User: User,
    userSchema: userSchema
};
