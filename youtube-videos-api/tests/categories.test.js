const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const User = require('../models/User');
const Category = require('../models/Category');
const jwtService = require("../services/jwt");

let token;

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
GET ALL CATEGORIES
------------------
*/
describe('GET /api/category', () => {
    test('List all categories', async () => {
        const category1 = Category.create({
            name: 'Category 1',
            description: 'This is category 1 description',
            image: 'test-image.jpg'
        })
        const category2 = Category.create({
            name: 'Category 2',
            description: 'This is category 2 description',
            image: 'test-image.jpg'
        })
        const res = await request(app)
        .get('/api/category/')
        .set('Authorization', token)
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('Categories listed');
        expect(res.body.categories).toHaveLength(2);
    })
})

/*
name: string,
description: string,
image: string
*/
describe('GET /api/category/:id', () => {
    test('Check that the id provided is valid', async () => {
        const categoryId = 'adawdawdawdaw';
        const res = await new request(app)
        .get(`/api/category/${categoryId}`)
        .set('Authorization', token)
        
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('The id provided is not valid');
    })

    test('Category not found', async () => {
        const categoryId = new mongoose.Types.ObjectId();
        const res = await request(app)
        .get(`/api/category/${categoryId}`)
        .set('Authorization', token)
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('Category not found');
    })

    test('Category found correctly', async () => {
        const categoryId = new mongoose.Types.ObjectId();
        const category = Category.create({
            _id:  categoryId,
            name: 'Category test',
            description: 'Description category test',
            image: 'this is the image content'
        })
        const res = await request(app)
        .get(`/api/category/${categoryId}`)
        .set('Authorization', token)
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('Category found');
        expect(res.body.category._id.toString()).toBe(categoryId.toString());
    })
})
