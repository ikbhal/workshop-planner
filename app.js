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
	//done(null, user);
	console.log('serializeUser: ' + user._id);
	done(null, user._id);
});

passport.deserializeUser(function(id, done){
	//done(null, obj);
	User.findById(id, function(err, user){
		console.log(user);
		if(!err) done(null, user);
		else done(err, null);
	});
});

// config
passport.use(new FacebookStrategy({
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL
	},
	function(accessToken, refreshToken, profile, done){
		/*
		User.findOrCreate({oauthID: profile.id}
			, { name: profile.displayName, created: Date.now()})
		.success(function(user){
			done(null, user);
		})
		.error(function(err){
			done(err);
		});
		*/
		/*process.nextTick(function(){
			return done(null, profile);
		});*/
		
		User.findOne({oauthID: profile.id}, function(err,user){
			if(err) { console.log(err); done(err, null);};
			if(!err && user != null ){
				done(nul, user);
			} else {
				var user = new User({
					oauthID: profile.id,
					name: profile.displayName,
					created: Date.now()
				});

				user.save(function(err, user){
					if(err){
						console.log(err);
						done(err, nul);
					}else{
						console.log('Saving user ...');
						done(null, user);
					}
				});
			}
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
//var MONGOLAB_URI= "mongodb://ikbhal:Think1Allah!@ds029051.mongolab.com:29051/workshop-planner";
//var mongo = process.env.MONGOLAB_URI || 'mongodb://localhost/workshop-planner'
var MONGO_URI = 'mongodb://localhost/workshop-planner';
var mongo = MONGO_URI;

mongoose.connect(mongo, function(err){
	if(err){
		console.log("Unable to connec to mongo due to err: " + err);
	} else {
		console.log('Connect to mongo successfully');
	}
});

var User = mongoose.model('User', 	{
	oauthID: Number,
	name: String,
	created: Date
});

// routes
app.get('/', routes.index);
app.get('/ping', routes.ping);
app.get('/account', ensureAuthenticated, function(req, res){
	//res.render('account', {user: req.user});
	User.findById(req.session.passport.user, function(err, user){
		if(err) {
			console.log(err);
		} else {
			res.sender('account', {user: user});
		}
	});
});

app.get('/', function(req, res){
	res.render('login', {iser: user});
});

app.get('/auth/facebook', 
	passport.authenticate('facebook'),
	function(req, res){});

app.get('/auth/facebook/callback', 
	passport.authenticate('facebook', {
		failureRedirect: '/'
	}), 
	function(req, res){
		res.redirect('/account');
	});

/*
app.get('/auth/callback', 
	passport.authenticate('facebook', {
		failureRedirect: '/'
	}), 
	function(req, res){
		res.redirect('/account');
	});
*/
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
