mongoose = require('mongoose');
var passport = require('passport');
var config = require('./../config/database');
var jwt = require('jwt-simple');
var Schema = mongoose.Schema;
autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/leaf-nodekb");
autoIncrement.initialize(connection);
var bcrypt = require('bcrypt');

var familySchema = new Schema({
    scientificName:{type: String},
    commonName: {type: String},
    leafShape: {type: String},
    leafMargin: {type: String},
    leafDivision: {type: String},
    Description: {type: String},
    family:{type: String},
    Utility:{type: String},
    createduser: {type: String},
    lastedituser: {type: String},
});

familySchema.plugin(autoIncrement.plugin,'familySchema');

var addFamily=mongoose.model('addFamily',familySchema);
exports.addFamilydata = mongoose.model('addFamily',familySchema);
exports.addFamily=function(req,res){
    var family = new addLeaf({
        scientificName:req.body.scientificName,
        commonName: req.body.commonName,
        leafShape: req.body.leafShape,
        leafMargin: req.body.leafMargin,
        leafDivision: req.body.leafDivision,
        Description: req.body.Description,
        family:req.body.family,
        Utility:req.body.Utility,
        createduser: req.body.createduser,
        lastedituser: req.body.lastedituser
    });
    family.save(function(err){
        if(err){
            console.log(err);
            res.send({success:false});
        }else{
            res.send({success:true});
        }
    })
};
exports.updateFamily = function (req, callback) {

    addFamily.findOne({scientificName:req.body.scientificName},function(err,family){
        leaf.scientificName = req.body.scientificName;
        leaf.commonName = req.body.commonName;
        leaf.leafShape = req.body.leafShape;
        leaf.leafMargin = req.body.leafMargin;
        leaf.leafDivision = req.body.leafDivision;
        leaf.Description = req.body.Description;
        leaf.family = req.body.family;
        leaf.Utility = req.body.Utility;
        leaf.createduser = req.body.createduser;
        leaf.lastedituser = req.body.lastedituser;
        leaf.save(function(err){
            if(err){
                callback(err,null)

            }else{
                console.log('success');
                callback(null,null)
            }
        });
    });
};

exports.getAllFamily=function(req,res){
    addFamily.find({},function (err,data) {
        if(err){
            res.send(err);
        }else {
            res.send(data);
        }
    })
};

exports.getFamily=function(req,res){
    addFamily.find({id:req.body.id},function (err,data) {
        if(err){
            res.send(err);
        }else {
            res.send(data);
        }
    })
};
exports.getFamilyById=function(id,callback){
    addFamily.findOne({_id:id},function (err,data) {
        if(err){
            callback(err,null);
        }else {
            callback(null,data);
        }
    })
};

exports.addFamilyCall=function(req,callback){
    var family = new addFamily({
        scientificName:req.body.scientificName,
        commonName: req.body.commonName,
        leafShape: req.body.leafShape,
        leafMargin: req.body.leafMargin,
        leafDivision: req.body.leafDivision,
        Description: req.body.Description,
        family: req.body.family,
        Utility: req.body.Utility,
        createduser: req.body.createduser,
        lastedituser: req.body.lastedituser

});
    family.save(function(err,data){
        if(err){
            console.log(err);
            callback(err,null);
        }else{
            callback(null,data);
        }
    })
};


exports.getFamilyByScientificName=function(name,callback){
    addFamily.find({scientificName:name},function (err,data) {
        if(err){
            callback(null,err);
        }else {

            callback(data,null);
        }
    })
};

exports.getAllFamilyByScientificName=function(req,res){

    addFamily.find({scientificName:{ "$regex": req.body.name, "$options": "i" } },function (err,data) {
        if(err){
            res.send(err);
        }else {
            res.send(data);
        }
    })
};
exports.getAllFamilyByCommonName=function(req,res){
    addFamily.find({commonName:{ "$regex": req.body.name, "$options": "i" } },function (err,data) {
        if(err){
            res.send(err);
        }else {
            res.send(data);
        }
    })
};


exports.getFamilyByCommonName=function(name,callback){
    addFamily.find({commonName:name},function (err,data) {
        if(err){
            callback(null,err);
        }else {
            callback(data,null);
        }
    })
};

exports.removeFamily=function(req,res){
    addCandidate.find({id:req.body.id}).remove(function(err) {
        if(err)
            res.send(err);
        else{
            res.send("success");
        }
    })
};