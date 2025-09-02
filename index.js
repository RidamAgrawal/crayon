const express=require('express');
const app=express();

const path=require('path');
require('dotenv').config();
const cookieParser=require('cookie-parser');
const {ObjectId}=require('mongodb');

const mongoDB=require('./mongodb/dbCon');
mongoDB();
const userModel=require('./models/user');
const movieModel=require('./models/movies');

const userRoutes=require('./routes/userRoutes.js');
const movieRoutes=require('./routes/movieRoutes.js');
const commentRoutes=require('./routes/commentRoutes.js');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');
app.use(cookieParser());

app.use('/user',userRoutes);
app.use('/movies',movieRoutes);
app.use('/comments',commentRoutes);

try {
    app.get('/',async (req,res)=>{
        let movieItems=await fetch('http://localhost:3000/movies')
        .then(res=>res.json())
        .then(data=>data);
        // console.log(movieItems);
        res.render('home',{movieItems});
    })

    app.get('/movieHome',(req,res)=>{
        res.render('movieHome');
    })
    
    app.get('/movieResults',(req,res)=>{
        let queries=req.query;
        res.render('movieResults',{query:queries});
    })
    app.get('/moviePage',(req,res)=>{
        let movieId=req.query;
        res.render('moviePage',{movieId});
    })
    app.listen('3000',()=>{
        console.log("server listening on port 3000");
    })
} 
catch (error) {
    console.log(error);
}


//ejs vale routes alag chalenge
//data fekne vali api alag chalegi