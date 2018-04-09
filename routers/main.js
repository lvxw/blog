var express = require('express')
var Category = require('../models/Categories')
var Content = require('../models/Contents')
var router = express.Router();

/**
 * 首页
 */
router.get('/',function (req,res,next) {
    var page = Number(req.query.page || 1)
    var limit = 2
    var pages = 0
    var category = req.query.category || ""
    var where = {}
    if(category){
        where.category = category
    }


    Content.where(where).count().then(function (count) {
        pages = Math.ceil(count/limit)
        page  = Math.min(page,pages)
        page  = Math.max(1,page)
        var skip = (page-1)*limit
        Content.where(where).find().populate(['category','user']).sort({addTime:-1}).limit(limit).skip(skip).then(function (contents) {
            Category.find().sort({_id:-1}).then(function (categories) {
                res.render('main/index.html',{
                    categories:categories,
                    category:category,
                    userInfo:req.userInfo,
                    contents:contents,
                    page:page,
                    count:count,
                    pages:pages,
                    limit:limit,
                })
            })
        })
    })
})

/**
 * 首页显示内容
 */
router.get('/view',function (req,res,next) {
    var page = Number(req.query.page || 1)
    var contentId = req.query.contentId || ""
    var limit = 2
    var pages = 0
    var category = req.query.category || ""
    var where = {}
    if(category){
        where.category = category
    }


    Content.where(where).count().then(function (count) {
        pages = Math.ceil(count/limit)
        page  = Math.min(page,pages)
        page  = Math.max(1,page)
        var skip = (page-1)*limit
        Content.where(where).find().populate(['category','user']).sort({addTime:-1}).limit(limit).skip(skip).then(function (contents) {
            Category.find().sort({_id:-1}).then(function (categories) {
                for(var i =0;i<contents.length;i++){
                    if(contents[i]._id == contentId){
                        contents[i].views+=1;
                        contents[i].save()
                        break;
                    }
                }
                res.render('main/view.html',{
                    contentId:contentId,
                    categories:categories,
                    category:category,
                    userInfo:req.userInfo,
                    contents:contents,
                    page:page,
                    count:count,
                    pages:pages,
                    limit:limit,
                })
            })
        })
    })
})

module.exports = router