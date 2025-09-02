const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Reference to the 'user' collection
        required: true,
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'movies', // Reference to the 'movie' collection
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 500,
    },
    likes:{
        type:Number,
        default:0,
    },
    dislikes:{
        type:Number,
        default:0
    },
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comments', // Reference to other comments
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model('comments', commentSchema, 'comments');

module.exports = Comment;