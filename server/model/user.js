"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");
var SALT_FACTOR = 10;
var noop = function () {};

var userSchema = mongoose.Schema({
    username: { type: String, trim: true, required: true, unique: true },
    password: { type: String, required: true },
    email: {
        type: String, 
        trim: true, 
        lowercase: true, 
        unique: true, 
        required: true,
    },
    createdAt: {type: Date, default: Date.now },
    displayName: String,
    bio: String,
    range: { type: Number, default: 25, min: 10, max: 60 },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task'}],
})

userSchema.methods.name = function () {
    return this.displayName || this.username;
}

userSchema.pre('save', function (done) {
    var user = this;
    if (!user.isModified("password")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(user.password, salt, noop, function (err, hashedPassword) {
            if (err) { return done(err); }
            user.password = hashedPassword;
            done();
        })
    })
});

userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    })
}

var user;
try {
    console.log("user model created");
    user = mongoose.model("User", userSchema);
} catch(e) {
    console.log("user oops");
    user = mongoose.model("User");
}

module.exports = user;