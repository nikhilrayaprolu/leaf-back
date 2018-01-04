var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var User=require('../models/user');
var config = require('../config/database');
module.exports = function(passsport){
    var opts={};

    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey=config.secret;
    passsport.use(new JwtStrategy(opts,function(jwt_payload,done){
        User.findOne({id:jwt_payload.id},function(err,user){
            if(err){
                return done(err,false);
            }
            if(user){
                done(null,user);
            }else{
                done(null,false);
            }
        });
    }));
};