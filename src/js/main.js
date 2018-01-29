import '../css/style.css';
import '../index.hbs';

import messageTpl from '../template/message.hbs';
import userTpl from '../template/user.hbs';

const socket = new WebSocket("ws://localhost:8080");
const sendMessage = document.querySelector('#sendMessage');
const messageText = document.querySelector('#text');
const chat = document.querySelector('#chatList');
const userList = document.querySelector('#users');
const logIn = document.querySelector('#logIn');
const sidebarTitle = document.querySelector('#title');
const mainPhoto = document.querySelector('#mainPhoto');
const uploadPhotoWin = document.querySelector('#uploadPhotoWin');
const photoField = document.querySelector('#uploadPhoto');

let droppedFiles = false;
let files;

socket.onmessage = event => {
    let data = JSON.parse(event.data);

    if (data.type === 'message') {
        chat.innerHTML += messageTpl({message: data.message, time: data.time, name: data.name, image: 'image.png'});
    } else {
        const usersCount = document.querySelector('#count');

        userList.innerHTML += userTpl({name: data.user});
        usersCount.innerHTML = `(${userList.children.length})`;
    }
};

socket.onerror = error => {
    console.log("Ошибка " + error.message);
};

logIn.addEventListener('click', () => {
    const fio = document.querySelector('#fio');
    const login = document.querySelector('#login');
    const autorizeWindow = document.querySelector('#authorizationWin');
    let userName = fio.value;
    let userLogin = login.value;

    socket.send(JSON.stringify({
        user: userName,
        login: userLogin,
        type: 'user'
    }));

    sidebarTitle.innerHTML = userName;
    document.cookie = `user=${userLogin}`;
    autorizeWindow.style.display = 'none';
});

mainPhoto.addEventListener('click', () => {
    uploadPhotoWin.style.display = 'block';
});

uploadPhotoWin.addEventListener('click', event => {
    let target = event.target;

    if (target.id === 'photoCancel') {
        uploadPhotoWin.style.display = 'none';
        photoField.innerHTML = 'Перетащите фото сюда';
        document.querySelector('#photoLoad').setAttribute('disabled', 'disabled');
    } else if (target.id === 'photoLoad') {
        console.log(photoField.style.backgroundImage);
    }
});

uploadPhotoWin.dragenter = event => {
    event.preventDefault();
    event.stopPropagation();
};

uploadPhotoWin.addEventListener('dragover', handleDragOver, false);
uploadPhotoWin.addEventListener('drop', handleFileSelect, false);

function handleFileSelect(event) {
    event.stopPropagation();
    event.preventDefault();

    let files = event.dataTransfer.files;

    if (files.length > 1) {
        alert('Выберете только один файл');
    } else if (files[0].type != 'image/jpeg') {
        alert('Можно загружать только JPG-файл');
    } else if (files[0].size > 512000) {
        alert('Размер файла не должен превышать 512кб');
    } else {
        let fileReader = new FileReader();

        fileReader.onload = ( () => {
            return event => {
                photoField.innerHTML = '';
                photoField.style.backgroundImage = `url('${event.target.result}')`;
            }
        })(files[0]);
        fileReader.readAsDataURL(files[0]);
        document.querySelector('#photoLoad').removeAttribute('disabled');
    }
}

function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function send() {
    let message = messageText.value;
    let date = new Date();

    socket.send(JSON.stringify({
        message: message,
        name: sidebarTitle.innerHTML,
        time: `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`,
        type: 'message'
    }));
    messageText.value = '';
}

sendMessage.addEventListener('click', send);
