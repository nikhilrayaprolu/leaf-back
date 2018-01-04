mongoose = require('mongoose');
var passport = require('passport');
var config = require('./../config/database');
var jwt = require('jwt-simple');
var Schema = mongoose.Schema;
autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/leaf-nodekb");
autoIncrement.initialize(connection);
var bcrypt = require('bcrypt');
var addFamily = require("./family");
var LeafSchema = new Schema({
    scientificName:{type: String},
    commonName: {type: String},
    pictureType: {type: String},
    leafShape: {type: String},
    leafMargin: {type: String},
    leafDivision: {type: String},
    pictureSeason: {type: String},
    leafHealth: {type: Boolean},
    Disease: {type: String},
    Description: {type: String},
    leafname: {type: String},
    AnnotationComplete: {type: Boolean},
    scientificName:{type: Number},
    annotationtext:{type: String}
});

LeafSchema.plugin(autoIncrement.plugin,'LeafSchema');
var addLeaf=mongoose.model('addLeaf',LeafSchema);
exports.addLeaf=function(req,res){
    addFamily.getFamilyByScientificName(req.body.scientificName,function (data,err) {
        if(data.length){
            console.log(req.body.listofimages);
            for(let leafname of req.body.listofimages){
                console.log(leafname);
                console.log(leafname[0].filename, data[0].id);
                var leaf = new addLeaf({
                    pictureType: req.body.pictureType,
                    pictureSeason: req.body.pictureSeason,
                    leafHealth: req.body.leafHealth,
                    Disease: req.body.Disease,
                    AnnotationComplete: req.body.AnnotationComplete,
                    leafname: leafname[0].filename,
                    scientificName:data[0].id,
                    annotationtext:req.body.annotationtext
                });
                leaf.save(function(err){
                    if(err){
                        console.log(err);
                        res.send({success:false});
                    }else{
                        res.send({success:true});
                    }
                })
            }
        }else {
            addFamily.addFamilyCall(req,function (err,data) {
                if(err){
                    res.send(err);
                }else{
                    for(leafname in req.body.listofimages){
                        var leaf = new addLeaf({
                            pictureType: req.body.pictureType,
                            pictureSeason: req.body.pictureSeason,
                            leafHealth: req.body.leafHealth,
                            Disease: req.body.Disease,
                            AnnotationComplete: req.body.AnnotationComplete,
                            leafname: leafname,
                            scientificName:data._id
                        });
                        leaf.save(function(err){
                            if(err){
                                console.log(err);
                                res.send({success:false});
                            }else{
                                res.send({success:true});
                            }
                        })
                    }
                }

            })
        }
    })

};

exports.updateLeaf = function (req, res) {
    addLeaf.findOne({_id:req.body._id},function(err,leaf){
        pictureType = req.body.pictureType;
            leaf.pictureSeason = req.body.pictureSeason;
            leaf.leafHealth = req.body.leafHealth;
            leaf.Disease = req.body.Disease;
            leaf.AnnotationComplete = req.body.AnnotationComplete;
            leaf.annotationtext = req.body.annotationtext;

        leaf.save(function(err){
            if(err){
                console.log(err);

            }else{
                console.log('success');
                res.sendStatus(200);
            }
        });
    });
};
exports.deleteLeaf = function (req,res) {
    addLeaf.remove({_id:req.body.id},function(err){
        if(!err){
            res.sendStatus(200);
        }else{
            console.log(err);
        }
    });

};
function jsonConcat(o1, o2) {
    //console.log(o1);
    for (var key in o2) {
        o1[key] = o2[key];
        console.log(key);
    }
    return o1;
}

exports.getLeaves=function(req,res){
    console.log(req.body.id);
    addLeaf.findOne({_id:req.body.id},function (err,data) {
        if(err){
            res.send(err);
        }else {
            console.log(data);
            addFamily.getFamilyById(data.scientificName,function (err,data2) {
                var output = {};
                //console.log(data);
                //console.log(data2);
                output = jsonConcat(output, data2.toJSON());
                //console.log(output);
                output = jsonConcat(output, data.toJSON());
                output._id = req.body.id;
                //console.log(output);
                res.send(output);
            })
        }
    })
};
exports.getLeavesByFamily=function(req,res){
    if(req.body.annoted == 'Not'){
        addLeaf.find({scientificName:req.body.id, AnnotationComplete:false},{skip:req.body.presentcount,limit:req.body.count},function (err,data) {
            if(err){
                console.log(err,"error1");
                res.send(err);
            }else {
                res.send(data);
            }
        })
    } else {
        console.log(req.body.presentcount,req.body.count);
        addLeaf.find({scientificName:req.body.id}).skip(req.body.presentcount).limit(req.body.count).exec(function (err,data) {
            if(err){
                console.log(err,"error2");
                res.send(err);
            }else {
                res.send(data);
            }
        })
    }

};

exports.removeLeaf=function(req,res){
    addCandidate.find({id:req.body.id}).remove(function(err) {
        if(err)
            res.send(err);
        else{
            res.send("success");
        }
    })
};
