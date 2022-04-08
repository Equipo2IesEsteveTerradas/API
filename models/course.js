const mongoose = require('mongoose');

var Schema = mongoose.Schema;

// Define a schema
const CourseSchema = new Schema({
    
    title: String,
    description: String,
    subscribers: Object,
    elements: Array,
    tasks: Array,
    vr_tasks: Array,
});

// const CourseSchema = new Schema({
//     _ID: Schema.Types.ObjectId,
//     title: String,
//     description: String,
//     subscribers: {
//         teachers: Array, 
//         students: Array
//     },
//     elements: [{
//         ID:Number, 
//         type:String, 
//         title:String, 
//         description:String, 
//         order:Number, 
//         contents:String
//     }],
//     tasks: [{
//         ID:Number, 
//         type:String, 
//         title:String, 
//         description:String, 
//         order:Number, 
//         uploads:[{
//             studentID: Number, 
//             text: String, 
//             file: String, 
//             grade: Number, 
//             feedback: String
//         }]
//     }],
//     vr_tasks: [{
//         ID:Number, 
//         title:String, 
//         description:String, 
//         VRexID:Number, 
//         versionID:Number, 
//         pollID:Number, 
//         completions:[{
//             studentID: Number, 
//             position_data: {
//                 data: String
//             }, 
//             autograde: {
//                 passed_items: Number, 
//                 failed_items: Number, 
//                 comments: String
//             }, 
//             grade: Number, 
//             feedback: String
//         }]
//     }],
// });



module.exports = mongoose.model("courses", CourseSchema, "courses");