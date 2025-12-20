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
        const resA = await request(app)
            .get("/api/video/filter")
            .set("Authorization", token)
        expect(resA.statusCode).toBe(400);
        expect(resA.body.status).toBe("Error");
        expect(resA.body.message).toBe("Missing paremeters");

        /* Category missing */
        const resB = await request(app)
            .get("/api/video/filter?platform=Instagram")
            .set("Authorization", token)
        expect(resB.statusCode).toBe(400);
        expect(resB.body.status).toBe("Error");
        expect(resB.body.message).toBe("Missing paremeters");

        /* Platform missing */
        const resC = await request(app)
            .get("/api/video/filter?category=690fa1dfdebd7b22beafb37e")
            .set("Authorization", token)
        expect(resC.statusCode).toBe(400);
        expect(resC.body.status).toBe("Error");
        expect(resC.body.message).toBe("Missing paremeters");
    })

    test('Check if the category is valid', async () => {
        const categoryA = new mongoose.Types.ObjectId();
        const resA = await request(app)
            .get(`/api/video/filter?platform=Instagram&category=565676776`)
            .set("Authorization", token)
        expect(resA.statusCode).toBe(400);
        expect(resA.body.status).toBe("Error");
        expect(resA.body.message).toBe("The category id provided is not valid");
    })



    // POSITIVES
    test('Get videos by platform and category', async () => {
        const categoryTest = new mongoose.Types.ObjectId();
        const videos = await Video.create([
            { title: "Video 1", description: "video description 1", url: "https://youtube.com/1", category: categoryTest, platform: "Youtube", file: "adfasdfa.png" },
            { title: "Video 2", description: "video description 2", url: "https://instagram.com/2", category: categoryTest, platform: "Instagram", file: "adfasdfa.png" },
            { title: "Video 4", description: "video description 4", url: "https://tiktok.com/2", category: categoryTest, platform: "Youtube", file: "adfasdfa.png" }
        ])
        // Get videos from youtube
        const resA = await request(app)
            .get(`/api/video/filter?category=${categoryTest}&platform=Youtube`)
            .set("Authorization", token)

        expect(resA.statusCode).toBe(200);
        expect(resA.body.status).toBe("Success");
        expect(resA.body.message).toBe('Returning videos by platform and category');
        expect(resA.body.videos).toHaveLength(2);
        resA.body.videos.forEach(video => {
            expect(video).toHaveProperty('title');
            expect(video).toHaveProperty('description');
            expect(video).toHaveProperty('url');
        })

        // Get videos from instagram
        const resB = await request(app)
            .get(`/api/video/filter?category=${categoryTest}&platform=Instagram`)
            .set("Authorization", token)
        expect(resB.statusCode).toBe(200);
        expect(resB.body.status).toBe("Success");
        expect(resB.body.message).toBe('Returning videos by platform and category');
        expect(resB.body.videos).toHaveLength(1);
        resB.body.videos.forEach(video => {
            expect(video).toHaveProperty('title');
            expect(video).toHaveProperty('description');
            expect(video).toHaveProperty('url');
        })
    })

    test('No videos found from category and platform', async () => {
        const resA = await request(app)
            .get(`/api/video/filter?category=690fa1dfdebd7b22beafb37e&platform=Youtube`)
            .set('Authorization', token)
        expect(resA.statusCode).toBe(404);
        expect(resA.body.status).toBe("Error");
        expect(resA.body.message).toBe("No videos found");
    })
})

describe('PUT /api/video/:id', () => {
    const video = new Video({
        _id: '6920fd95efb67fafe65e17f2',
        user: '66892682986i9',
        title: 'Video prueba',
        description: 'Video prueba',
        category: '66892682986i9',
        platform: 'Youtube',
        image: 'asdfasdfasdf'
    })

    test('Check that the body is filled', async () => {
        const res = await request(app)
            .put('/api/video/:id')
            .set('Authorization', token)
            .send({})

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('No fields to update provided');
    })

    test('Check if the video exists', async () => {
        const resA = await request(app)
            .put('/api/video/6920fd95efb67fafe65e17f1')
            .set('Authorization', token)
            .send({ title: 'prueba' })

        expect(resA.statusCode).toBe(404);
        expect(resA.body.status).toBe('Error');
        expect(resA.body.message).toBe('No video found');
    })

    test('Check that the video is from the user logged', async () => {
        // user loggued: 6920fd95efb67fafe65e17f0
        // Create a video from a different user
        const otherUserId = new mongoose.Types.ObjectId();
        const categoryId = new mongoose.Types.ObjectId();
        const videoId = new mongoose.Types.ObjectId();
        
        // Create the video in the database
        await Video.create({
            _id: videoId,
            user: otherUserId, // Different user from the logged one
            title: 'This is a video from another user',
            description: 'Description of video from another user',
            url: 'asdfasdfasdfasfasdf',
            category: categoryId,
            platform: 'Youtube',
            image: 'asdfasdfasdf'
        });
        
        const res = await request(app)
            .put(`/api/video/${videoId}`)
            .set('Authorization', token)
            .send({ title: 'Prueba' })

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('You are not allowed to edit this post');
    })

    test('Edit video successfully', async () => {
        const videoId = new mongoose.Types.ObjectId();
        const categoryId = new mongoose.Types.ObjectId();
        // Use the logged user ID from beforeAll: 6920fd95efb67fafe65e17f0
        const loggedUserId = "6920fd95efb67fafe65e17f0";

        const videoTest = await Video.create({
            _id: videoId,
            user: loggedUserId, // Use the logged user ID so the edit is allowed
            title: 'Video test',
            description: 'Video description',
            url: 'asdjfasfjasldkfjasd',
            category: categoryId,
            platform: 'TikTok',
            image: 'image.jpg'
        })
        
        const res = await request(app)
        .put(`/api/video/${videoTest._id}`)
        .set('Authorization', token)
        .send({
            title: 'This is the new title',
            description: 'This is the new description'
        })
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('Video edited successfully');
        expect(res.body.video.title).toBe('This is the new title');
        expect(res.body.video.description).toBe('This is the new description');
    })
})

describe("DELETE /api/video/:id o /api/video/bulk", () => {
    
    /*
    3.1. Para borrado múltiple:
Array de IDs no vacío
Todos los IDs válidos (ObjectId)
Videos existentes
Todos pertenecen al usuario
3.2. Para borrado único:
ID presente
ID válido (ObjectId)
Video existe
Video pertenece al usuario
    */ 
})