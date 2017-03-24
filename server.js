var express = require('express');
var app = express();

// MongoDB setup
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost:27017/bugfree';
var mongoDB = null;

app.use(express.static(__dirname))
app.set('view engine', 'pug');
app.get('/', function(req, res) {
    res.render('main');
});

app.get('/projects/', function(req, res) {
	mongoDB.collection('projects').find().toArray(function(err, projects) {
    	res.render('projects', {projects});
	});
});

app.get('/profile/', function(req, res) {
    res.render('profile');
});

MongoClient.connect(mongoUrl, function(err, db) {
  if(!err) {
    console.log("MongoDB: connected");
    mongoDB = db;

    var port = 3001;
    app.listen(port, function() {
    	console.log('Bugfree: listening on localhost: %d', port);
    });
  }
  else {
    console.log("MongoDB: error connecting!");
    console.log("err.message: ", err.message);
  }
});