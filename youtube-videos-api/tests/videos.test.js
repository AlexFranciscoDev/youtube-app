const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const User = require("../models/User");
const Video = require("../models/Video");
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
        username: "TestUser",
        email: "test@test.com",
        password: "123456"
    });

    token = jwtService.createToken(user);
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
VIDEO TEST
------------------
*/
describe("GET /api/videos", () => {
    /* TEST: List all the videos */
    test("List all the videos", async () => {
        // 1. Create test videos in the database
        await Video.create([
            { title: "Video 1", description: "video description 1", url: "https://youtube.com/1", category: "690fa1dfdebd7b22beafb37e", platform: "Youtube", file: "adfasdfa.png" },
            { title: "Video 2", description: "video description 2", url: "https://youtube.com/2", category: "690fa1dfdebd7b22beafb37e", platform: "Youtube", file: "adfasdfa.png" }
        ])

        // 2. Petition to the endpoint + adding the authorization 
        const res = await request(app)
            .get("/api/video")
            .set("Authorization", token);

        // 3. Check the results
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("Success");
        expect(res.body.message).toBe("Listing all the videos");
        expect(res.body.videos.length).toBe(2);
        expect(res.body.videos[0]).toHaveProperty("title");
    })

    /*Test single video found */
    test('Get single video', async () => {
        // const fakeId = new mongoose.Types.ObjectId();
        await Video.create([
            { _id: '6920fd95efb67fafe65e17f0', title: "Video 1", description: "video description 1", url: "https://youtube.com/1", category: "690fa1dfdebd7b22beafb37e", platform: "Youtube", file: "adfasdfa.png" }
        ])

        const res = await request(app)
            .get('/api/video/6920fd95efb67fafe65e17f0')
            .set('Authorization', token)

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('Video found');
        expect(typeof res.body.videoFound).toBe('object');
        expect(res.body.videoFound).toHaveProperty('title');
        expect(res.body.videoFound).toHaveProperty('_id');
    })

    /* Get videos by category */
    test('Get videos by category', async () => {
        // Create the temporal videos
        await Video.create([
            { title: "Video 1", description: "video description 1", url: "https://youtube.com/1", category: "690fa1dfdebd7b22beafb37e", platform: "Youtube", file: "adfasdfa.png" },
            { title: "Video 2", description: "video description 2", url: "https://instagram.com/2", category: "690fa1dfdebd7b22beafb37e", platform: "Instagram", file: "adfasdfa.png" },
            { title: "Video 3", description: "video description 3 which is different", url: "https://instagram.com/2", category: "690f94539f6c5dec5c29a0c6", platform: "Instagram", file: "adfasdfa.png" }
        ])
        // Category A
        const res = await request(app)
            .get('/api/video/category/690fa1dfdebd7b22beafb37e')
            .set('Authorization', token)

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('Getting videos by category');
        expect(typeof res.body.videosFound).toBe('object');
        expect(res.body.videosFound).toHaveLength(2);
        res.body.videosFound.forEach(video => {
            expect(video).toHaveProperty('title');
            expect(video).toHaveProperty('description');
            expect(typeof video.title).toBe('string');
        });

        // Category B
        const resB= await request(app)
            .get('/api/video/category/690f94539f6c5dec5c29a0c6')
            .set('Authorization', token)
        
        expect(resB.body.videosFound).toHaveLength(1);
    })

})