var app = require("../../server");
var assert = require("assert");
var supertest = require("supertest");
var request = supertest(app);
var mongodb = require("mongodb");
var agent = supertest.agent(app);

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

    it("test signup, password less than 6", function (done) {  // dont understand..
        agent
            .post("/signup")
            .type("form")
            .send({password: "123", username: "tangkikodo"})
            .expect("Location", "/signup")
            .end(done)
    });

    it("test signup, error mail syntax", function (done) {  // dont understand..
        agent
            .post("/signup")
            .type("form")
            .send({password: "123123", username: "tangkikodo", email: "tang@"})
            .expect("Location", "/signup")
            .end(done)
    });

    it("test signup", function (done) {  // dont understand..
        agent
            .post("/signup")
            .type("form")
            .send({password: "123456", username: "tangkikodo", email: "tangkikodo@e.com"})
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

describe("APIs of task creation and pomodoro add & sub ", function () {
    var taskId;
    var pomodoroId;
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

    it("today should has one item, with one pomodoro timer", function (done) {
        agent.get("/api/pomodoro/today")
            .expect("Content-Type", /json/)
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0]._id, taskId);
                assert.equal(res.body[0].pomodoros.length, 1);
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

    it("add pomodoro for today task", function (done) {
        agent.post("/api/pomodoro/today/pomodoro")   
            .send({ id: taskId})
            .expect(200)
            .end(done);
    })
    it("should have two pomodoro for the task", function (done) {
        agent.get("/api/pomodoro/today")
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body[0].pomodoros.length, 2);
            })
            .end(done);
    })
    it("sub pomodoro for today task", function (done) {
        agent.delete("/api/pomodoro/today/pomodoro")   
            .send({ id: taskId})
            .expect(200)
            .end(done);
    })
    it("should have one pomodoro for the task", function (done) {
        agent.get("/api/pomodoro/today")
            .expect(200)
            .expect(function (res) {
                pomodoroId = res.body[0].pomodoros[0]._id;
                assert.equal(res.body[0].pomodoros.length, 1);
            })
            .end(done);
    })
    it("start the first pomodoro timer", function (done) {
        agent.post("/api/pomodoro/today/pomodoro/state")
            .send({taskId: taskId, pomodoroId: pomodoroId})
            .expect(200)
            .end(done);
    })
    it("should have one pomodoro is running", function (done) {
        agent.get("/api/pomodoro/today")
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body[0].pomodoros[0].status, true);
            })
            .end(done);
    })
    it("cancel the pomodoro timer", function (done) {
        agent.put("/api/pomodoro/today/pomodoro/state")
            .send({taskId: taskId, pomodoroId: pomodoroId})
            .expect(200)
            .end(done);

    })
    it("first pomodoro is not running ", function (done) {
        agent.get("/api/pomodoro/today")
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body[0].pomodoros[0].status, false);
                assert.equal(res.body[0].pomodoros[0].startTime, null);
            })
            .end(done);
    })
    it("update range", function (done) {
        agent.put("/api/pomodoro/user")
            .send({ range: 40 })
            .expect(200)
            .end(done);
    })
    it("range shoud be 40", function (done) {
        agent.get("/api/pomodoro/user")
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.range, 40)
            })
            .end(done);
    })
    it("update range out of 60", function (done) {
        agent.put("/api/pomodoro/user")
            .send({ range: 70 })
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.error, 'out of range')
            })
            .end(done);
    })
})

describe("APIs access control: not logged in", function () {

    describe("not logged in", function () {
        it("first logged out", function (done) {
            agent.get("/logout")
                .expect(302)
                .expect("Location", "/")
                .end(done);
        });
        it("can invoke api", function (done) {
            agent.get("/api/pomodoro/task")
                .expect(400)
                .expect(function (res) {
                    assert.equal(res.body.error, 'need logged in');
                })
                .end(done)
        });
    });

    describe("logged in", function () {

        it("login", function (done) {
            agent.post("/login")
                .type("form")
                .send({password: "123456", username: "tangkikodo"})
                .expect("Location", "/app/pomodoro")
                .expect(302)
                .end(done);
        })

        it("can invoke api", function (done) {
            agent.get("/api/pomodoro/task")
                .expect(200)
                .end(done)
        });
    })
})


