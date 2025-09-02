const mongoose=require('mongoose');

const moviesSchema= new mongoose.Schema({
    plot:String,
    genres:Array,
    runtime:Number,
    cast:Array,
    poster:String,
    title:String,
    fullplot:String,
    languages:Array,
    realased:Date,
    directors:Array,
    writers:Array,
    awards:Object,
    lastupdated:Date,
    year:Number,
    imdb:Object,
    type:String,
    tomatoes:Object,
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'comments',
        },
    ],
});

const movies=mongoose.model("movies",moviesSchema,"movies");

module.exports=movies;