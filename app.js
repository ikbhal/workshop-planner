var http = require('http');
var path = require('path');
//var fs = require('fs');
var express = require('express');
var logger = require('morgan');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var session = require('express-session');
var errorHandler = require('errorhandler');
var multer = require('multer');
var bodyParser = require('body-parser');


var config = require('./oauth.js');
var mongoose = require('mongoose');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var routes = require('./routes');

// serialize and deserialize
passport.serializeUser(function(user, done){
	done(null, user);
});

passport.deserializeUser(function(obj, done){
	done(null, obj);
});

// config
passport.use(new FacebookStrategy({
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL
	},
	function(accessToken, refreshToken, profile, done){
		process.nextTick(function(){
			return done(null, profile);
		});
	} 
));

var app = express();


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.logger());
//app.use(express.bodyParser());
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(session({resave:true, saveUninitialized:true, secret: 'uwotm8'}));

//app.use(express.session({secret: 'my_precious'}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router);
app.set('port', (process.env.PORT || 80));
app.use(express.static(path.join(__dirname , 'public')));
app.use(errorHandler({dumpExceptions:true, showStack:true}));

// mongo config
//var MONGOLAB_URI= "add_your_mongolab_uri_here"
//var mongo = process.env.MONGOLAB_URI || 'mongodb://localhost/node-bootstrap3-template'
//mongoose.connect(mongo);


// routes
app.get('/', routes.index);
app.get('/ping', routes.ping);
app.get('/account', ensureAuthenticated, function(req, res){
	res.render('account', {user: req.user});
});

app.get('/', function(req, res){
	res.render('login', {iser: user});
});

app.get('/auth/facebook', 
	passport.authenticate('facebook'),
	function(req, res){});

app.get('auth/facebook/callback', 
	passport.authenticate('facebook', {
		failureRedirect: '/'
	}), 
	function(req, res){
		res.redirect('/account');
	});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});


/*
app.get('/', function(request, response) {
	response.send('Hello World!');
});
*/
app.listen(app.get('port'), function() {
	console.log("Workshop Planner running at localhost:" + app.get('port'));
});

//test authentication
function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	} 
	res.redirect('/');
}
