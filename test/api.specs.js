var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../server');

chai.use(chaiHttp);

describe('API routes', () => {
    it('should return all projects', () => {
        return chai.request('http://localhost:3001').get('/api/projects')
        .then(res => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            return res.body.should.have.length(5);
        });
    });

    it('should return a single project', () => {
        return chai.request('http://localhost:3001').get('/api/projects/1')
        .then(res => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.include.keys('id');
            res.body.id.should.equal('1');
            return res.body.title.should.equal('AgriScore');
        });
    });

    it('should return redirect to /login', () => {
        return chai.request('http://localhost:3001').get('/publish')
        .then(res => {
            res.redirects[0].should.equal('http://localhost:3001/login/');
            return res.should.have.status(200);
        });
    });
});
