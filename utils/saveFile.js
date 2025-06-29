
const path = require("path");
const fs = require("fs");


let saveFile = (file, destination) => {
    let folder = 'public/images/orthers';

    if (file.fieldname === 'image') {
        folder = 'public/images/movie';
    }

    if (file.fieldname === 'banner') {
        folder = 'public/images/banner';
    }
}
