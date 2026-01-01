const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const User = require("../models/User");
const Video = require("../models/Video");
const jwtService = require("../services/jwt");

let token;
let userId;

/* 
------------------
BEFORE ALL
------------------
* Connect to the database, in this case, the test database
* Create a test USER
* Create the token of the user so it can be authenticated
*/
beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/youtube-app-test");

    const user = await User.create({
        _id: "6920fd95efb67fafe65e17f0",
        username: "TestUser",
        email: "test@test.com",
        password: "123456"
    });

    token = jwtService.createToken(user);
    userId = user._id;
})

/* 
------------------
AFTER EACH (después de cada test)
------------------
* Delete all collections
*/
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

/* 
------------------
AFTER ALL (después de TODOS los test)
------------------
* Cerrar la conexión con la base de datos
*/
afterAll(async () => {
    await mongoose.connection.close();
})

/* 
------------------
REGISTER USER TEST
------------------
*/
describe('POST /api/user/register', () => {
    test('Check that we receive all the data needed', async () => {
        const imageBuffer = Buffer.from('fake image content');
        const res = await request(app)
        .post('/api/user/register')
        .field('username', 'User test')
        .field('email', 'test@test.com')
        .attach('image', imageBuffer, 'test-image.jpg')
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('Missing parameters');
    })

    test('Check that the data is valid', async () => {
        const imageBuffer = Buffer.from('fake image content');
        const res = await request(app)
        .post('/api/user/register')
        .field('username', 'User test')
        .field('email', 'test.com')
        .field('password', '123456')
        .attach('image', imageBuffer, 'test-image.jpg')
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('Validation failed: username, email or password is invalid');
    })

    test('Check that the user already exists', async () => {
        
    })

})
