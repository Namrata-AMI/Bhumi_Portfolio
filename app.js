const express = require("express");
const app = express();
const path = require("path");


app.use(express.static('public'));


app.get("/",(req,res)=>{
    res.render("index.ejs");
})

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
})