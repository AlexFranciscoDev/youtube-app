const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const User = require("../models/User");
const Video = require("../models/Video");
const jwtService = require("../services/jwt");
const bcrypt = require('bcrypt');

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
        const user = await User.create({
            username: 'TestUser',
            email: 'test@test.com',
            password: '123456',
            image: 'test-image.jpg'
        })
        const imageBuffer = Buffer.from('fake image content');
        const res = await request(app)
        .post('/api/user/register')
        .field('username', 'randomUser')
        .field('email', 'test@test.com')
        .field('password', '123456')
        .attach('image', imageBuffer, 'image-test.jpg')

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('User already exists with that username or email');
    })

    test('Check that password is encrypted correctly', async () => {
        // 1.Register user with know passord (mySecurePassword123)
        const originalPassword = 'mySecurePassword123';
        const imageBuffer = Buffer.from('fake image content');
        // 2. Verify that user is registered correctly
        const res = await request(app)
        .post('/api/user/register')
        .field('username', 'randomUser')
        .field('email', 'test@test.com')
        .field('password', originalPassword)
        .attach('image', imageBuffer, 'image-test.jpg')
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('User registered successfully');
        console.log(res.body.user);
        // 3. Search the user in the database
        const userSaved = await User.findOne({_id: res.body.user._id})
        expect(userSaved).toHaveProperty('username')
        expect(userSaved).toMatchObject({username: 'randomUser'})
        // 4. Verify that the password is not the same as the original  (is hashed)
        expect(userSaved.password).not.toBe(originalPassword);
        expect(userSaved.password.length).toBeGreaterThan(originalPassword.length)
        // 5. Use bcrypt.compare() to verify that the hash corresponds to the original password
        const validPassword = await bcrypt.compare(originalPassword, userSaved.password);
        expect(validPassword).toBeTruthy();
        // 6. Verify that an incorrect password is not valid
        const invalidPassword = await bcrypt.compare('randomPassword', userSaved.password)
    })

    test('Check that user is created correctly', async () => {
        const imageBuffer = Buffer.from('image-test.jpg')
        const res = await request(app)
        .post('/api/user/register')
        .field('username', 'testUser')
        .field('email', 'mail@mail.com')
        .field('password', 'randomPassword')
        .attach('image', imageBuffer, 'image.jpg')
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toContain('Success')
        expect(res.body.message).toContain('User registered successfully')
    })

})
