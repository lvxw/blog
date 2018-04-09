var express = require('express')
var User = require('../models/Users')
var Content = require('../models/Contents')
var router = express.Router();

var responseData;

router.use(function (req,res,next) {
    responseData={
        code:0,
        message:''
    }
    next()
})

/**
 *用户注册
 * 1.用户名不能为空
 * 2.密码不能为空
 * 3.两次密码一致
 * 4.密码是否存在
 */
router.post('/user/register',function (req,res,next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    if(username === ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    if(password === ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }

    User.findOne({
        username:username
    }).then(function (userInfo) {
       if(userInfo){
           responseData.code=4;
           responseData.message='用户名已经被注册'
           res.json(responseData)
       }
       var user = new User({
           username:username,
           password:password,
       })
        return user.save()
    }).then(function (newuserInfo) {
        responseData.message="注册成功";
        res.json(responseData);
    })
})


/**
 * 用户登录
 */
router.post('/user/login',function (req,res,next) {
    var username = req.body.username;
    var password = req.body.password;
    if(username === '' || password === ''){
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return;
    }
    User.findOne({
        username:username,
        password:password
    }).then(function (userInfo) {
       if(!userInfo){
           responseData.code=2;
           responseData.message='用户名或密码错误'
           res.json(responseData)
           return
       }
        responseData.message="登录成功";
        responseData.userInfo={
            _id:userInfo._id,
            username:userInfo.username
        }
        req.cookies.set('userInfo',JSON.stringify({
            _id:userInfo._id,
            username:userInfo.username
        }))
        res.json(responseData);
    })
})

router.get('/user/logout',function (req, res) {
    req.cookies.set('userInfo',null)
    res.json(responseData);
})

/**
 * 获取指定文章的所有评论
 */
router.get('/comment/get',function (req, res) {
    var contentId = req.query.contentId || ""
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        responseData.message="获取评论成功"
        responseData.data = content
        res.json(responseData)
    })
})

/**
 * 评论提交
 */
router.post('/comment/post',function (req, res) {
    var contentId = req.body.contentId || ""
    var postData = {
        username:req.userInfo.username,
        postTime:new Date(),
        content:req.body.content,
    }
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        content.comments.push(postData)
        return content.save()
    }).then(function (newContent) {
        responseData.message="评论成功"
        responseData.data = newContent
        res.json(responseData)
    })
})

module.exports = router