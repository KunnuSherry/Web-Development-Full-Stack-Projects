const express = require('express');
const app = express();
const bcrypt = require('bcrypt')
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const userModel = require('./models/userModel')
const bookModel  = require('./models/bookModel')

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set('view engine', "ejs");


app.get('/', (req,res)=>{
    res.render('signup')
})
app.get('/home', isLoggedIn, async(req,res)=>{
    let user = await userModel.findOne({email: req.user.email});
    res.render('home')
})
app.get('/buy', isLoggedIn, async(req,res)=>{
    let books = await bookModel.find();
    let user = await userModel.findOne({email: req.user.email})
    res.render('interface', {books})
})
app.get('/seller', (req,res)=>{
    res.render('seller')
})


app.post('/signup', (req,res)=>{
    let {username, email, password}= req.body;
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async(err,hash)=>{
            let newUser = await userModel.create({
                username,
                email,
                password: hash
            })
            let token = jwt.sign({email}, 'kunal')
            res.cookie('token', token)
            res.redirect('/home')
        })
    })
})

app.post('/login', async(req,res)=>{
    let {email, password} = req.body;
    let user =  await userModel.findOne({email: email})
    if(user){
        bcrypt.compare(password, user.password, (err, result)=>{
            if(result){
                let token = jwt.sign({email:email}, 'kunal')
                res.cookie('token', token)
                res.redirect('/home')
            }
            else{
                res.send('Password error!')
            }
        })
    }
    else{
        res.send('user not found!')
    }
})
app.post('/seller', async(req,res)=>{
    let{bookname, isbn, edition} = req.body;
    let response =  await fetch(`https://www.googleapis.com/books/v1/volumes?q=${isbn}+isbn&maxResults=1`)
    let data = await response.json()
    let bookInfo = data.items[0];
    let retailPrice = bookInfo.saleInfo && bookInfo.saleInfo.retailPrice ? bookInfo.saleInfo.retailPrice.amount : 'N/A';
    let createdBook = await bookModel.create({
        bookname,
        isbn,
        edition,
        price: retailPrice
    })
    res.redirect('/home')
})
function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") {
        res.send("You Must Be Logged In");

    }
    else {
        let data = jwt.verify(req.cookies.token, "kunal");
        req.user = data;
        next();
    }
}


app.listen(3000)
