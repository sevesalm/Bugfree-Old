const chai = require('chai');
const chaiHttp = require('chai-http');
const knexfile = require('../knexfile');
const knex = require('knex')(knexfile.test);
const server = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

describe('API routes', () => {
  beforeEach(() =>
    knex.migrate.latest()
      .then(() => knex.seed.run())
  );

  it('should return all projects', () =>
    chai.request(server).get('/api/projects')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(5);
        return expect(res).to.be.json;
      })
  );

  it('should return a single project', () =>
    chai.request(server).get('/api/projects/1')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.keys('id');
        expect(res.body.id).to.equal(1);
        expect(res.body.title).to.equal('AgriScore');
        return expect(res).to.be.json;
      })
  );

  it('should return redirect to /login', () =>
    chai.request(server).get('/publish')
      .then(res => {
        expect(res).to.have.status(200);
        return expect(res).to.redirectTo('http://127.0.0.1:3001/login/');
      })
  );
});
