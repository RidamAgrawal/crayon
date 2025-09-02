const mongoose=require('mongoose');

const uri=process.env.MONGO_URI;

function dbCon(){
    mongoose.connect(uri);
}
module.exports=dbCon;

//username:agarwalagam04
//password:CQWsi8YA3vSzVSpc