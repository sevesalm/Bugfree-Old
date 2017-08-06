module.exports = function init(params) {
  const { knex, environment } = params;
  // In test environment migrate in test files
  if (environment !== 'test') {
    knex.migrate.latest()
      .catch(err => console.log(err));
  }

  function getUserByUsername(username) {
    return knex('users').where({ username }).first();
  }

  function getUser(id) {
    return knex('users').select().where({ id }).first();
  }

  function getProject(id) {
    return knex('projects').select().where({ id }).first();
  }
  function getProjects() {
    return knex('projects').select();
  }

  function getArticle(id) {
    return knex('articles')
      .select('title', 'content', 'timestamp', 'first_name', 'last_name')
      .join('users', 'users.id', 'articles.author_id')
      .where({ 'articles.id': id })
      .first();
  }

  function getArticles() {
    return knex('articles')
      .join('users', 'users.id', 'articles.author_id')
      .select('title', 'content', 'timestamp', 'first_name', 'last_name', 'articles.id')
      .orderBy('timestamp', 'desc');
  }

  function getTagsForArtice(id) {
    return knex('article_tag').select(knex.raw('array_agg(tag) as tags')).where({ article_id: id }).first()
      .then(tags => {
        if (tags.tags && (tags.tags[0] !== '')) {
          return tags.tags;
        }
        return [];
      });
  }

  function insertArticle(article) {
    return knex('articles').insert(article).returning('id');
  }

  function createTags(tags) {
    return tags.map(tag => ({ tag }));
  }

  function insertTags(tags) {
    const query = knex('tag').insert(createTags(tags));
    return knex.raw('? ON CONFLICT DO NOTHING', [query]);
  }

  function createArticleTags(id, tags) {
    return tags.map(item =>
      ({
        article_id: parseInt(id, 10),
        tag: item,
      })
    );
  }

  function insertArticleTag(articleId, tags) {
    return knex('article_tag').insert(createArticleTags(articleId, tags));
  }

  return {
    getUserByUsername,
    getUser,
    getProject,
    getProjects,
    getArticle,
    getArticles,
    getTagsForArtice,
    insertArticle,
    insertTags,
    insertArticleTag,
  };
};
