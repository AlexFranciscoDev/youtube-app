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
        _id: "6920fd95efb67fafe65e17f0",
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

    test('No videos found', async () => {
        const res = await request(app)
            .get('/api/video')
            .set('Authorization', token)

        expect(res.statusCode).toBe(404);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('Videos not found');
    })
})

/* 
------------------
GET SINGLE VIDEO TEST
------------------
*/
describe('GET /api/video/:id', () => {
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
        expect(typeof res.body.video).toBe('object');
        expect(res.body.video).toHaveProperty('title');
        expect(res.body.video).toHaveProperty('_id');
    })

    test('Video id is not valid', async () => {
        const res = await request(app)
            .get('/api/video/wd')
            .set('Authorization', token)

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('The id provided is not valid');
    })

    test('Video not found', async () => {
        const categoryTest = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/video/${categoryTest}`)
            .set('Authorization', token)

        expect(res.statusCode).toBe(404);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('Video not found');
    })
})

/* 
------------------
GET VIDEOS BY CATEGORY TEST
------------------
*/
describe('GET /api/video/category/:category', () => {
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
        const resB = await request(app)
            .get('/api/video/category/690f94539f6c5dec5c29a0c6')
            .set('Authorization', token)
        expect(resB.body.videosFound).toHaveLength(1);
    })
})

/* 
------------------
GET VIDEOS BY PLATFORM TEST
------------------
*/
describe('GET /api/video/platform/:platform', () => {
    /* Get videos by platform */
    test('Get videos by platform', async () => {
        categoryA = new mongoose.Types.ObjectId();
        await Video.create([
            { title: "Video 1", description: "video description 1", url: "https://youtube.com/1", category: categoryA, platform: "Youtube", file: "adfasdfa.png" },
            { title: "Video 2", description: "video description 2", url: "https://instagram.com/2", category: categoryA, platform: "Instagram", file: "adfasdfa.png" },
            { title: "Video 4", description: "video description 4", url: "https://tiktok.com/2", category: categoryA, platform: "Instagram", file: "adfasdfa.png" }
        ])

        const resA = await request(app)
            .get('/api/video/platform/Youtube')
            .set('Authorization', token)

        // Positives
        expect(resA.statusCode).toBe(200);
        expect(resA.body.status).toBe('Success');
        expect(resA.body.message).toBe('Getting videos by platform');
        expect(resA.body.videos).toHaveLength(1);
        resA.body.videos.forEach((video) => {
            expect(video).toHaveProperty('title');
            expect(video).toHaveProperty('description');
            expect(video).toHaveProperty('url');
        })

    })

    test('Videos not found from category', async () => {
        const resB = await request(app)
            .get('/api/video/platform/TikTok')
            .set('Authorization', token)
        // Videos not found from category
        expect(resB.statusCode).toBe(404);
        expect(resB.body.status).toBe('Error');
        expect(resB.body.message).toBe(`No videos from platform TikTok`);
    })

    test('No platform found', async () => {
        // No platform found
        const resC = await request(app)
            .get('/api/video/platform/')
            .set('Authorization', token)
        expect(resC.statusCode).toBe(400);
    })
})


/* 
------------------
GET VIDEOS BY USER TEST
------------------
*/
describe("GET /api/video/user/:id", () => {
    test("Check if the user id is not valid", async () => {
        const resA = await request(app)
            .get("/api/video/user/31313131")
            .set("Authorization", token);

        expect(resA.statusCode).toBe(400);
        expect(resA.body.status).toBe("Error");
        expect(resA.body.message).toBe("The user id provided is not valid");
    })

    test("Check if the user exists in the database", async () => {
        const userTest = new mongoose.Types.ObjectId();
        const resB = await request(app)
            .get(`/api/video/user/${userTest}`)
            .set("Authorization", token);

        expect(resB.statusCode).toBe(404);
        expect(resB.body.status).toBe("Error");
        expect(resB.body.message).toBe("User not found");
    })

    test("Find videos by user id", async () => {
        const userTest = new mongoose.Types.ObjectId();
        const categoryA = new mongoose.Types.ObjectId();
        
        // Create the user in the database first
        await User.create({
            _id: userTest,
            username: "TestUser2",
            email: "test2@test.com",
            password: "123456"
        });
        
        await Video.create([
            { user: userTest, title: "Video 1", description: "video description 1", url: "https://youtube.com/1", category: categoryA, platform: "Youtube", file: "adfasdfa.png" },
            { user: userTest, title: "Video 2", description: "video description 2", url: "https://instagram.com/2", category: categoryA, platform: "Instagram", file: "adfasdfa.png" }
            ])
        
        const resC = await request(app)
        .get(`/api/video/user/${userTest}`)
        .set("Authorization", token)

        expect(resC.statusCode).toBe(200);
        expect(resC.body.status).toBe("Success")
        expect(resC.body.message).toBe("Getting videos by user");
        expect(resC.body.videos.length).toBe(2);
        resC.body.videos.forEach(video => {
            expect(video).toHaveProperty("title");
            expect(video).toHaveProperty("description");
        })
    })

    // Test: If no user is passed, the user id from the token is used
    test("Find videos but no user is passed", async () => {
        const categoryA = new mongoose.Types.ObjectId();
        
        // Recreate the user that was deleted in afterEach
        // This user ID matches the one in the token created in beforeAll()
        await User.create({
            _id: "6920fd95efb67fafe65e17f0",
            username: "TestUser",
            email: "test@test.com",
            password: "123456"
        });
        
        await Video.create([
            { user: "6920fd95efb67fafe65e17f0", title: "Video 1", description: "video description 1", url: "https://youtube.com/1", category: categoryA, platform: "Youtube", file: "adfasdfa.png" },
            { user: "6920fd95efb67fafe65e17f0", title: "Video 2", description: "video description 2", url: "https://instagram.com/2", category: categoryA, platform: "Instagram", file: "adfasdfa.png" }
            ])
        
        const resD = await request(app)
        .get("/api/video/user")
        .set("Authorization", token)

        expect(resD.statusCode).toBe(200);
        expect(resD.body.status).toBe("Success")
        expect(resD.body.message).toBe("Getting videos by user");
        expect(resD.body.videos.length).toBe(2);
        resD.body.videos.forEach(video => {
            expect(video).toHaveProperty("title");
            expect(video).toHaveProperty("description");
        })
    })
})

/* 
------------------
GET VIDEOS BY PLATFORM AND CATEGORY TEST
------------------
*/
describe('GET /api/video/platform/:platform/category/:category', () => {
    /* Get videos by platform and category */
    test('Check if the platform and category are provided', async () => {
        /* NEGATIVE: No platform and category are provided */
        const categoryA = new mongoose.Types.ObjectId();
        const platformA = "Instagram";
        const resA = await request (app)
        .get("/api/video/filter")
        .set("Authorization", token)
        expect(resA.statusCode).toBe(400);
        expect(resA.body.status).toBe("Error");
        expect(resA.body.message).toBe("Missing paremeters");

        /* Category missing */
        const resB = await request (app)
        .get("/api/video/filter?platform=Instagram")
        .set("Authorization", token)
        expect(resB.statusCode).toBe(400);
        expect(resB.body.status).toBe("Error");
        expect(resB.body.message).toBe("Missing paremeters");

        /* Platform missing */
        const resC = await request (app)
        .get("/api/video/filter?category=690fa1dfdebd7b22beafb37e")
        .set("Authorization", token)
        expect(resC.statusCode).toBe(400);
        expect(resC.body.status).toBe("Error");
        expect(resC.body.message).toBe("Missing paremeters");
    })

    test('Check if the category is valid', async () => {
        const categoryA = new mongoose.Types.ObjectId();
        const resA = await request (app)
        .get(`/api/video/filter?platform=Instagram&category=565676776`)
        .set("Authorization", token)
        expect(resA.statusCode).toBe(400);
        expect(resA.body.status).toBe("Error");
        expect(resA.body.message).toBe("The category id provided is not valid");
    })
})

/*
------------------------
CREAR OBJECT ID INVENTADOS
const categoryA = new mongoose.Types.ObjectId();
------------------------
*/