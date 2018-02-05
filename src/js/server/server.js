const express = require('express');
const app = express();
const ws = require('./ws');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const formidable = require('formidable');
const fs = require('fs');

mongoose.Promise = global.Promise;
// подключение
mongoose.connect('mongodb://localhost:27017/chatdb');

app.use(express.static('../../public'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get('/', function (req, res) {
    res.sendFile(path.resolve('../index.html'));
});

//  Фото пользователя
app.post('/photo', function (req, res) {
    let img = req.body.photo;
    let base64Data = '';
    let binaryData = '';
    let path = `../images/${req.body.login}.jpeg`;

    base64Data = img.replace('url("data:image/jpeg;base64,', '');
    base64Data += base64Data.replace('+', ' ');
    base64Data += base64Data.replace('")', ' ');
    binaryData = new Buffer(base64Data, 'base64').toString('binary');

    fs.writeFile(path, binaryData, 'binary', function (err) {
        if(err) return console.log(err);
    });

    ws.User.findOne({login: req.body.login}, function (err, user) {
        if (err) return console.log(err);

        let id = user._id;

        ws.User.findByIdAndUpdate(id, {photo: path}, function(err, user){
            if(err) return console.log(err);

            res.send(path);
        });
    });
});

//  Проверка авторизованного пользователя
app.post('/autorize', function (req, res) {
    let login = req.body.login;
    let name = req.body.name;

    ws.User.findOne({login: login}, function (err, user) {
        if (err) return console.log(err);

        if (user) {
            res.send(user);
        } else {
            ws.User.create({name: name, login: login}, function(err, newUser){
                if(err) return console.log(err);

                res.send(newUser);
            });
        }
    });
});

app.listen(8080, function () {
    console.log('Listen port 8080!')
});
