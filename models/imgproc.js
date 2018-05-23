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
            Jimp.read(file.destination + file.filename, function (err, lenna) {
                console.log(lenna);
                if (err) throw err;
                if(lenna.bitmap.height>lenna.bitmap.width)
                    lenna.rotate(90);
                lenna
                    .write(file.destination + file.filename + '.jpg', function (err,data) {
                        console.log(err,data);
                    }); // save
                console.log(file.destination + file.filename);
                fs.unlink(file.destination+file.filename);
            });
            });
    }
};