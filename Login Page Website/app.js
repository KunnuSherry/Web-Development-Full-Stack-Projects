const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());


app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("index")
})

app.get("/read", async (req, res) => {
    let users = await userModel.find();
    res.render('read', { users: users });
});

app.get('/prac', (req, res) => {
    res.render('readself');
})
app.get("/read/:id", async (req, res) => {
    let user = await userModel.findOne({ _id: req.params.id });
    res.render("readself", { user: user });
})
app.get("/logout", (req, res) => {
    res.render('logout');
})
app.get("/login", (req, res) => {
    res.render('login');
})
app.get("/delete/:id", async (req, res) => {
    let user = await userModel.findOne({_id: req.params.id });
    res.render("delete",{user: user} );
});

app.get("/edit/:id", async (req, res) => {
    let user = await userModel.findOne({_id: req.params.id });
    res.render("edit",{user: user} );
});


app.post("/create", (req, res) => {
    let { username, email, password, age, image } = req.body;
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                username,
                email,
                password: hash,
                age,
                image
            })
            let token = jwt.sign({ email }, "kunal");
            res.cookie("token", token)
            res.redirect(`/read/${createdUser._id}`)
        })
    })
})

app.post('/logout', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        res.send("<h1> Something Went Wrong! </h1>")
        res.redirect('/logout');
    }
    else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                res.cookie("token", "")
                res.redirect("/");
            }
            else {
                res.send("<h1> Something Went Wrong! </h1>")
            }
        })
    }
})

app.post('/delete/:id', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        res.send("<h1> Something Went Wrong! </h1>")
    }
    else {
        bcrypt.compare(req.body.password, user.password, async (err, result) => {
            if (result) {
                await userModel.findOneAndDelete({_id: req.params.id});
                res.cookie("token", "");
                res.redirect('/');
            }
            else {
                res.send("<h1> Something Went Wrong! </h1>")
            }
        })
    }
})

app.post('/login', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        res.send("<h1> Something Went Wrong! </h1>")
    }
    else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                let token = jwt.sign({ email : req.body.email }, "kunal");
                res.cookie("token", token)
                res.redirect(`/read/${user._id}`)
            }
            else {
                res.send("<h1> Something Went Wrong! </h1>")
            }
        })
    }
})

app.post('/edit/:id', async (req,res)=>{
    let user = await userModel.findOne({_id:req.params.id});
    let {username, email, age, image} = req.body;
    let upUser = await userModel.findOneAndUpdate({_id : req.params.id},{username, email, password:user.password, image}, {new:true});
    res.redirect(`/read/${user._id}`);
})



app.listen(3000);
