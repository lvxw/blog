var express = require('express')
var Category = require('../models/Categories')
var router = express.Router();

router.get('/',function (req,res,next) {
    Category.find().then(function (categories) {
        res.render('main/index.html',{
            userInfo:req.userInfo,
            categories:categories
        })
    })
})

module.exports = router