const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({port: 8090});
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let connections = [];

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

wss.on('connection', function connection(ws) {
    console.log('new connection');
    connections.push(ws);

    ws.on('message', function incoming(message) {
        console.log('==========');
        console.log('new message "%s"', message);

        connections.forEach(function (connection) {
            let data = JSON.parse(message);

            //switch (data.type) {
            //    case 'user':
            //        User.create({name: data.user, login: data.login}, (err, doc) => {
            //            createCallBack(err, doc, 'user');
            //        });
            //        break;
            //    case 'message':
            //        Message.create({name: data.name, message: data.message, time: data.time}, (err, doc) => {
            //            createCallBack(err, doc, 'message');
            //        });
            //        break;
            //}

            connection.send(message, function (e) {
                if (e) {
                    connections = connections.filter(function (current) {
                        return current !== connection;
                    });

                    console.log('close connection');
                }
            });
        });
        console.log('==========');
    });

    ws.on('close', function () {
        connections = connections.filter(function (current) {
            return current !== ws;
        });

        mongoose.disconnect();
        console.log('close connection');
    });
});

function createCallBack(error, document, object) {
    if (error) return console.log(error);
    console.log(`Сохранен объект ${object}`, document);
}

module.exports = {
    User: User,
    userSchema: userSchema
};
