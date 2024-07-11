const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/pizzaDeliverySystem')
const pizzaSchema = mongoose.Schema({
    base : {type: String, required: true},
    sauce : { type: String, required: true},
    cheese: { type: String, required: true},
    veggies: [{ type: String, default: true}],
    cost:{type: Number},
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Preparing', 'On the way', 'Delivered']
      }
});

module.exports  = mongoose.model("pizza", pizzaSchema); 