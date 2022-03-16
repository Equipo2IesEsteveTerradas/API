const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

var Schema = mongoose.Schema;

// Define a schema
var UserSchema = new Schema({
    _ID: ObjectId,
    name: String,
    password: String,
    token: String,
    expiration_time: Date,
    id: Number
});

module.exports = mongoose.model("users", UserSchema, "users");