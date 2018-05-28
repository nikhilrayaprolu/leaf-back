var mongoose = require('mongoose');
var passport = require('passport');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'leafproject.iiit@gmail.com',
    pass: 'leaf-project'
  }
});

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
        unique:true,
        required:true
    },
    password:{
        type: String,
        minlength: 6,
        required:true
    },
    name:{
        type:String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    affiliation:{
        type: String,
        required: true
    },
    approved:{
        type:String
    },
    type:{
        type:String
    }
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
    bcrypt.compare(passw,this.password,function(err,isMatch){
        if(err){
            return cb(err);

        }
        cb(null,isMatch);
    });
    /*if(passw == this.password){
        return cb(null,true);
    }
    else {
        return cb(err);
    }*/
};
var addUser=connection.model('addUser',UserSchema);
exports.addUser=addUser;
exports.userSignUp=function(req,res){
    if(!req.body.username || !req.body.password || !req.body.name || !req.body.email || !req.body.affiliation){
        res.json({success:false,msg:'Please pass name, username, email, affiliation and password.'});
    }else{
        var newUser = new addUser({
            username:req.body.username,
            password:req.body.password,
            name:req.body.name,
            email:req.body.email,
            affiliation: req.body.affiliation,
            approved: 'false',
            type: 'regular'
        });
        newUser.save(function(err){
            if(err){
                console.log(err);
                return res.json({success:false,msg:err});
            }
            addUser.find({type: 'admin'}, function(err,admins){
                if(err) throw err;
                admins.forEach(function(admin)
                {
                    var mailOptions = {
                        from: 'healthcareaadhar@gmail.com',
                        to: admin.email,
                        subject: 'New account request for the portal!',
                        html: 'Dear Admin '+admin.name+', <br> You have received a new account request from '+newUser.name+'('+newUser.email+' / '+newUser.affiliation+'). Kindly check it in the portal.<br> Regards,<br> <b> Team Leafnet </b>'
                        };
                    transporter.sendMail(mailOptions, function(error, info){
                      if (error) {
                        console.log(error);
                      } else {
                        console.log('Email sent: ' + info.response);
                      }
                    });    
                });
            });
        res.json({success:true,msg:'Successfully created a new user.'});
    });
    }
};
exports.findusertype=function(username,cb){
    addUser.findOne({username:username},function(err,user){
        if(err) throw err;
        if(user){
            cb(user.type);
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
exports.getAllUsersData=function (req,res) {
    console.log(req.body.approved);
    addUser.find({approved: req.body.approved})
    .sort({username: 1}).exec(function (err,data) {
        if(err)
            res.send(err);
        else
            res.send(data);
    });
};
exports.changeType = function(req, res){
    addUser.findOne({username:req.body.username},function(err,user){
            user.type = req.body.type;
            user.save(function(err){
                if(err){
                    console.log(err);

                }else{
                    console.log('success');
                    res.send({'success': true});
                }
            });
    })
}
exports.changePassword = function(req, res){
    addUser.findOne({username:req.body.username},function(err,user){
            user.password = req.body.password;
            user.save(function(err){
                if(err){
                    console.log(err);

                }else{
                    console.log('success');
                    res.send({'success': true});
                }
            });
    })
}
exports.changeApproval = function(req, res){
addUser.findOne({username:req.body.username},function(err,user){
            user.approved = req.body.approved;
            user.type = req.body.type;
            user.save(function(err){
                if(err){
                    console.log(err);

                }else{
                    console.log('success');
                    res.send({'success': true});
                    if(user.approved == "accept")
                    {
                        var mailOptions = {
                        from: 'healthcareaadhar@gmail.com',
                        to: user.email,
                        subject: 'Your account request has been accepted!',
                        html: 'Dear '+user.name+', <br> Your account has been activated.You can now login to the portal. <br> Regards,<br> <b> Team Leafnet </b>'
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                          if (error) {
                            console.log(error);
                          } else {
                            console.log('Email sent: ' + info.response);
                          }
                        });
                    }
                }
            });
    })
}
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
                    res.json({success:true,token:'JWT '+ token,usertype:user.type,username:user.username,approved: user.approved});
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