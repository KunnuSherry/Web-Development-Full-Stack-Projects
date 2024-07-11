const express = require('express');
const app = express();
const bcrypt = require('bcrypt')
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const randomString = require('randomstring')
require('dotenv').config();

const userModel = require('./models/userModel')
const adminModel = require('./models/adminModel')
const pizzaModel = require('./models/pizzaModel')
const sendVerificationEmail = require('./utilities/OTPVerify')
const sendForgetPasswordMail = require('./utilities/forgetPassword')

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set('view engine', "ejs");

app.get('/userLogin', (req,res)=>{
    res.render('userLogin')
})
app.get('/userSignup', (req,res)=>{
    res.render('userSignup')
})
app.get('/adminSignup', (req,res)=>{
    res.render('adminSignup')
})
app.get('/adminLogin', (req,res)=>{
    res.render('adminLogin')
})
app.get('/verifyOTP',isLoggedIn, (req,res)=>{
    res.render('otp')
})
app.get('/adminVerifyOTP',isLoggedIn, (req,res)=>{
    res.render('adminOTP')
})
app.get('/forgetPassword', (req,res)=>{
    res.render('forgetPassword')
})
app.get('/changePassword', (req,res)=>{
    res.render('changePassword')
})
app.get('/changePassword', (req,res)=>{
    res.render('changePassword')
})
app.get('/adminForgetPassword', (req,res)=>{
    res.render('adminForgetPassword')
})
app.get('/userDashboard',isLoggedIn, async(req,res)=>{
    let user = await userModel.findOne({email: req.user.email})
    res.render('userDashboard',{user})
})
app.get('/customPizza', async(req,res)=>{
    let admins = await adminModel.find()    
    res.render('customPizza',{admins})
})
app.get('/orderStatus/:id', async(req,res)=>{
    let order = await pizzaModel.findOne({_id: req.params.id})
    res.render('orderstatus',{order})
})
app.get('/userOrders', async(req,res)=>{
     try {
        let data = jwt.verify(req.cookies.token, "kunal");
        let user = await userModel.findOne({ email: data.email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        let orders = await pizzaModel.find({ user: user._id }).populate('admin');
        res.render('userOrders', { user, orders });
    } catch (error) {
        console.error("Error fetching admin orders:", error.message);
        res.status(500).send("Server error");
    }
})
app.get('/adminDashboard/:id', async(req,res)=>{
    let order = await pizzaModel.findOne({_id: req.params.id}).populate('user');
    res.render('adminDashboard',{order})
})
app.get('/adminorders', isLoggedInAdmin, async(req, res) => {
    try {
        let data = jwt.verify(req.cookies.token, "kunal");
        let admin = await adminModel.findOne({ adminemail: data.adminemail });

        if (!admin) {
            return res.status(404).send("Admin not found");
        }

        let orders = await pizzaModel.find({ admin: admin._id }).populate('user');
        res.render('adminorders', { admin, orders });
    } catch (error) {
        console.error("Error fetching admin orders:", error.message);
        res.status(500).send("Server error");
    }
});
app.get('/getOrderStatus/:id', async (req, res) => {
    try {
        let order = await pizzaModel.findOne({ _id: req.params.id });
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.send(order);
    } catch (err) {
        console.error('Error fetching order status:', err);
        res.status(500).send('Server Error');
    }
});


app.post('/userSignup', async(req,res)=>{
    try{
        let{username, email, password} = req.body;
    let user = await userModel.findOne({email});
    if(user){
        res.send('User Already Exsists...');
    }
    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(password, salt, async(err,hash)=>{
            let createdUser = await userModel.create({
                username,
                email,
                password: hash
            })
            const OTP = genOTP();
            sendVerificationEmail(email, OTP);
            let token = jwt.sign({email, OTP:OTP}, 'kunal')
            res.cookie('token', token);
            res.redirect('/verifyOTP')
        })
    })
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})
app.post('/updateStatus/:id', async(req,res)=>{
    let order = await pizzaModel.findOne({_id: req.params.id});
    await pizzaModel.findOneAndUpdate({_id: req.params.id},{status: req.body.orderstatus}) 
    res.redirect(`/adminDashboard/${order._id}`)   
})
app.post('/verifyOTP', async (req, res) => {
    try {
        let data = jwt.verify(req.cookies.token, 'kunal');
        let user = await userModel.findOne({ email: data.email });
        if (data.OTP === req.body.OTP) {
            user.isVerified = true;
            await user.save();
            return res.redirect('/userDashboard');
        }
        res.send("Invalid OTP");
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        res.status(401).send("User not verified");
    }
});
app.post('/userLogin', async(req, res)=>{
    let user = await userModel.findOne({email: req.body.email});
    if(!user){
        res.send("User Doesnot Exsists...")
    }
    else{
        bcrypt.compare(req.body.password, user.password, (err,result)=>{
            if(result){
                let token = jwt.sign({email:user.email, user_id: user._id}, 'kunal')
                res.cookie('token', token)
                res.redirect('/userDashboard')
            }
            else{
                res.redirect('/userLogin')
            }
        })
    }
})
app.post('/forgetPassword', async(req,res)=>{
    let user = await userModel.findOne({email: req.body.email})
    if(user){
         sendForgetPasswordMail(user.email)
         res.send("Email Sent Successfully...")
    }
})
app.post('/adminForgetPassword', async(req,res)=>{
    let admin = await adminModel.findOne({adminemail: req.body.email})
    if(admin){
         sendForgetPasswordMail(req.body.email)
         res.send("Email Sent Successfully...")
    }
})
app.post('/changePassword', async(req,res)=>{
    let user = await userModel.findOne({email: req.body.email})
    if(user){
        bcrypt.genSalt(10, (err,salt)=>{
            bcrypt.hash(req.body.password, salt, async(err,hash)=>{
                await userModel.findOneAndUpdate({email: req.body.email}, {password: hash})
                user.save();
            })
        })
        res.redirect('/userLogin')
    }
    let admin = await adminModel.findOne({adminemail: req.body.email})
    if(admin){
        bcrypt.genSalt(10, (err,salt)=>{
            bcrypt.hash(req.body.password, salt, async(err,hash)=>{
                await adminModel.findOneAndUpdate({adminemail: req.body.email}, {adminpassword: hash})
                admin.save();
            })
        })
        res.redirect('/adminLogin')
    }
    
})
app.post('/adminSignup', async(req,res)=>{
    try{
        let{adminusername, adminemail, adminpassword} = req.body;
    let admin = await adminModel.findOne({adminemail});
    if(admin){
        res.send('Admin Already Exsists...');
    }
    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(adminpassword, salt, async(err,hash)=>{
            let createdadmin = await adminModel.create({
                adminusername,
                adminemail,
                adminpassword: hash
            })
            let token = jwt.sign({ adminemail }, "kunal");
            res.cookie("token", token);
            res.redirect('/adminorders')
        })
    })
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})
app.post('/adminVerifyOTP', async(req,res)=>{
    let data = jwt.verify(req.cookies.token, 'kunal')
    let admin = await adminModel.findOne({adminemail : data.email})
    if(data.OTP === req.body.OTP){
        admin.isadminverified = true ;
        await admin.save();
        res.send("done!")
    }
    res.send("user not verified")
})
function genOTP(){
    return randomString.generate({length:4, charset: 'numeric'});
}
app.post('/adminLogin', async(req, res)=>{
    let admin = await adminModel.findOne({adminemail: req.body.adminemail});
    if(!admin){
        res.send("Admin Doesnot Exsists...")
    }
    else{
        bcrypt.compare(req.body.adminpassword, admin.adminpassword, (err,result)=>{
            if(result){
                let token = jwt.sign({adminemail:admin.adminemail, admin_id: admin._id}, 'kunal')
                res.cookie('token', token)
                res.redirect('/adminorders')
            }
            else{
                res.redirect('/adminLogin')
            }
        })
    }
})
app.post('/customPizza',isLoggedIn, async(req,res)=>{
    const baseCosts = {
        ClassicThinCrust: 560,
        Neapolitan: 630,
        TraditionalPan: 490,
        Sicilian: 700,
        NewYorkStyle: 595
      };
      const sauceCosts = {
        TomatoSauce: 50,
        GarlicParmesanSauce: 60,
        BarbecueSauce: 55,
        PestoSauce: 65,
        AlfredoSauce: 70
      };
      const cheeseCosts = {
        Mozzarella: 80,
        Cheddar: 90,
        Parmesan: 85,
        Gouda: 95
      };
      const veggieCosts = {
        tomato: 10,
        onion: 15,
        "bell-pepper": 12,
        mushroom: 20,
        olive: 18
      };
    const baseCost = baseCosts[req.body.base] || 0;
    const sauceCost = sauceCosts[req.body.sauce] || 0;
    const cheeseCost = cheeseCosts[req.body.cheese] || 0;
    let veggiesCost = 0;

    if (Array.isArray(req.body.veggies)) {
      for (const veggie of req.body.veggies) {
        veggiesCost += veggieCosts[veggie] || 0;
      }
    } else {
      veggiesCost = veggieCosts[req.body.veggies] || 0;
    }

    const totalCost = baseCost + sauceCost + cheeseCost + veggiesCost;
    let admin = await adminModel.findOne({adminusername: req.body.admin})
    let user  = await userModel.findOne({email: req.user.email})
    let pizza = await pizzaModel.create({
        base: req.body.base,
        sauce: req.body.sauce,
        cheese: req.body.cheese,
        veggies: req.body.veggies,
        cost: totalCost,
        admin: admin._id,
        user: user._id        
    })
    res.send("done!")

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
function isLoggedInAdmin(req, res, next) {
    if (req.cookies.token === "") {
        res.send("You Must Be Logged In");

    }
    else {
        let data = jwt.verify(req.cookies.token, "kunal");
        req.admin = data;
        next();
    }
}

app.listen(3000);

