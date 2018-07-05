var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database');
var port = process.env.PORT || 3002;
var jwt = require('jwt-simple');
var addUser = require("./models/user");
var addLeaf = require("./models/leaf");
var addFamily = require("./models/family");
var addUnknown = require("./models/unknown");
var addHierarchy = require("./models/hierarchy");
var imgProc = require('./models/imgproc');
var app = express();

app.use(passport.initialize());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://preon.iiit.ac.in');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    req.url = req.url.slice(5);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect(config.database);
require('./config/passport')(passport);
var server = require('http').Server(app).listen(port);
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var multer = require('multer');
var fs = require('fs');
var DIR = './public/uploads/';
var upload = multer({dest: DIR});
uploads = multer({
    dest: DIR,
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
    }
});

var apiRoutes =express.Router();

apiRoutes.post('/signup',addUser.userSignUp);
apiRoutes.post('/authenticate',addUser.authenticate);
apiRoutes.post('/password', addUser.changePassword);
app.use('/authentication', apiRoutes);
app.post('/type', addUser.changeType);
app.post('/approve', addUser.changeApproval);
app.post('/allusers', addUser.getAllUsersData);
app.get('/userscore', addHierarchy.getAllScores);
app.post('/upload', addLeaf.addLeaf);
app.post('/update',addLeaf.updateLeaf);
app.get('/unapproved',addLeaf.getUnapproved);
app.post('/approveupload', addLeaf.approveUpload);
app.post('/bulkapprove', addLeaf.approveBulkUpload);
app.post('/leafdelete',addLeaf.deleteLeaf);
app.post('/unknownleaf', addUnknown.addUnknown);
app.post('/familybyscientific', addFamily.getAllFamilyByScientificName);
app.post('/familybycommon', addFamily.getAllFamilyByCommonName);
app.post('/familybyid', addFamily.getAllFamilyById);
app.get('/getAllFamily',addFamily.getAllFamily);
app.get('/getAllUnknown', addUnknown.getUnknown);
app.post('/leavesoffamily',addLeaf.getLeavesByFamily);
app.post('/leafbyid',addLeaf.getLeaves);
app.post('/annotationupdate', addLeaf.annotationupdate);
app.post('/updatefamily', addFamily.updateFamily);
app.post('/deletefamily', addFamily.removeFamily);
app.post('/deleteunknown', addUnknown.removeUnknown);
app.post('/dashboard',function (req,res) {
    var familycount = 0;
    var unannotated = 0;
    var annotated = 0;
    var diseased = 0;
    var leafday = 0;
    var leafmonth = 0;
    var leafweek = 0;
    var leafyear = 0;
    addFamily.addFamilydata.count({},function (err,count) {
        familycount = count;
        addLeaf.addLeafdata.count({AnnotationComplete:false}, function (err,count) {
            unannotated = count;
            addLeaf.addLeafdata.count({AnnotationComplete:true},function (err, count) {
                annotated = count;
                addLeaf.addLeafdata.count({leafHealth:'Not Good'}, function (err, count) {
                    diseased = count;
                    addLeaf.addLeafdata.count({createduser:req.body.username}, function (err, count) {
                        userleaves = count;
                        var today = new Date();
                        var seconds = 86400000;
                        addLeaf.addLeafdata.count({timestamp: {$gt: new Date(today - 1 * seconds)}}, function(err, count){
                            leafday = count;
                            addLeaf.addLeafdata.count({timestamp: {$gt: new Date(today - 7 * seconds)}}, function(err, count){
                            leafweek = count;
                                addLeaf.addLeafdata.count({timestamp: {$gt: new Date(today - 30 * seconds)}}, function(err, count){
                                    leafmonth = count;
                                    addLeaf.addLeafdata.count({timestamp: {$gt: new Date(today - 365 * seconds)}}, function(err, count){
                                    leafyear = count;
                                    res.send({familycount: familycount, unannotated: unannotated, annotated: annotated, diseased: diseased, userleaves: userleaves, leafday: leafday, leafweek: leafweek, leafmonth: leafmonth, leafyear: leafyear});
                                    });
                                });
                            });
                        });
                    });

                });
            });
        });
    });
});
app.use('/leaf',apiRoutes);
//app.get('/users',addUser.findallusers);

app.get('/api', function (req, res) {
    res.end('file catcher example');
});

app.post('/api',uploads.array('file',12), function (req, res) {
    res.send(req.files);

    //imgProc.convertImgs(req.files)
});

console.log('started the server at localhost:'+port);
module.exports = app;