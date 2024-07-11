const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/pizzaDeliverySystem');
const adminSchema = mongoose.Schema({
    adminusername : String,
    adminemail : String,
    adminpassword: String
    // order: [{ type: mongoose.Types.Schema.ObjectId}]
});

module.exports  = mongoose.model("admin", adminSchema); 