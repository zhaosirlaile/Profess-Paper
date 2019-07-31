/**
 * 路由文件：
 *      主要负责路由的映射
 *      并且调用相关路由的模块功能
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const model = require('./model');
const router = express();




router.get('/',function(req,res){
    fs.readFile(path.join(__dirname,'/views/index.html'),function(err,data){
        if (err) throw err;
        res.send(data.toString());
    })
})
router.post('/loginIn',function(req,res){
    model.login(req,res);
})
router.post('/loginRegister',function(req,res){
    model.register(req,res);
})
router.post('/loginRegisterSendEmail',function(req,res){
    model.sendmail(req,res);
})
router.post('/sendbook',function(req,res){
    model.sendbook(req,res);
})
router.get('/getPartItemList',function(req,res){
    model.getPartItemList(req,res);
})
router.get('/getPartItemListHot',function(req,res){
    model.getPartItemListHot(req,res);
})
router.get('/up',function(req,res){
    model.up(req,res);
})
router.get('/userIsUp',function(req,res){
    model.userIsUp(req,res);
})
router.get('/sendComment',function(req,res){
    model.sendComment(req,res);
})
router.get('/getAllComment',function(req,res){
    model.getAllComment(req,res);
})
router.get('/updateDiscussdBrowse',function(req,res){
    model.updateDiscussdBrowse(req,res);
})
router.get('/alterUser',function(req,res){
    model.alterUser(req,res);
})
router.get('/getUser',function(req,res){
    model.getUser(req,res);
})
router.get('/getUserConfessionManage',function(req,res){
    model.getUserConfessionManage(req,res);
})
router.get('/deleteConfession',function(req,res){
    model.deleteConfession(req,res);
})
module.exports = router;