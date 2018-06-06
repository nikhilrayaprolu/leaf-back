mongoose = require('mongoose');
var passport = require('passport');
var config = require('./../config/database');
var jwt = require('jwt-simple');
var Schema = mongoose.Schema;
autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/leaf-nodekb");
autoIncrement.initialize(connection);
var exifSchema = new Schema({
    leafname: {type: String},
    metadata: {type: Object},
    timestamp: { type: Date, default: Date.now},
});
exifSchema.plugin(autoIncrement.plugin,'exifSchema');

var addExif=mongoose.model('addExif',exifSchema);
exports.addExifdata = mongoose.model('addExif',exifSchema);
exports.addExif = function (leafname, metadata) {
        var exif = new addExif({
        leafname: leafname,
        metadata: metadata
    });
    exif.save();
};