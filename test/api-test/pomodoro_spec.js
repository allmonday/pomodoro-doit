var app = require("../../server");
var assert = require("assert");
var supertest = require("supertest");
var request = supertest(app);
var mongodb = require("mongodb");

function dropDb (cb) {
    var MongoClient = mongodb.MongoClient;
    MongoClient.connect("mongodb://localhost:27017/pomodoro-test", function (err, db) {
        db.dropDatabase().then(() => {
            db.close();
            cb();  // fucking call back...
        })
    })
}

describe("Pages", function () {
    it("visit home page", function (done) {
        request
            .get("/")
            .expect("Content-Type", /text\/html/)
            .expect(200)
            .end(done);
    });

    it("visit /app/pomodoro will ask for login", function (done) {
        request.get("/app/pomodoro")
            .expect(302)
            .expect("Content-Type", /text\/plain/)
            .expect("Location", "/")
            .end(done);
    });
})

describe("APIs of user authentication", function () {
    dropDb();
    var agent = supertest.agent(app);

    it("test signup, password less than 6", function (done) {  // dont understand..
        agent
            .post("/signup")
            .type("form")
            .send({password: "123", username: "tangkikodo"})
            .expect("Location", "/signup")
            .end(done)
    });

    it("test signup", function (done) {  // dont understand..
        agent
            .post("/signup")
            .type("form")
            .send({password: "123456", username: "tangkikodo"})
            .expect("Location", "/")
            .end(done)
    });
    it("test signup repeatly will fail", function (done) {
        agent
            .post("/signup")
            .type("form")
            .send({password: "1", username: "tangkikodo"})
            .expect("Location", "/signup")
            .end(done);
    });
    it("shoud fail the login", function (done) {
        agent.post("/login")
            .type("form")
            .send({password: "23", username: "tangkikodo"})
            .expect("Location", "/")
            .expect(302)
            .end(done);
    })
    it("should be able to login", function (done) {
        agent.post("/login")
            .type("form")
            .send({password: "123456", username: "tangkikodo"})
            .expect("Location", "/app/pomodoro")
            .expect(302)
            .end(done);
    })
    it("should be able to app/pomodoro", function (done) {
        agent.get("/app/pomodoro")
            .expect(200)
            .end(done);
    })
})

describe("APIs of task creation", function () {
    var agent = supertest.agent(app);
    var taskId;
    it("success to login", function (done) {
        agent.post("/login")
            .type("form")
            .send({password: "123456", username: "tangkikodo"})
            .expect("Location", "/app/pomodoro")
            .expect(302)
            .end(done);
    })
    it("fail to create an empty task", function (done) {
        agent.post("/api/pomodoro/task")
            .send({name: ""})
            .expect(400)
            .end(done);

    })
    it("create an task", function (done) {
        agent.post("/api/pomodoro/task")
            .send({name: "kikodo rocks"})
            .expect(200)
            .end(done);
    })
    it("should be able to get task list", function (done) {
        agent.get("/api/pomodoro/task")
            .expect("Content-Type", /json/)
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].name, "kikodo rocks")
                taskId = res.body[0]._id;
            })
            .end(done);
    })
    it("today should be empty", function (done) {
        agent.get("/api/pomodoro/today")
            .expect("Content-Type", /json/)
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.length, 0);
            })
            .end(done);
    })
    it("add the task to today", function (done) {
        agent.post("/api/pomodoro/today")
            .send({ sourceid: taskId, targetid: null, isinter: false})
            .expect(200)
            .end(done);
    })

    it("today should has one item", function (done) {
        agent.get("/api/pomodoro/today")
            .expect("Content-Type", /json/)
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0]._id, taskId);
            })
            .end(done);
    })
    it("task should not be empty", function (done) {
        agent.get("/api/pomodoro/task")
            .expect("Content-Type", /json/)
            .expect(200)
            .expect(function (res) { assert.equal(res.body.length, 0); })
            .end(done);
    })

})

describe("APIs of task operation", function () {
    var agent = supertest.agent(app);
    it("should be able to move into today", function (done) {
        done(); 
    })
})