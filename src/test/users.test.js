import 'babel-polyfill';
import chai from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';

const baseURL = config.get('application.baseURL');
const { expect } = chai;
chai.use(chaiHttp);

const token = config.get('application.testCredentials.token');
describe('GET Users listing:', () => {
  it('should return a successful status code and a message', done => {
    chai
      .request(baseURL)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.equals(true);
        expect(res.body.message).to.equals('Successfully retrieved list of users.');
        expect(res.body).to.have.property('users');
        expect(res.body.users).to.be.an('array');
        done();
      });
  }).timeout(10000);
});
