//封装的是数据库的连接
var mongodb=require('mongodb'),
    setting=require('../setting')  ; //得到数据库的相关配置信息
var Db=mongodb.Db;
var connection=mongodb.Connection;
var Server=mongodb.Server;
//新建的连接参数为    连接的数据库   服务器
module.exports=new Db(setting.db,new Server(setting.host,setting.port),{safe:true});
//将这个连接暴露供其它的文件使用

