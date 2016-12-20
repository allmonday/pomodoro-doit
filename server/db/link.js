var url = "mongodb://192.168.0.104:27017/pomodoro";
var mongoose = require("mongoose");

mongoose.connect(url);
var db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error'));
db.once("open", function () {

    console.log('success');
    var kittySchema = mongoose.Schema({
        name: String
    })
    kittySchema.methods.speak = function () {
        var greeting = this.name?
        "meow" + this.name:
        "no name";
        console.log(greeting);
    }

    var Kitten = mongoose.model('Kitten', kittySchema);

    var silence = new Kitten({name: 'slience'});
    silence.save(function (err, silence) {
        if (err) return console.error(err);
        silence.speak();
        db.close();
    })

    // Kitten.find(function (err, kittens) {
    //     if (err) return console.error(err);
    //     console.log(kittens);
    // })

})



