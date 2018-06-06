mongoose = require('mongoose');
var passport = require('passport');
var config = require('./../config/database');
var jwt = require('jwt-simple');
var Schema = mongoose.Schema;
autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/leaf-nodekb");
autoIncrement.initialize(connection);
var bcrypt = require('bcrypt');
var addLeaf = require("./leaf");

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
    timestamp: { type: Date, default: Date.now},
});

familySchema.plugin(autoIncrement.plugin,'familySchema');

var addFamily=mongoose.model('addFamily',familySchema);
exports.addFamilydata = mongoose.model('addFamily',familySchema);
exports.addFamily=function(req,res){
    var family = new addFamily({
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
exports.updateFamily = function (req,res) {
        console.log(req.body.family);
        addFamily.findOne({_id:req.body._id},function(err,family){
        if(err)
            res.send(err);
        else
        {
            family.scientificName = req.body.scientificName;
            family.commonName = req.body.commonName;
            family.leafShape = req.body.leafShape;
            family.leafMargin = req.body.leafMargin;
            family.leafDivision = req.body.leafDivision;
            family.Description = req.body.Description;
            family.family = req.body.family;
            family.Utility = req.body.Utility;
            family.createduser = req.body.createduser;
            family.lastedituser = req.body.lastedituser;
            family.save(function(err){
                if(err){
                    res.send(err);
                }else{
                    res.send('success');
                }
            });
        }
    });
    }

exports.getAllFamily=function(req,res){
    addFamily.aggregate([
        {
            "$lookup":
                {
                    "from": "addleafs",
                    "localField": "_id",
                    "foreignField": "scientificName",
                    "as": "leaves"
                }
        }
    ]).sort({scientificName: 1}).exec(function (err,data) {
        if(err){
            res.send(err);
        } else {
            res.send(data);
        }
    });
     
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
    addFamily.remove({_id:req.body._id}, function(err) {
        if(err)
            res.send(err);
        else{
            if(req.body.leaves != null)
            {
                req.body.leaves.forEach(function(leaf){
                    addLeaf.deleteLeafById(leaf['_id']);
                    console.log(leaf['_id']);

                });
            }
            res.send('success');
        }
    });
};