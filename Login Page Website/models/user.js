const mongoose  = require('mongoose');
const { setTheUsername } = require('whatwg-url');
mongoose.connect('mongodb://127.0.0.1:27017/authtestapp');

const userSchema = mongoose.Schema({
    username : String,
    email : String,
    password : String, 
    age : Number,
    image : String
});

module.exports  = mongoose.model("user", userSchema);