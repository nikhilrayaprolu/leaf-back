let Jimp = require('jimp')
    ,fs = require('fs')
    ,path = require('path')
    ,_ = require('lodash')

    ,fileType = require('file-type');
var addExif = require("./exif");
var ExifImage = require('exif').ExifImage;
module.exports = {
    convertImgs(files){
        _.forEach(files, (file)=>{
            new ExifImage({ image : file.destination + file.filename }, function (error, exifData) {
            if (error)
                console.log('Error: '+error.message);
            else
                addExif.addExif(file.filename, exifData);
                console.log(exifData);
            });
            });
    }
};