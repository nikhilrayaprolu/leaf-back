let Jimp = require('jimp')
    ,fs = require('fs')
    ,path = require('path')
    ,_ = require('lodash')

    ,fileType = require('file-type');

module.exports = {
    convertImgs(files){
        _.forEach(files, (file)=>{

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