var mongoose = require('mongoose');
var passport = require('passport');

var config = require('./../config/database');
var jwt = require('jwt-simple');
var Schema = mongoose.Schema;
autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.connect("mongodb://localhost/node-rest-auth");
autoIncrement.initialize(connection);
var bcrypt = require('bcrypt');
var UserSchema = new Schema({
    username:{
        type:String,
        unique:true
        //required:true
    },
    password:{
        type: String
        //required:true
    },
    FirstName:{
        type:String
    },
    LastName:String,
});
UserSchema.plugin(autoIncrement.plugin,'UserSchema');
UserSchema.pre('save',function(next){
    var user =this;
    if(this.isModified('password')|| this.isNew){
        bcrypt.genSalt(10,function(err,salt){
            if(err){
                return next(err);
            }
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err){
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });

    }else{
        return next();

    }
});

UserSchema.methods.comparePassword = function(passw,cb){
    /*bcrypt.compare(passw,this.password,function(err,isMatch){
        if(err){
            return cb(err);

        }
        cb(null,isMatch);
    });*/
    if(passw == this.password){
        return cb(null,true);
    }
    else {
        return cb(err);
    }
};
var addUser=connection.model('addUser',UserSchema);
exports.addUser=addUser;
exports.userSignUp=function(req,res){
    if(!req.body.username || !req.body.password){
        res.json({success:false,msg:'Please pass name and password.'});
    }else{
        console.log("cameupheretoo");
        var newUser = new addUser({
            username:req.body.username,
            password:req.body.password,
            FirstName:req.body.FirstName,
            LastName:req.body.LastName,
            email:req.body.email,
            Online:false,
            userType:req.body.userType,
            Speciality:req.body.Speciality
        });
        console.log(newUser);
        newUser.save(function(err){
            if(err){
                return res.json({success:false,msg:err});
            }
            res.json({success:true,msg:'successful created new user.'});
        });
    }
};
exports.findusertype=function(username,cb){
    addUser.findOne({username:username},function(err,user){
        if(err) throw err;
        if(user){
            cb(user.userType);
        }
    })
};
exports.getsearchresults=function(req,res){
    searchtag='/.*'+req.body.searchtag+'.*/';
    console.log(searchtag)
    addUser.find({username:new RegExp('.*'+req.body.searchtag+'.*', "i")},'username',function(err,data){
        if(err){
            console.log(err);
            res.send(err);
        }else{
            console.log('data is'+data);
            res.send(data);
        }
    })
};
exports.getuserdata=function (req,res) {
    addUser.find({username:req.body.username},function (err,data) {
        if(err)
            res.send(err);
        else
            res.send(data);
    })
};
exports.authenticate=function(req,res){
    console.log(req.body);
    addUser.findOne({
        username:req.body.username
    },function(err,user){
        console.log(user);
        if(err) throw err;
        if(!user){
            res.send({success:false,msg:'Authentication failed.User not found.'});
        }
        else{
            user.comparePassword(req.body.password,function(err,isMatch){
                if(isMatch && !err){
                    var token = jwt.encode(user,config.secret);
                    res.json({success:true,token:'JWT '+ token,group:user.group,username:user.username,profilepic:undefined,user:user});
                }else{
                    res.send({success:false,msg:'Authentication failed.wrong Password.'});
                }
            });
        }
    });
};
getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};