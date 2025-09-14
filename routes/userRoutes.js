const express = require('express');
const router = express.Router();

const movieModel = require('../models/movies');
const userModel = require('../models/user');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/createUser', async (req, res) => {
    try {
        let { name, email, password, avatar } = req.body;

        let user = await userModel.findOne({ email: email });
        if (user) {
            res.json({ error: "already exists" });
            return;
        }

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {

                let createdUser = await userModel.create({
                    name,
                    avatar,
                    email,
                    password: hash,
                });

                let jwtToken = jwt.sign({ email: createdUser.email, name: createdUser.name, avatar: createdUser.avatar, id: createdUser._id }, process.env.JWT_SECRET_KEY);
                res.cookie('token', jwtToken, { httpOnly: true });
                res.json(createdUser);
            })
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});

router.post('/loginUser', async (req, res) => {
    try {
        let { email, password } = req.body;
        let token = req.cookies.token;
        if (token) {
            let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            let { name, email, avatar, id } = decoded;
            return res.status(200).json({ name, email, avatar, id });
        }
        let user = await userModel.findOne({ email });
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    let jwtToken = jwt.sign({ email: user.email, name: user.name, avatar: user.avatar, id: user._id }, process.env.JWT_SECRET_KEY);
                    res.cookie('token', jwtToken, { httpOnly: true });
                    res.status(200).json({ name: user.name, email, avatar: user.avatar, id: user._id });
                }
                else {
                    res.status(401).json({ error: "either name or password is incorrect" });
                }
            })
        }
        else {
            res.status(401).json({ error: "either name or password is incorrect" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});

router.get('/logout', (req, res) => {
    try{
        res.clearCookie('token');
        res.status(200).json({ message:'user logged out' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error:err });
    }
})

router.put('/update/:id', async (req, res) => {
    try {
        let userId = req.params.id;

        let { name, avatar, password } = req.body;
        let user = await userModel.findById(userId);

        if (user) {
            bcrypt.compare(password, user.password, async (err, isMatch) => {
                if (isMatch) {
                    user.name = name;
                    user.avatar = avatar;
                    await user.save();
                    let jwtToken = jwt.sign({ email: user.email, name: user.name, avatar: user.avatar, id: user._id }, process.env.JWT_SECRET_KEY);
                    res.cookie('token', jwtToken, { httpOnly: true });
                    res.status(200).json(user);
                }
                else {
                    res.status(401).json({ error: "either name or password is incorrect" });
                }
            })
        }
        else {
            res.status(401).json({ error: "either name or password is incorrect" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});

// fetches all visited movies by latest order
router.get('/visited/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userModel.findById(id).populate({
            path: 'visited.movie', // Populate movie field inside searches array
            select: 'title year poster',   // Optional: pick fields you want from the movie
        });

        if (!user) {
            return res.status(404).json({
                error: "not found",
                message: 'user not found',
            });
        }
        const visitedMovies = user.visited
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(entry => ({
            movieId: entry.movie._id,
            title: entry.movie.title,
            year: entry.movie.year,
            poster: entry.movie.poster,
            visitedAt: entry.createdAt
        }));
        return res.status(200).json({ visitedMovies });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});

//user wishlist toggle api will remove movieId if present otherwise add it in list
router.get('/wishlist/:movieId', async (req, res) => {
    try {
        const movieId = req.params.movieId;
        let token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                error: 'authentication error',
                message: 'user login required'
            });
        }
        let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { id } = decoded;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'user_not_found' });
        }
        const indexUserLike = user.wishlist.findIndex(
            item => item.movie.toString() === movieId
        );

        let action = '';

        if (indexUserLike > -1) {
            // Movie exists → remove it
            user.wishlist.splice(indexUserLike, 1);
            action = 'removed';
        } else {
            // Movie doesn't exist → add it
            user.wishlist.push({
                movie: movieId,
                createdAt: new Date()
            });
            action = 'added';
        }

        await user.save();

        return res.status(200).json({
            status: 'success',
            action,
            message: `Movie successfully ${action} in wishlist.`,
            wishlist: user.wishlist
        });
    } catch (error) {
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});

router.get('/wishlist',async (req,res) => {
    try{
        let token = req.cookies.token;
        if(token) {
            let decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
            let {id} = decoded;
            const user = await userModel.findById(id).populate({
                path: 'wishlist.movie',
                select: 'title year genres imdb comments likes',
            });
             
            res.status(200).json({ wishlist : user.wishlist });
        }
        else {
            res.status(401).json({error:'authentication error',message:'user login required'});
        }
    }
    catch (error) {
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});

router.get('/searches/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userModel.findById(id).populate({
            path: 'searches.movie', // Populate movie field inside searches array
            select: 'title year',   // Optional: pick fields you want from the movie
        });

        if (!user) {
            return res.status(404).json({
                error: "not found",
                message: 'user not found',
            });
        }

        return res.status(200).json({ searches: user.searches });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});


router.get('/like',async (req,res) => {
    try{
        let token = req.cookies.token;
        if(token) {
            let decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
            let {id} = decoded;
            const user = await userModel.findById(id);
             
            res.status(200).json({ liked : user.like });
        }
        else {
            res.status(401).json({error:'authentication error',message:'user login required'});
        }
    }
    catch (error) {
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});

//user like toggle api will remove movieId if present in like array otherwise add it in list
router.get('/like/:movieId', async (req, res) => {
    try {
        const movieId = req.params.movieId;
        let token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                error: 'authentication error',
                message: 'user login required'
            });
        }
        let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { id } = decoded;
        const user = await userModel.findById(id);
        const movie = await movieModel.findById(movieId);

        if (!user || !movie) {
            return res.status(404).json({ error: 'user_not_found' });
        }
        const indexUserDislike = user.dislike.findIndex(
            item => item.movie.toString() === movieId
        )
        const indexMovieDislike = movie.dislikes.findIndex(
            item => item.user.toString() === id
        )
        if(indexUserDislike > -1){
            user.dislike.splice(indexUserDislike,1);
        }
        if(indexMovieDislike > -1){
            movie.dislikes.splice(indexMovieDislike,1);
        }

        const indexUserLike = user.like.findIndex(
            item => item.movie.toString() === movieId
        );
        const indexMovieLike = movie.likes.findIndex(
            item => item.user.toString() === id
        );

        let action = '';

        if (indexUserLike > -1) {
            // Movie exists → remove it
            user.like.splice(indexUserLike, 1);
            action = 'removed';
            if(indexMovieLike > -1){
                movie.likes.splice(indexMovieLike, 1);
            }
        } else {
            // Movie doesn't exist → add it
            user.like.push({
                movie: movieId,
                createdAt: new Date()
            });
            movie.likes.push({
                user: id,
                createdAt: new Date(),
            });
            action = 'added';
        }

        await user.save();
        await movie.save();
        
        return res.status(200).json({
            status: 'success',
            action,
            message: `Movie successfully ${action} in like.`,
            like: user.like
        });
    } catch (error) {
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});


router.get('/dislike',async (req,res) => {
    try{
        let token = req.cookies.token;
        if(token) {
            let decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
            let {id} = decoded;
            const user = await userModel.findById(id);
             
            res.status(200).json({ disliked : user.dislike });
        }
        else {
            res.status(401).json({error:'authentication error',message:'user login required'});
        }
    }
    catch (error) {
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});

//user dislike toggle api will remove movieId if present in like array otherwise add it in list
router.get('/dislike/:movieId', async (req, res) => {
    try {
        const movieId = req.params.movieId;
        let token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                error: 'authentication error',
                message: 'user login required'
            });
        }
        let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { id } = decoded;
        const user = await userModel.findById(id);
        const movie = await movieModel.findById(movieId);
        
        if (!user || !movie) {
            return res.status(404).json({ error: 'user_not_found' });
        }
        const indexMovieLike = movie.likes.findIndex(
            item => item.user.toString() === id
        );
        const indexUserLike = user.like.findIndex(
            item => item.movie.toString() === movieId
        )
        if(indexUserLike > -1){
            user.like.splice(indexLike,1);
        }
        if(indexMovieLike > -1){
            movie.likes.splice(indexMovieLike, 1);
        }
        
        const indexUserDislike = user.dislike.findIndex(
            item => item.movie.toString() === movieId
        );
        const indexMovieDislike = movie.dislikes.findIndex(
            item => item.user.toString() === id
        );
        let action = '';

        if (indexUserDislike > -1) {
            // Movie exists → remove it
            user.dislike.splice(indexUserLike, 1);
            action = 'removed';
            if(indexMovieDislike > -1){
                movie.likes.splice(indexMovieDislike, 1);
            }
        } else {
            // Movie doesn't exist → add it
            user.dislike.push({
                movie: movieId,
                createdAt: new Date()
            });
            if(indexMovieDislike == -1){
                movie.dislikes.push({
                    user: id,
                    createdAt: new Date(),
                });
            }
            action = 'added';
        }

        await user.save();
        await movie.save();
        
        return res.status(200).json({
            status: 'success',
            action,
            message: `Movie successfully ${action} in dislike.`,
            dislike: user.dislike
        });
    } catch (error) {
        return res.status(500).json({
            error: "server_error",
            message: "Something went wrong"
        });
    }
});
module.exports = router;