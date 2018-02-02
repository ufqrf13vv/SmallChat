import '../css/style.css';
import '../index.hbs';

import messageTpl from '../template/message.hbs';
import userTpl from '../template/user.hbs';

import ajax from './modules/ajax';
import { handleFileSelect, handleDragOver } from './modules/d&d';

const socket = new WebSocket("ws://localhost:8090");
const sendMessage = document.querySelector('#sendMessage');
const messageText = document.querySelector('#text');
const chat = document.querySelector('#chatList');
const userList = document.querySelector('#users');
const logIn = document.querySelector('#logIn');
const sidebarTitle = document.querySelector('#title');
const mainPhoto = document.querySelector('#mainPhoto');
const uploadPhotoWin = document.querySelector('#uploadPhotoWin');
const photoField = document.querySelector('#uploadPhoto');
const all = document.querySelector('#all');

socket.onopen = () => {
    console.log('websocket is connected ...');
};

socket.onmessage = event => {
    let data = JSON.parse(event.data);

    if (data.type === 'message') {
        if (data.photo) {
            chat.innerHTML += messageTpl({message: data.message, time: data.time, name: data.name, photo: data.photo, photoText: ''});
        } else {
            chat.innerHTML += messageTpl({message: data.message, time: data.time, name: data.name, photoText: 'No photo'});
        }
    } else {
        const usersCount = document.querySelector('#count');

        userList.innerHTML += userTpl({name: data.user});
        usersCount.innerHTML = `(${userList.children.length})`;
        mainPhoto.dataset.login = data.login;
    }
};

socket.onerror = error => {
    console.log("Ошибка " + error.message);
};

//  Авторизация пользователя
logIn.addEventListener('click', () => {
    const fio = document.querySelector('#fio');
    const login = document.querySelector('#login');
    const autorizeWindow = document.querySelector('#authorizationWin');
    let userName = fio.value;
    let userLogin = login.value;
    let data = JSON.stringify({ login: userLogin, name: userName });

    ajax('/autorize', data)
    .then(result => {
        let user = JSON.parse(result);

        sidebarTitle.innerHTML = user.name;

        if (user.photo) {
            mainPhoto.innerHTML = '';
            mainPhoto.style.backgroundImage = `url('${user.photo}')`;
        }

        socket.send(JSON.stringify({
            user: user.name,
            login: user.login,
            type: 'user'
        }));
    });

    autorizeWindow.style.display = 'none';
});

all.addEventListener('click', () => {
    ajax('/all')
    .then(result => {
        console.log(result)
    })
});

mainPhoto.addEventListener('click', () => {
    uploadPhotoWin.style.display = 'block';
});

//  Загрузка фото
uploadPhotoWin.addEventListener('click', event => {
    let target = event.target;

    if (target.id === 'photoCancel') {
        uploadPhotoWin.style.display = 'none';
        photoField.innerHTML = 'Перетащите фото сюда';
        document.querySelector('#photoLoad').setAttribute('disabled', 'disabled');
    } else if (target.id === 'photoLoad') {
        let login = mainPhoto.dataset.login;
        let photo = photoField.style.backgroundImage;
        let data = JSON.stringify({ photo: photo, login: login });

        ajax('/photo', data)
        .then(result => {
            console.log(result);
            uploadPhotoWin.style.display = 'none';
            mainPhoto.innerHTML = '';
            mainPhoto.style.backgroundImage = `url('${result}')`;
        });
    }
});

uploadPhotoWin.addEventListener('dragover', event => {
    handleDragOver(event)
}, false);

uploadPhotoWin.addEventListener('drop', event => {
    handleFileSelect(event, photoField)
}, false);

function send() {
    let message = messageText.value;
    let date = new Date();
    let avatar = mainPhoto.style.backgroundImage;

    socket.send(JSON.stringify({
        message: message,
        name: sidebarTitle.innerHTML,
        time: `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`,
        photo: avatar,
        type: 'message'
    }));

    messageText.value = '';
}

sendMessage.addEventListener('click', send);
