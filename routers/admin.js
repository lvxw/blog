var express = require('express')
var User = require('../models/Users')
var Category = require('../models/Categories')
var Content = require('../models/Contents')
var router = express.Router();

router.use(function (req, res, next) {
    //非管理员用户
    try {
        if (!req.userInfo.isAdmin) {
            res.send("不是管理员用户")
            return
        }
    } catch (e) {
        res.send("不是管理员用户")
        return
    }
    next()
})

/**
 * 首页
 */
router.get('/',function (req, res, next) {
    res.render('admin/index.html',{
        userInfo:req.userInfo
    })
})

/**
 * 用户管理
 */

router.get('/user',function (req, res, next) {
    var page = Number(req.query.page || 1)
    var limit = 4
    var pages = 0


    User.count().then(function (count) {
        pages = Math.ceil(count/limit)
        page  = Math.min(page,pages)
        page  = Math.max(1,page)
        var skip = (page-1)*limit
        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index.html',{
                userInfo:req.userInfo,
                users:users,
                page:page,
                count:count,
                pages:pages,
                limit:limit,
                flipUrl:'/admin/user'
            })
        })
    })
})

/**
 * 分类首页
 */

router.get('/category',function (req, res, next) {
    var page = Number(req.query.page || 1)
    var limit = 4
    var pages = 0


    Category.count().then(function (count) {
        pages = Math.ceil(count/limit)
        page  = Math.min(page,pages)
        page  = Math.max(1,page)
        var skip = (page-1)*limit
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category_index.html',{
                userInfo:req.userInfo,
                categories:categories,
                page:page,
                count:count,
                pages:pages,
                limit:limit,
                flipUrl:'/admin/category'
            })
        })
    })
})

/**
 * 添加分类
 */

router.get('/category/add',function (req, res, next) {
    res.render('admin/category_add.html',{
        userInfo:req.userInfo
    })
})

/**
 * 添加分类数据保存
 */

router.post('/category/add',function (req, res, next) {
    var name  = req.body.name || ""
    if(name === ""){
        res.render('admin/error.html',{
            userInfo:req.userInfo,
            message:'名称不能为空',
            url:'/admin/category/add'
        })
        return
    }
    Category.findOne({
        name:name
    }).then(function (result) {
        if(result){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'分类已经存在',
            })
            return Promise.reject()
        }else{
            return new Category({
                name:name
            }).save()
        }
    }).then(function (newCategory) {
        res.render('admin/success.html',{
            userInfo:req.userInfo,
            message:'保存分类成功',
            url:'/admin/category'
        })
    })
})

/**
 * 分类修改
 */
router.get('/category/edit',function (req, res, next) {
    var id = req.query.id || ""
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            })
        }else{
            res.render('admin/category_edit.html',{
                userInfo:req.userInfo,
                category:category
            })
        }
    })
})

/**
 * 分类修改提交
 */
router.post('/category/edit',function (req, res, next) {
    var id = req.query.id || ""
    var name = req.body.name || ""
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            })
        }else{
            //当用户没有做任何修改时
            if(name == category.name){
                res.render('admin/success.html',{
                    userInfo:req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                })
            }else{
                Category.findOne({
                    _id:{$ne:id},
                    name:name
                }).then(function (sameCategory) {
                    if (sameCategory){
                        res.render('admin/error.html',{
                            userInfo:req.userInfo,
                            message:'分类名称已经存在'
                        })
                    }else{
                        category.update({
                            _id:id,
                            name:name
                        }).then(function () {
                            res.render('admin/success.html',{
                                userInfo:req.userInfo,
                                message:'修改成功',
                                url:'/admin/category'
                            })
                        })
                    }
                })
            }
            //要修改的分类名称是否在数据库中已近存在
        }
    })
})


/**
 * 分类删除
 */
router.get('/category/delete',function (req, res, next) {
    var id = req.query.id || ""
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            })
        }else{
            Category.remove({
                _id:id
            }).then(function () {
                res.render('admin/success.html',{
                    userInfo:req.userInfo,
                    message:'删除分类成功',
                    url:'/admin/category'
                })
            })
        }
    })
})


/**
 * 内容首页
 */

router.get('/content',function (req, res, next) {
    var page = Number(req.query.page || 1)
    var limit = 4
    var pages = 0


    Content.count().then(function (count) {
        pages = Math.ceil(count/limit)
        page  = Math.min(page,pages)
        page  = Math.max(1,page)
        var skip = (page-1)*limit
        Content.find().populate('category').sort({_id:-1}).limit(limit).skip(skip).then(function (contents) {
            res.render('admin/content_index.html',{
                userInfo:req.userInfo,
                contents:contents,
                page:page,
                count:count,
                pages:pages,
                limit:limit,
                flipUrl:'/admin/content'
            })
        })
    })
})

/**
 * 添加内容
 */

router.get('/content/add',function (req, res, next) {
    Category.find().sort({_id:-1}).then(function (categories) {
        res.render('admin/content_add.html',{
            userInfo:req.userInfo,
            categories:categories
        })
    })
})

/**
 * 添加提交
 */

router.post('/content/add',function (req, res, next) {
    var category = req.body.category
    var title = req.body.title
    var description = req.body.description
    var contents = req.body.content

    if(category==""){
        res.render('admin/error.html',{
            userInfo:req.userInfo,
            message:"内容分类不能为空"
        })
        return
    }

    if(title==""){
        res.render('admin/error.html',{
            userInfo:req.userInfo,
            message:"标题不能为空"
        })
        return
    }

    Content.findOne({
        title:title
    }).then(function (content) {
        if(content){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:"文章标题已经使用"
            })
        }else{
            new Content({
                category:category,
                title:title,
                description:description,
                content:contents
            }).save().then(function () {
                res.render('admin/success.html',{
                    userInfo:req.userInfo,
                    message:"文章保存成功",
                    url:'/admin/content'
                })
            })
        }
    })
})


/**
 * 内容删除
 */
router.get('/content/delete',function (req, res, next) {
    var id = req.query.id || ""
    Content.findOne({
        _id:id
    }).then(function (content) {
        if(!content){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'内容不存在'
            })
        }else{
            Content.remove({
                _id:id
            }).then(function () {
                res.render('admin/success.html',{
                    userInfo:req.userInfo,
                    message:'删除内容成功',
                    url:'/admin/content'
                })
            })
        }
    })
})

/**
 * 内容编辑
 */
router.get('/content/edit',function (req, res, next) {
    var id = req.query.id || ""
    Content.findOne({
        _id:id
    }).then(function (content) {
        if(!content){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'内容不存在'
            })
        }else{
            Category.find().sort({_id:-1}).then(function (categories) {
                console.log(categories)
                console.log(content)
                res.render('admin/content_edit.html',{
                    userInfo:req.userInfo,
                    content:content,
                    categories:categories
                })
            })
        }
    })
})




module.exports = router