"use strict";

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var mongodb = require('mongodb');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var PassportStrategy = require('passport-local').Strategy;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set('view engine', 'pug');

var session_conf = {
    secret: 'Bugfree is c00l!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60
    }
}

if(app.get('env') === 'production') {
    app.set('trust proxy', 1);
    session_conf.cookie.secure = true;
}
app.use(session(session_conf));

passport.use(new PassportStrategy((username, password, cb) => {
    let user = null;
    mongoDB.collection('users').findOne({username: username})
        .then((item) => {
            if(item) {
                user = item;
                let hash = user.hash;
                return bcrypt.compare(password, hash);
            }
            else {
                cb(null, false);
                throw new Error("PassportStrategy: Username not found!");
            }
        }).then((isMatch) => {
            if(isMatch) {
                cb(null, user);
            }
            else {
                cb(null, false);
            }
        }).catch((err) => {
            cb(err);
        });
}));

passport.serializeUser((user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
    mongoDB.collection('users').findOne({_id: mongodb.ObjectID(id)})
        .then((user) => {
            if(user) {
                cb(null, user);
            }
            else {
                throw new Error('deserializeUser: user not found!');
            }
        }).catch((err) => {
            cb(err);
        });
});

app.use(passport.initialize());
app.use(passport.session());

var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/bugfree';
var mongoDB = null;

app.use((req, res, next) => {
    if(req.isAuthenticated()) {
        res.locals.full_name = req.user.firstname + ' ' + req.user.lastname;
    }
    next();
});

function authorizeUser(req, res, next) {
    if(req.isAuthenticated())
        next();
    else
        res.redirect('/login/');
}

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/login/', (req, res) => {
    res.render('login');
});

app.post('/login/', passport.authenticate('local', { failureRedirect: '/login/' }), (req, res) => {
    res.redirect('/');
});

app.get('/logout/', (req, res) => {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

app.get('/projects/', (req, res) => {
	mongoDB.collection('projects').find().toArray()
        .then((projects) => {
    	   res.render('projects', {projects});
        }).catch((err) => {
            console.log("MongoDB: error fetching projects");
        });
});

app.get('/profile/', (req, res) => {
    res.render('profile');
});

app.get('/publish/', authorizeUser, (req, res) => {
    res.render('publish');
});

app.post('/publish/', authorizeUser, (req, res) => {
    let article = {
        title:      req.body.title,
        authorId:   req.user._id,
        dateTime:   new Date(),
        body:       req.body.editor
    };
    mongoDB.collection('articles').insertOne(article)
    .then(() => {
        console.log("Added a new article")
        res.render('preview', {content: req.body});
    }).catch((err) => {
        console.log("Error saving a new article!")
        res.redirect('/');
    });
});

app.get('/articles/', (req, res) => {
    mongoDB.collection('articles').aggregate([{$lookup: {from: "users", localField: "authorId", 
foreignField: "_id", as: "authors"}}, { $unwind: "$authors"}, {$project: {title: 1, body: 1, dateTime: 1, "author.firstname": "$authors.firstname", "author.lastname": "$authors.lastname" }}]).toArray()
        .then((articles) => {
            res.render('articles', {articles});
        }).catch((err) => {
            console.log("MongoDB: error fetching articles");
        });
});


app.get('/api/projects/', (req, res) => {
    mongoDB.collection('projects').find({}).toArray()
        .then((projects) => {
            res.json(projects);
        }).catch((err) => {
            console.log("MongoDB: error fetching api/projects/");
            res.json(err);
        });
});

app.get('/api/articles/', (req, res) => {
    mongoDB.collection('articles').aggregate([{$lookup: {from: "users", localField: "authorId", 
foreignField: "_id", as: "authors"}}, { $unwind: "$authors"}, {$project: {title: 1, body: 1, dateTime: 1, "author.firstname": "$authors.firstname", "author.lastname": "$authors.lastname" }}]).toArray()
        .then((articles) => {
            res.json(articles);
        }).catch((err) => {
            console.log("MongoDB: error fetching api/articles/");
            res.json(err);
        });
});

app.get('/api/projects/:project_id', (req, res) => {
    let project_id = req.params.project_id;
    mongoDB.collection('projects').findOne({id: project_id})
        .then((project) => {
            res.json(project);
        }).catch((err) => {
            console.log("MongoDB: error fetching api/projects/:project_id");
            res.json(err);
        });
});

MongoClient.connect(mongoUrl)
    .then(function(db) {
        console.log("MongoDB: connected");
        mongoDB = db;

        // TODO: Remove later
        //mongoDB.collection('articles').remove();

        var port = 3001;
        app.listen(port, () => {
            console.log('Bugfree: listening on localhost: %d', port);
        });
    })
    .catch((err) => {
        console.log("MongoDB: error connecting!");
        console.log("err.message: ", err.message);
    });