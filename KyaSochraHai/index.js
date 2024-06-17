const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./models/users');
const postModel = require('./models/post');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());


app.set("view engine", "ejs")


app.get('/', (req, res) => {
    res.render("login");
})
app.get('/signup', (req, res) => {
    res.render("signup")
})
app.get('/profile', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate('posts');
    res.render('profile', { user });
})
app.get('/allPosts', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    let users = await userModel.find().populate('posts');
    res.render("allposts", { user, users })
})
app.get("/signout", async (req, res) => {
    res.cookie("token", "");
    res.redirect('/')
})
app.get("/like/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate('user');
    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();
    res.redirect('/allPosts');

})


app.post("/signup", async (req, res) => {
    let { username, image, email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (user) {
        return res.status(500).send("Error 505 : User Already Registered !")
    }
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                username,
                image,
                email,
                password: hash
            })
            let token = jwt.sign({ email }, "kunal");
            res.cookie("token", token);
            res.redirect('/profile');
        })
    })
})

app.post('/login', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        res.send("<h1> Something Went Wrong! </h1>")
    }
    else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                let token = jwt.sign({ email: req.body.email, userid: user._id }, "kunal");
                res.cookie("token", token)
                res.redirect('/profile');
            }
            else {
                res.redirect('/')
            }
        })
    }
})
app.post('/post', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    let { content } = req.body;
    let post = await postModel.create({
        user: user._id,
        content
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
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


app.listen(3000);