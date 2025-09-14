const express = require('express');
const router = express.Router();

const jwt=require('jsonwebtoken');
const movieModel = require('../models/movies');
const userModel = require('../models/user');

const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    let movieItems = await movieModel.find({ 'imdb.rating': { $ne: [""] } }).sort({ 'imdb.rating': -1 }).limit(20);
    res.json(movieItems);
});

router.get('/movieId', async (req, res) => {
    let movieId = req.query.movieId;
    // let movieItem=await movieModel.find({ _id: new ObjectId(movieId) });
    try {
        let movieItem = await movieModel
            .findById(new ObjectId(movieId))
        
        let token = req.cookies.token;
        if (token) {
            let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            let { name, email, avatar, id } = decoded;
            
            const user = await userModel.findById(id);
            
            const existingVisit = user.visited.find(v => v.movie.toString() === movieId);

            if (existingVisit) {
                await userModel.updateOne(
                    { _id: id, "visited.movie": movieId },
                    { $set: { "visited.$.createdAt": new Date() } }
                );
            } else {
                await userModel.findByIdAndUpdate(id, {
                    $push: { visited: { movie: movieId } }
                });
            }
        }

        res.status(200).json(movieItem);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/filter', async (req, res) => {

    let { genres, rating, imdbVotes, languages, countries, duration, year, page, limit, search } = req.body;
    if (search) {

        let movieItem = await movieModel.find({ title: { $regex: search, $options: 'i' } });
        await userModel.findByIdAndUpdate(id,{
            $push: {searches: search },
        });
        res.json(movieItem);
        return;
    }
    let filters = {};
    if (!limit) { limit = 20; }
    if (genres) {
        filters.genres = { $in: genres.split(',') };
    }
    if (imdbVotes) {
        filters["imdb.votes"] = { $gte: parseInt(imdbVotes), $ne: "" };
    }
    else {
        filters["imdb.votes"] = { $ne: "" };
    }
    if (rating && isNaN(rating) ) {
        filters["imdb.rating"] = { $gte: parseFloat(+rating), $ne: "" };
    }
    else {
        filters["imdb.rating"] = { $ne: "" };
    }
    if (languages) {
        filters.languages = languages;
    }
    if (countries) {
        filters.countries = { $in: countries.split(',') };
    }
    if (duration) {
        filters.runtime = { $lte: parseInt(duration) };
    }
    if (year) {
        filters.year = { $gte: parseInt(year) };
    }
    if (page) { page = parseInt(page); }
    else { page = 0; }
    let movieItems = await movieModel.find(filters).sort({ 'imdb.rating': -1 }).skip(page * limit).limit(limit);
    res.json(movieItems);
});

//sreaches a specific mmovie that certainlly exists
router.post('/search', async (req, res) => {
    let { search,page,limit } = req.body;
    let movieItem = await movieModel.find({ title: { $regex: search, $options: 'i' } }).skip(page * limit).limit(limit);
    res.json(movieItem);
});

// router.post('/searchMovies',async (req,res)=>{
//     let {searchString}=req.body;
//     let movieItems=await movieModel.find({title: { $regex: search, $options: 'i'}});
// })

router.get('/test', async (req, res) => {
    let countries = await movieModel.distinct("countries");

    res.send('tested Ok');
})

module.exports = router;