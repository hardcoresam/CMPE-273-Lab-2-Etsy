const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('./../index');
const { Category } = require("./../models");

describe('Authenticating Backend Apis', () => {
    let jwtToken = null;

    before((done) => {
        chai.request(server)
            .post('/auth/login')
            .send({
                email: 'sai@gmail.com',
                password: 'password'
            })
            .end((err, res) => {
                res.should.have.status(200);
                jwtToken = res.body.token;
                done();
            });
    });

    describe('/GET member', () => {
        it('it should return logged in member', (done) => {
            chai.request(server)
                .get('/member')
                .set('cookie', 'access-token=' + jwtToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                    done();
                });
        });
    })

    describe('/GET products', () => {
        it('it should return all products', (done) => {
            chai.request(server)
                .get('/products')
                .set('cookie', 'access-token=' + jwtToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
    })

    describe('/GET shop', () => {
        it('it should return logged in member shop if present', (done) => {
            chai.request(server)
                .get('/shop')
                .set('cookie', 'access-token=' + jwtToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    })

    describe('/POST shop/available', () => {
        it('it should check whether a shop name is available', (done) => {
            chai.request(server)
                .post('/shop/available')
                .set('cookie', 'access-token=' + jwtToken)
                .send({
                    shopName: 'random testing shop name'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('available');
                    done();
                });
        });
    })

    describe('/POST category', () => {
        let newCategoryId = null;

        it('it should create a new category', (done) => {
            chai.request(server)
                .post('/category')
                .set('cookie', 'access-token=' + jwtToken)
                .send({ categoryName: 'testcategory' })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                    newCategoryId = res.body.id;
                    done();
                });
        });

        after(async () => {
            await Category.destroy({ where: { id: newCategoryId } });
        });
    })
});