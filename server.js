var express = require('express');
var app = express();

// MongoDB setup
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost:27017/bugfree';
var mongoDB = null;

app.use(express.static(__dirname))
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/projects/', (req, res) => {
	mongoDB.collection('projects').find().toArray( (err, projects) => {
    	res.render('projects', {projects});
	});
});

app.get('/profile/', (req, res) => {
    res.render('profile');
});

MongoClient.connect(mongoUrl)
  .then(function(db) {
      console.log("MongoDB: connected");
      mongoDB = db;

      var port = 3001;
      app.listen(port, () => {
        console.log('Bugfree: listening on localhost: %d', port);
      });
  })
  .catch((err) => {
      console.log("MongoDB: error connecting!");
      console.log("err.message: ", err.message);
  });