export function handleFileSelect(event, photoField) {
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

export function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}