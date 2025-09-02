const express=require('express');
const router=express.Router();

const {ObjectId}=require('mongodb');

const commentModel=require('../models/comments');
const movieModel=require('../models/movies');
const userModel=require('../models/user');

router.post('/addComment',async (req,res)=>{
    let {user,movie,text}=req.body;
    try{
        const newComment=await commentModel.create({
            user,movie,text,
        });
        await newComment.save();

        await movieModel.findByIdAndUpdate(new ObjectId(movie),{
            $push: {comments: newComment._id },
        });
        
        await userModel.findByIdAndUpdate(new ObjectId(user),{
            $push: {comments: newComment._id},
        })

        res.status(201).json({
            message:"comment added successfully",
            newComment
        });
    }
    catch(err){
        res.status(500).json({
            error:err.message
        });
    }
});

router.get('/:id',async (req,res)=>{
    const commentId=req.params.id;
    const comment=await Comment.findOne({_id:commentId})

    if(!comment){
        return res.status(404).json({error:'comment not found',status:"bad status"})
    }
    res.status(200).json(comment);
})

router.get('/movie/:movieId',async(req,res)=>{
    let movieId=req.params.movieId;
    
    try{
        const movieComments=await commentModel.find({movie:movieId})
        .populate({
            path:'user',
            select:'name email avatar'
        })
        if(!movieComments){
            res.status(404).json({
                error:"not found",
                message:"comments for movie not found",
            })
        }
        res.status(200).json(movieComments);
    }
    catch(error){
        res.status(500).json({
            error:error.message
        })
    }
})

module.exports=router;