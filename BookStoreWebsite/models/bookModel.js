const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/BookStore');
const bookSchema = mongoose.Schema({
    bookname: {type: String},
    isbn: {type: Number},
    edition: {type: String},
    price: {type: Number}
})
module.exports  = mongoose.model("book", bookSchema); 