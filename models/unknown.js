mongoose = require('mongoose');
var passport = require('passport');
var config = require('./../config/database');
var jwt = require('jwt-simple');
var Schema = mongoose.Schema;
autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/leaf-nodekb");
autoIncrement.initialize(connection);
var bcrypt = require('bcrypt');
var UnknownSchema = new Schema({
    pictureType: {type: String},
    location: {type: String},
    leafname: {type: String},
    createduser: {type: String},
    lastedituser: {type: String},
});
UnknownSchema.plugin(autoIncrement.plugin,'UnknownSchema');
var addUnknown=mongoose.model('addUnknown', UnknownSchema);
exports.addUnknownData = mongoose.model('addUnknown', UnknownSchema);
exports.addUnknown=function(req,res){
            for(leafname of req.body.listofimages){
                console.log(leafname);
                var unknown = new addUnknown({
                    pictureType: req.body.pictureType,
                    leafname: leafname[0].filename,
                    location: req.body.location,
                    createduser: req.body.createduser,
                    lastedituser: req.body.lastedituser
                });
                unknown.save(function(err,data){
                    if(err){
                        console.log(err);
                        res.send({success:false});
                    }else{
                        console.log('saved');
                        oneleafid = data._id;
                        if(req.body.listofimages.length == 1){
                            res.send({success:true});
                        }

                    }
                })
            }
            if(req.body.listofimages.length > 1){
                res.send({success:true});
            }
    }
exports.getUnknown=function(req,res){
    addUnknown.find({},function (err,data) {
        if(err){
            res.send(err);
        }else {
            res.send(data);
        }
    })
};
exports.removeUnknown = function (req,res) {
    console.log(req.body.unknowns);
    unknowns = req.body.unknowns;
    unknowns.forEach(function(unknown){
        console.log(String(unknown));
        addUnknown.remove({leafname: String(unknown)},function (err,data) {
        if(err){
            res.send(err);
        }
        });
    });  
};
