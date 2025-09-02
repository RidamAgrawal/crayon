const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 12,
    },
    avatar: {
        type: String,
        trim: true,
    }
    ,
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 20,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comments',
        },
    ],
    searches: [
        {
            movie: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'movies',
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    wishlist: [
        {
            movie: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'movies',
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const user = mongoose.model("user", userSchema, 'user');

module.exports = user;