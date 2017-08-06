const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bcrypt = require('bcryptjs');
const passport = require('passport');
const PassportStrategy = require('passport-local').Strategy;
const moment = require('moment');
const cheerio = require('cheerio');
const truncate = require('truncate-html');

const app = express();
console.log(`Environment: ${app.get('env')}`);

const knexfile = require('./knexfile.js');

const environment = app.get('env');
const knex = require('knex')(knexfile[environment]);
const db = require('./db')({ knex, environment });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set('view engine', 'pug');

const redisClient = redis.createClient();
redisClient.on('error', err => {
  console.log(err);
});
redisClient.on('ready', () => {
  console.log('Redis: ready');
});

const sessionConf = {
  store: new RedisStore({ client: redisClient }),
  secret: 'Bugfree is c00l!',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid',
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

passport.use(new PassportStrategy((username, password, cb) => {
  let user = null;
  db.getUserByUsername(username)
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
    .catch(err => cb(err));
}));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) =>
  db.getUser(id)
    .then(user => {
      if (user) {
        cb(null, user);
        return null;
      }
      throw new Error('deserializeUser: user not found!');
    })
    .catch(err => cb(err)
    )
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.full_name = `${req.user.first_name} ${req.user.last_name}`;
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

app.get('/logout/', (req, res) =>
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.clearCookie(sessionConf.name);
    res.redirect('/');
  }));

app.get('/projects/', (req, res) => {
  db.getProjects()
    .then(projects => res.render('projects', { projects }))
    .catch(err => res.json({ data: err, status: 500 }));
});

app.get('/profile/', (req, res) => {
  res.render('profile');
});

app.get('/publish/', authorizeUser, (req, res) => {
  res.render('publish');
});

function formatArticle(article) {
  const $ = cheerio.load(article);
  const temp = cheerio.load($.html('pre'));
  const language = $('pre').attr('class');
  $('pre').replaceWith($('<div>').append(temp('pre').addClass('article__code-block')).addClass('article__code-block').addClass(language));
  const result = $('body');
  return result.html();
}

app.post('/publish/', authorizeUser, (req, res) => {
  const tags = req.body.tags.split(',');
  const article = {
    title: req.body.title,
    author_id: req.user.id,
    content: formatArticle(req.body.editor),
  };

  let articleId = null;
  Promise.all([
    db.insertArticle(article),
    db.insertTags(tags),
  ])
    .then(values => {
      articleId = values[0];
      return db.insertArticleTag(articleId, tags);
    })
    .then(() => res.redirect(`/articles/${articleId}`))
    .catch(err => {
      console.log(err);
      return res.redirect('/');
    });
});

app.get('/articles/:articleId', (req, res) => {
  const articleId = req.params.articleId;
  Promise.all([
    db.getArticle(articleId),
    db.getTagsForArtice(articleId),
  ])
    .then(([item, tags]) => {
      if (item == null) {
        throw new Error('No such article');
      }
      const newItem = item;
      newItem.timestamp = moment(item.timestamp).format('LL');
      newItem.tags = tags;
      return res.render('article', { article: newItem });
    })
    .catch(err => {
      console.log(err);
      return res.redirect('/');
    });
});

app.get('/articles/', (req, res) => {
  db.getArticles()
    .then(articles => {
      const iterate = articles.map(item => {
        const newItem = item;
        newItem.timestamp = moment(item.timestamp).format('LL');
        newItem.content = truncate(newItem.content, 50, { byWords: true, excludes: ['h3'] });
        return db.getTagsForArtice(item.id)
          .then(tags => {
            newItem.tags = tags;
            return newItem;
          });
      });
      return Promise.all(iterate)
        .then(() => res.render('articles', { articles }));
    })
    .catch(err => {
      console.log(err);
      return res.redirect('/');
    });
});

app.get('/api/articles/', (req, res) => {
  db.getArticles()
    .then(articles => res.json(articles))
    .catch(err => {
      console.log(err);
      return res.json(err);
    });
});

app.get('/api/articles/:articleId', (req, res) => {
  const articleId = req.params.articleId;
  db.getArticle(articleId)
    .then(articles => res.json(articles))
    .catch(err => {
      console.log(err);
      return res.json(err);
    });
});

app.get('/api/projects/', (req, res) => {
  db.getProjects()
    .then(projects => res.json(projects))
    .catch(err => res.json({ data: err, status: 500 }));
});

app.get('/api/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  db.getProject(projectId)
    .then(project => res.json(project))
    .catch(err => res.json({ data: err, status: 500 }));
});
