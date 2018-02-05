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
    let id = Math.floor(Math.random() * (100 - 10)) + 10;

    connections[id] = ws;
    console.log("Новое соединение " + id);

    ws.on('message', function (message) {
        console.log('Получено сообщение ' + message);

        for (let key in connections) {
            let data = JSON.parse(message);

            if (data.type === 'message') {
                Message.create({ name: data.name,
                                 message: data.message,
                                 time: data.time,
                                 login: data.login
                },
                    (err, doc) => {
                        if (err) return console.log(err);
                });
            }

            connections[key].send(message);
        }
    });

    ws.on('close', function () {
        console.log(`Соединение №${id} закрыто.`);
        delete connections[id];
    });
});

module.exports = {
    User: User,
    userSchema: userSchema
};
