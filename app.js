/**
 *
 * 应用程序的入口文件
 *
 */

// 加载express模块
var express = require('express')
// 加载swig模板
var swig = require('swig')
// 加载数据库模块
var mongoose = require('mongoose')
// 加载body-parser
var bodyparser = require('body-parser')

// 创建app应用 => NodeJs.Http.createServer
var app = express()

// 定义模板引擎
app.engine('html',swig.renderFile)
// 配置模板引擎的存放目录
app.set('views','./views')
// 注册模板引擎
app.set('view engine','html')
// 设置静态文件托管
app.use('/public',express.static(__dirname+'/public'))
// 开发过程中，取消模板的缓存功能
swig.setDefaults({cache:false})

app.use(bodyparser.urlencoded({extended:true}))

app.use('/admin',require('./routers/admin'))
app.use('/api',require('./routers/api'))
app.use('/',require('./routers/main'))


mongoose.connect('mongodb://localhost:27018/blog',function (err) {
    if(err){
        console.log("数据库连接失败")
    }else{
        console.log("数据库连接成功")
        //监听http
        app.listen(8081)
    }

})



