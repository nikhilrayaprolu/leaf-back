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
    commonName: {type: String},
    pictureType: {type: String},
    leafShape: {type: String},
    leafMargin: {type: String},
    leafDivision: {type: String},
    pictureSeason: {type: String},
    leafHealth: {type: String},
    Disease: {type: String},
    Description: {type: String},
    leafname: {type: String},
    AnnotationComplete: {type: Boolean},
    scientificName:{type: Number},
    annotationtext:{type: String},
    createduser: {type: String},
    lastedituser: {type: String},
    TaggingComplete: {type: Boolean},
});

LeafSchema.plugin(autoIncrement.plugin,'LeafSchema');
var addLeaf=mongoose.model('addLeaf',LeafSchema);
exports.addLeafdata = mongoose.model('addLeaf',LeafSchema);
exports.addLeaf=function(req,res){
    addFamily.getFamilyByScientificName(req.body.scientificName,function (data,err) {
        var oneleafid=0;
        if(data.length){
            console.log(req.body.listofimages);

            for(leafname of req.body.listofimages){
                var leaf = new addLeaf({
                    pictureType: req.body.pictureType,
                    pictureSeason: req.body.pictureSeason,
                    leafHealth: req.body.leafHealth,
                    Disease: req.body.Disease,
                    AnnotationComplete: req.body.AnnotationComplete,
                    leafname: leafname[0].filename,
                    scientificName:data[0].id,
                    TaggingComplete:req.body.TaggingComplete,
                    annotationtext:req.body.annotationtext,
                    createduser: req.body.createduser,
                    lastedituser: req.body.lastedituser
                });
                leaf.save(function(err,data2){
                    if(err){
                        console.log(err);
                        res.send({success:false});
                    }else{
                        oneleafid = data2._id;
                        if(req.body.listofimages.length == 1){
                            res.send({success:true, imageid: data[0].id, oneleafid: oneleafid});
                        }

                    }
                })
            }
            if(req.body.listofimages.length > 1){
                res.send({success:true, imageid: data[0].id});
            }
        }else {
            addFamily.addFamilyCall(req,function (err,data) {
                if(err){
                    res.send(err);
                }else{
                    for(let leafname in req.body.listofimages){
                        var leaf = new addLeaf({
                            pictureType: req.body.pictureType,
                            pictureSeason: req.body.pictureSeason,
                            leafHealth: req.body.leafHealth,
                            Disease: req.body.Disease,
                            AnnotationComplete: req.body.AnnotationComplete,
                            leafname: leafname[0].filename,
                            scientificName:data.id,
                            annotationtext:req.body.annotationtext,
                            createduser: req.body.createduser,
                            lastedituser: req.body.lastedituser
                        });
                        leaf.save(function(err,data2){
                            if(err) {
                                console.log(err);
                                res.send({success:false});
                            } else {
                                oneleafid = data2._id;
                                if(req.body.listofimages.length == 1){
                                    res.send({success:true, imageid: data.id, oneleafid: oneleafid});
                                }
                            }
                        })
                    }
                    if(req.body.listofimages.length > 1){
                        res.send({success:true, imageid: data.id});
                    }

                }

            })
        }
    })

};

exports.updateLeaf = function (req, res) {
    addFamily.updateFamily(req,function (err,data) {
        addLeaf.findOne({_id:req.body._id},function(err,leaf){
            leaf.pictureType = req.body.pictureType;
            leaf.pictureSeason = req.body.pictureSeason;
            leaf.leafHealth = req.body.leafHealth;
            leaf.Disease = req.body.Disease;
            leaf.AnnotationComplete = req.body.AnnotationComplete;
            leaf.annotationtext = req.body.annotationtext;
            leaf.lastedituser = req.body.lastedituser;

            leaf.save(function(err){
                if(err){
                    console.log(err);

                }else{
                    console.log('success');
                    res.send({'success': true});
                }
            });
        });
    })

};
exports.annotationupdate = function (req,res) {
    addLeaf.findOne({_id: req.body.leafid},function (err, leaf) {
        leaf.annotationtext = req.body.annotationvalue;
        leaf.AnnotationComplete = true;
        leaf.save(function (err) {
            if(err) {
                console.log(err);
            } else {
                res.send({'success': true});
            }
        })
    })
}
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
                output = jsonConcat(output, data.toJSON());
                //console.log(output);
                output = jsonConcat(output, data2.toJSON());
                output._id = req.body.id;
                //console.log(output);
                res.send(output);
            })
        }
    })
};
exports.getLeavesByFamily=function(req,res){
    var searchparams = {
        scientificName: req.body.id,
    }
    if(req.body.level != "All"){
        searchparams.pictureType = req.body.level;
    }
    if(req.body.annotation != "All"){
        searchparams.AnnotationComplete = (req.body.annotation == 'true');
    }
    if(req.body.disease != "All"){
        searchparams.Disease = req.body.disease;
    }
    if(req.body.tagging != "All"){
        searchparams.TaggingComplete = (req.body.tagging == 'true');
    }
    if (req.body.userglobal == 'User') {
        searchparams.createduser = req.body.username;
    }
    console.log(searchparams, req.body.presentcount, req.body.count);
    addLeaf.find(searchparams).skip(req.body.presentcount).limit(req.body.count).exec(function (err,data) {
        if(err){
            console.log(err,"error1");
            res.send(err);
        }else {
            console.log(data);
            res.send(data);
        }
    })

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
