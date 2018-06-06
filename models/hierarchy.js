mongoose = require('mongoose');
var passport = require('passport');
var config = require('./../config/database');
var jwt = require('jwt-simple');
var Schema = mongoose.Schema;
autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/leaf-nodekb");
autoIncrement.initialize(connection);
var hierarchySchema = new Schema({
    type: {type: String},
    score: {type: Number},
    timestamp: { type: Date, default: Date.now},
}, { collection : 'addhierarchy' });
hierarchySchema.plugin(autoIncrement.plugin,'hierarchySchema');

var addHierarchy = mongoose.model('addHierarchy',hierarchySchema);
exports.addHierarchydata = mongoose.model('addHierarchy',hierarchySchema);

exports.addHierarchy=function(req,res){
    var hierarchy = new addHierarchy({
        type: req.body.type,
        score: req.body.score
    });
    hierarchy.save(function(err){
        if(err){
            console.log(err);
            res.send({success:false});
        }else{
            res.send({success:true});
        }
    })
};
exports.getAllScores=function(req,res){
    addHierarchy.find({}, function(err, data){
    	if(err){
            res.send(err);
        }else {
        	console.log(data);
            res.send(data);
        }
    });
};
