const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    fs.readdir(`./files`, (err, files) => {
        res.render("index", { files: files });
    })

})
app.post('/create', (req, res) => {
    fs.writeFile(`./files/${req.body.heading.split(' ').join('')}.txt`, req.body.details, (err)=>{
        res.redirect('/');
    })
});

app.get('/files/:filename',(req,res)=>{
    fs.readFile(`./files/${req.params.filename}`,"utf-8", (err, data)=>{
        res.render("readMore", {filename:req.params.filename, data:data})
    })
})

app.get('/rename/:filename',(req,res)=>{
    res.render("rename",{filename:req.params.filename});
})

app.post('/rename', (req,res)=>{
    fs.rename(`./files/${req.body.old}`, `./files/${req.body.new}`,function(err){
        res.redirect('/');
    });
    
})


app.listen(3000);