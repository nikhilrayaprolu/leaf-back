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
var app = express();

app.use(passport.initialize());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
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
var DIR = './uploads/';
var upload = multer({dest: DIR});
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

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
app.use('/authentication', apiRoutes);
app.post('/upload', addLeaf.addLeaf);
app.post('/update',addLeaf.updateLeaf);
app.post('/leafdelete',addLeaf.deleteLeaf);
app.post('/familybyscientific', addFamily.getAllFamilyByScientificName);
app.post('/familybycommon', addFamily.getAllFamilyByCommonName);
app.get('/getAllFamily',addFamily.getAllFamily);
app.post('/leavesoffamily',addLeaf.getLeavesByFamily);
app.post('/leafbyid',addLeaf.getLeaves);
app.use('/leaf',apiRoutes);
//app.get('/users',addUser.findallusers);

app.get('/api', function (req, res) {
    res.end('file catcher example');
});

app.post('/api',uploads.array('file',12), function (req, res) {

    console.log(req);
    res.send(req.files);

});

console.log('started the server at localhost:'+port);
