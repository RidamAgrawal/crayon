const express = require('express');
const router = express.Router();

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
    res.clearCookie('token');
    res.send('user logged out');
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
})

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
})

router.post('wishlist/:movieId',async (req,res)=>{
   try{
    const movieId=req.params.movieId;
    let token=req.cookies.token;
    if(token){
        let decoded=jwr.verify(token,process.env.JWT_SECRET_KEY);
        let {id}=decoded;
        const user=await userModel.findByIdAndUpdate(id,{
            $push: {wishlist: {movie:movieId} },
        })
        res.status(200).json(user);
    }
    else{
        res.status(404).json({error:'not found',message:'user not found'})
    }
   }
   catch(error){

   }
})
module.exports = router;