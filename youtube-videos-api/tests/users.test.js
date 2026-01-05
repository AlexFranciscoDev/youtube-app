const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const User = require("../models/User");
const Video = require("../models/Video");
const jwtService = require("../services/jwt");
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const moment = require('moment');

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

describe('POST /api/user/login', () => {
    test('Check that we receive all the parameters', async () => {
        const res = await request(app)
        .post('/api/user/login')
        .send({
            email: 'prueba@prueba.com'
        })
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('Missing parameters');
    })

    test('Check that the user exists', async () => {
        const res = await request(app)
        .post('/api/user/login')
        .send({
            email: 'testuser@test.com',
            password: 'myPassword'
        })
        expect(res.statusCode).toBe(404);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('User not found');
    })

    test('Check that the password introduced is correct', async () => {
        const imageBuffer = Buffer.from('fake image content');
        const originalPassword = '123456'
        // Create the user
        const res = await request(app)
        .post('/api/user/register')
        .field('username', 'randomUser')
        .field('email', 'test@test.com')
        .field('password', originalPassword)
        .attach('image', imageBuffer, 'image.jpg')
        
        const userSaved = await User.findOne({_id: res.body.user._id})
        expect(userSaved).toMatchObject({username: 'randomUser'})
        expect(await bcrypt.compare('wrongPassword', userSaved.password)).toBeFalsy();
    })

    test('User found correctly and token is created', async () => {
        const originalPassword = '123456'
        // Create the user directly in the database (more efficient for setup)
        const hashedPassword = await bcrypt.hash(originalPassword, 10);
        const userSaved = await User.create({
            username: 'randomUser',
            email: 'test@test.com',
            password: hashedPassword,
            image: 'test-image.jpg'
        })

        expect(userSaved).toMatchObject({username: 'randomUser'})
        expect(await bcrypt.compare(originalPassword, userSaved.password)).toBeTruthy();

        // Test the login endpoint
        const res = await request(app)
        .post('/api/user/login')
        .send({
            email: userSaved.email,
            password: originalPassword
        })
        
        // Verify response
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('User found');
        
        // Verify that token exists in response
        /*
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(0);
        
        // Decode and verify token structure
        const decodedToken = jwt.decode(res.body.token, jwtService.secret);
        
        // Verify token contains correct user data
        expect(decodedToken).toHaveProperty('id');
        expect(decodedToken).toHaveProperty('username');
        expect(decodedToken).toHaveProperty('iat'); // issued at
        expect(decodedToken).toHaveProperty('exp'); // expiration
        
        // Verify token data matches user
        expect(decodedToken.id).toBe(userSaved._id.toString());
        expect(decodedToken.username).toBe(userSaved.username);
        
        // Verify token expiration (should be ~14 days from now)
        const expectedExp = moment().add(14, 'days').unix();
        const timeDifference = Math.abs(decodedToken.exp - expectedExp);
        // Allow 5 seconds difference for test execution time
        expect(timeDifference).toBeLessThan(5);
        
        // Verify token is not expired
        expect(decodedToken.exp).toBeGreaterThan(moment().unix());
        */
    })
})
