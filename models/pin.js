const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

var schema = mongoose.Schema;

// Define a schema
var PinSchema = new schema({
    _ID: ObjectId,
    pinNumber: String,
    userId: Number,
    exerciseId: Number, 
},{ versionKey: false });

module.exports = mongoose.model("pins", PinSchema, "pins");
