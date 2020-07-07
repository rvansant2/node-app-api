import 'babel-polyfill';
import chai from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';

const baseURL = config.get('application.baseURL');
const { expect } = chai;
chai.use(chaiHttp);
describe('App health check', () => {
  it('should return a successful status code and a message', done => {
    chai
      .request(baseURL)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.equals(true);
        expect(res.body.message).to.equals('Healthy check!');
        done();
      });
  });
});
