var express = require('express');
var app = express();

// MongoDB setup
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/bugfree';
var mongoDB = null;

app.use(express.static(__dirname))
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/login/', (req, res) => {
    res.render('login');
});

app.get('/projects/', (req, res) => {
	mongoDB.collection('projects').find().toArray()
        .then((projects) => {
    	   res.render('projects', {projects});
        })
        .catch((err) => {
            console.log("MongoDB: error fetching projects");
        });
});

app.get('/profile/', (req, res) => {
    res.render('profile');
});

app.get('/api/projects/', (req, res) => {
    mongoDB.collection('projects').find({}).toArray()
        .then((projects) => {
            res.json(projects);
        })
        .catch((err) => {
            console.log("MongoDB: error fetching api/projects/");
            return res.json(err);
        });
});

app.get('/api/projects/:project_id', (req, res) => {
    let project_id = req.params.project_id;
    mongoDB.collection('projects').findOne({id: project_id})
        .then((project) => {
            res.json(project);
        })
        .catch((err) => {
            console.log("MongoDB: error fetching api/projects/:project_id");
            return res.json(err);
        });
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