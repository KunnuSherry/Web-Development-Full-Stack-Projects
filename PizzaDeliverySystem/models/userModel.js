const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/pizzaDeliverySystem');
const userSchema = mongoose.Schema({
    username : {type: String, required: true},
    email : { type: String, required: true},
    password: { type: String, required: true},
    isVerified: { type: Boolean, default: false}
});

module.exports  = mongoose.model("user", userSchema); 