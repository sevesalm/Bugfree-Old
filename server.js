const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const mongodb = require('mongodb');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const PassportStrategy = require('passport-local').Strategy;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set('view engine', 'pug');

const sessionConf = {
  secret: 'Bugfree is c00l!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
  },
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionConf.cookie.secure = true;
}
app.use(session(sessionConf));

const port = 3001;
module.exports = app.listen(port, () => {
  console.log('Bugfree: listening on localhost: %d', port);
});

const MongoClient = mongodb.MongoClient;
const mongoUrl = 'mongodb://localhost:27017/bugfree';
let mongoDB = null;

MongoClient.connect(mongoUrl)
.then(db => {
  console.log('MongoDB: connected');
  mongoDB = db;
  return true;
  // TODO: Remove later
  // mongoDB.collection('articles').remove();
})
.catch(err => {
  console.log('MongoDB: error connecting!');
  console.log('err.message: ', err.message);
});

passport.use(new PassportStrategy((username, password, cb) => {
  let user = null;
  mongoDB.collection('users').findOne({ username })
  .then(item => {
    if (item) {
      user = item;
      const hash = user.hash;
      return bcrypt.compare(password, hash);
    }
    cb(null, false);
    throw new Error('PassportStrategy: Username not found!');
  })
  .then(isMatch => {
    if (isMatch) {
      return cb(null, user);
    }
    return cb(null, false);
  })
  .catch(err => {
    cb(err);
  });
}));

passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  mongoDB.collection('users').findOne({ _id: mongodb.ObjectID(id) })
  .then(user => {
    if (user) {
      return cb(null, user);
    }
    throw new Error('deserializeUser: user not found!');
  })
  .catch(err => {
    return cb(err);
  });
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.full_name = `${req.user.firstname} ${req.user.lastname}`;
  }
  next();
});

function authorizeUser(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login/');
  }
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

app.get('/logout/', (req, res) => req.session.destroy(() => res.redirect('/')));

app.get('/projects/', (req, res) => {
  mongoDB.collection('projects').find().toArray()
  .then(projects => res.render('projects', { projects }))
  .catch(() => {
    console.log('MongoDB: error fetching projects');
  });
});

app.get('/profile/', (req, res) => {
  res.render('profile');
});

app.get('/publish/', authorizeUser, (req, res) => {
  res.render('publish');
});

app.post('/publish/', authorizeUser, (req, res) => {
  const article = {
    title: req.body.title,
    authorId: req.user._id,
    dateTime: new Date(),
    body: req.body.editor,
  };
  mongoDB.collection('articles').insertOne(article)
  .then(() => {
    console.log('Added a new article');
    return res.render('preview', { content: req.body });
  }).catch(() => {
    console.log('Error saving a new article!');
    return res.redirect('/');
  });
});

app.get('/articles/', (req, res) => {
  mongoDB.collection('articles').aggregate([{ $lookup: {
    from: 'users',
    localField: 'authorId',
    foreignField: '_id',
    as: 'authors' } }, { $unwind: '$authors' }, { $project: { title: 1, body: 1, dateTime: 1, 'author.firstname': '$authors.firstname', 'author.lastname': '$authors.lastname' } }]).toArray()
  .then(articles => res.render('articles', { articles }))
  .catch(() => {
    console.log('MongoDB: error fetching articles');
    return res.redirect('/');
  });
});


app.get('/api/projects/', (req, res) => {
  mongoDB.collection('projects').find({}).toArray()
  .then(projects => res.json(projects))
  .catch(err => {
    console.log('MongoDB: error fetching api/projects/');
    return res.json(err);
  });
});

app.get('/api/articles/', (req, res) => {
  mongoDB.collection('articles').aggregate([{ $lookup: { from: 'users',
    localField: 'authorId',
    foreignField: '_id',
    as: 'authors' } }, { $unwind: '$authors' }, { $project: { title: 1, body: 1, dateTime: 1, 'author.firstname': '$authors.firstname', 'author.lastname': '$authors.lastname' } }]).toArray()
  .then(articles => res.json(articles))
  .catch(err => {
    console.log('MongoDB: error fetching api/articles/');
    return res.json(err);
  });
});

app.get('/api/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  mongoDB.collection('projects').findOne({ id: projectId })
  .then(project => res.json(project))
  .catch(err => {
    console.log('MongoDB: error fetching api/projects/:projectId');
    return res.json(err);
  });
});
