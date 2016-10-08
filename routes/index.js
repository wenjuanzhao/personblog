
/*
 * GET home page.
 */
var User=require('../models/user.js');
var Mail=require('../models/Mail.js');
var crypto=require('crypto');
var Post=require('../models/post.js');
module.exports=function(app){
  app.get('/',function (req,res) {
      Post.get(null,function (error,posts) {
          if(error){
              posts=[];
          }
          res.render('index',{
              title:"主页",
              user:req.session.user,
              posts:posts,
              success:req.flash("success").toString(),
              error:req.flash("error").toString()
          })
      })
  });
    app.get('/register',checkNotLogin);
  app.get('/register',function (req,res) {
    res.render('reg',{
      title: '注册',
      succes:req.flash('succes').toString(),
      error:req.flash('error').toString()
    })
  });
    app.post('/register',checkNotLogin);
  app.post('/register',function (req,res) {
    var name=req.body.name;
    var password=req.body.password;
    var email=req.body.email;
    var mail=new Mail(email);
    var md5=crypto.createHash("md5");
    password=md5.update(password).digest("hex");
      var newUser=new User({
        name:name,
        password:password,
        emial:email
      })
    User.get(newUser.name,function(error,user){
         if(error){
             req.flash("error",error);
           return res.redirect('/');
         }
       if(user){
           req.flash("error","用户已经存在");
           return res.redirect('/register');
       }
      newUser.save(function(error,user){
               if(error){
                 req.flash("error",error);
                 return res.redirect('/register');
               }
           req.session.user=newUser;
           req.flash("success","用户注册成功");
           res.redirect("/");
         })
     })

  });
    //检测数据库中是否已经有这个用户名
    app.post('/checkuser',function (req,res) {
        var name=req.body.name;
        User.get(name,function (error,user) {
              if(error){
                 res.send(500,error);
              }
            if(user){
                res.send({user_state:1});
            }else{
                res.send({user_state:0});

            }

        })
    });
    app.get('/login',checkNotLogin)
  app.get('/login',function (req,res) {
    res.render('login',{
      title: '登录',
        user:req.session.user,
        success:req.flash("success").toString(),
        error:req.flash("error").toString()
    })
  });
    app.post('/login',checkNotLogin)
  app.post('/login',function (req,res) {
       var md5=crypto.createHash('md5');
      var password=md5.update(req.body.password).digest("hex");
      User.get(req.body.name,function (error,user) {
          //没有检测到这个用户名
           if(!user){
                 req.flash('error',1);   //用户名不存在
                 return res.redirect("/login");
           }
          //密码不匹配
          if(password!=user.password){
              req.flash("error",2);   //输入的密码不正确
              return res.redirect("/login");
          }
          req.session.user=user;
          req.flash("success","登录成功");
          res.redirect("/")
      })
  });
    app.get('/post',checkLogin);
  app.get('/post',function (req,res) {
      res.render('post',{
          title: '发表文章',
          user:req.session.user,
          success:req.flash("success").toString(),
          error:req.flash("error").toString()
      })
  });
    app.post('/post',checkLogin);
    app.post('/post',function (req,res) {
         var curentUser=req.session.user;
         var post=new Post(curentUser.name,req.body.title,req.body.post);
         post.save(function (error) {
              if(error){
                  req.flash("error","发表文章失败");
                  return res.redirect('/')
              }
              req.flash("success","发表成功");
             return res.redirect('/');
         })
    });
    app.get('/login',checkLogin)
    app.get('/logout',function (req,res) {
        //清除了session中user旧相当于退出
        req.session.user=null;
        req.flash("success","退出成功");
        res.redirect("/");
    })
    app.get('/test',function (req,res) {
         res.render('test')
    })
}
//实现页面的权限控制
function checkLogin(req,res,next) {
    if(!req.session.user){
        req.flash("error","您还未登录");
        return res.redirect('/login');
    }
    next();
}
function checkNotLogin(req,res,next) {
    if(req.session.user){
        req.flash("error","您已经登录");
        return res.redirect('back');
    }
    next();
}