var mongo=require('./db');
var crypto=require('crypto');
function User(user) {
    this.name=user.name;
    this.password=user.password;
    this.email=user.email;
}
module.exports=User;
//将用户的信息存储到数据库中
User.prototype.save=function (callback) {
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        //这必须是正确的网址，否则的话，就得不到这个头像
        head = "http://cn.gravatar.com/avatar" + email_MD5 + "?s=48";
    var user={
        name:this.name,
        password:this.password,
        email:this.email,
        head:head
    }
    console.log(head);
    mongo.open(function (error,db) {
        //连接数据库发生错误
        if(error){
           return callback(error);
        }
        db.collection('users',function (err,collection) {
            //读取数据库里边的集合发生错误
            if(err){
                //首先应该关闭数据库
                mongo.close();
                return callback(err);
            }
            //插入数据的时候发生错误
            collection.insert(user,{safe:true},function (err,user) {
                mongo.close();
                if(err){
                      return callback(err);
                  }
                 callback(null,user[0]);   //存储成功  返回的是存储后的文档
            })
        })
    })
}
//读取给定名字来读取用户
User.get=function (name,callback) {
    mongo.open(function (error,db) {
         if(error){
             return callback(error+"asa1");
         }
        //这里查找的是一个字符串的集合
         db.collection('users',function(error,collection){
             if(error){
                 mongo.close();
                 return callback(error+"asa2");
             }
             //注意的是这在查找的时候  传入的参数必须是一个json的格式的数据
             collection.findOne({name:name},function (error,user) {
                 mongo.close();
                   if(error){

                       return callback(error+"asa3");
                   }
                   callback(null,user);
             })
         })
    })
}
