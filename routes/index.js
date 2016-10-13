
/*
 * GET home page.
 */
var User=require('../models/user.js');
var Mail=require('../models/Mail.js');
//密码变为MD5的格式
var crypto=require('crypto');
var path=require('path');
//文件的上传使用到的模块
var multer=require('multer');
//发布文章
var Post=require('../models/post.js');
//对文章进行留言
var Comment=require('../models/comment.js');
//设置文件上传到的位置
var storage=multer.diskStorage({
      destination:function (req,file,cb) {
          cb(null,'./public/images');
      },
    fileName:function (req,file,cb) {
        cb(null,file.originalname);
    }
})
var upload=multer({storage:storage});
module.exports=function(app){
    //用于实验的页面
    app.get('/test',function (req,res) {
         res.render('test',{title:'cscs'})
    })
  app.get('/',function (req,res) {
      var page=parseInt(req.query.p)||1;
      Post.getTen(null,page,function (error,posts,total) {
          if(error){
              posts=[];
          }
          res.render('index',{
              title:"主页",
              user:req.session.user,
              page:page,
              isFirstPage:(page-1)==0,
              isLastPage:(page-1)*5+posts.length==total,
              posts:posts,
              success:req.flash("success").toString(),
              error:req.flash("error").toString()
          });
      });
  });
    //注册的功能
    app.get('/register',checkNotLogin);
  app.get('/register',function (req,res) {
      console.log(1111);
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
    var md5=crypto.createHash("md5");
    password=md5.update(password).digest("hex");
      var newUser=new User({
        name:name,
        password:password,
        email:email
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
    //登录的功能
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
    //发布文章的功能
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
        var tags=[req.body.tag1,req.body.tag2,req.body.tag3];
         var post=new Post(curentUser.name,req.body.title,req.body.post,tags,curentUser.head);
         post.save(function (error) {
              if(error){
                  req.flash("error","发表文章失败");
                  return res.redirect('/')
              }
              req.flash("success","发表成功");
             return res.redirect('/');
         })
    });
    //退出的功能
    app.get('/login',checkLogin)
    app.get('/logout',function (req,res) {
        //清除了session中user旧相当于退出
        req.session.user=null;
        req.flash("success","退出成功");
        res.redirect("/");
    })
    //上传文件
    app.get('/upload',checkLogin);
    app.get('/upload',function (req,res) {
        res.render('upload',{
            title:"主页",
            user:req.session.user,
            success:req.flash("success").toString(),
            error:req.flash("error").toString()
        });
    })
    app.post('/upload',checkLogin);
    app.post('/upload',upload.array('field',5),function (req,res) {
        req.flash("success","上传成功");
        res.redirect("/upload");
    });
    //点击作者的名字的时候，显示的是用用户的页面，跳转到只显示这个用户文章的页面
    app.get('/u/:name',checkLogin);
    app.get('/u/:name',function (req,res) {
        var page=parseInt(req.query.p)||1;
          User.get(req.params.name,function (error,user) {
               if(!user){
                   req.flash("error","用户不存在");
               }
               Post.getTen(req.params.name,page,function (error,posts,total) {
                   if(error){
                       req.flash("error",error);
                       return res.redirect("/");
                   }
                   res.render('user',{
                       title:user.name,
                       user:req.session.user,
                       page:page,
                       isFirstPage:(page-1)==0,
                       isLastPage:(page-1)*5+posts.length==total,
                       posts:posts,
                       success:req.flash("success").toString(),
                       error:req.flash("error").toString()
                   });
               })
          })
    })
    //点击文章的题目的时候显示的一片文章
    app.get("/u/:name/:day/:title",function (req,res) {
         Post.getOne(req.params.name,req.params.day,req.params.title,function (error,post) {
             if(error){
                 req.flash("error",error);
                 return res.redirect("/");
             }
             res.render("article",{
                 title:req.params.title,
                 user:req.session.user,
                 post:post,
                 success:req.flash("success").toString(),
                 error:req.flash("error").toString()
             })
         })
    })
    //点击文章页面的编辑的按钮的时候，跳转到编辑的页面  编辑的页面需要得到的是原来的文章
    app.get('/edit/:name/:day/:title',checkLogin);
    app.get('/edit/:name/:day/:title',function(req,res){
        Post.edit(req.params.name,req.params.day,req.params.title,function (error,doc) {
            if(error){
                req.flash("error",error);
                return res.redirect('back')
            }
            res.render('edit',{
                title:req.params.title,
                user:req.session.user,
                post:doc,
                success:req.flash("success").toString(),
                error:req.flash("error").toString()
            })
        })
    });
    //点击保存修改的时候，实现的是更新数据库里边的文章
    app.post('/edit/:name/:day/:title',checkLogin);
    app.post('/edit/:name/:day/:title',function(req,res){
        Post.update(req.params.name,req.params.day,req.params.title,req.body.post,function (error) {
              if(error){
                  req.flash("error",error);
                 return  res.redirect("/");
              }
             req.flash("success","修改成功");
            res.redirect("/");
          })
    });
    //点击删除的时候，实现的是删除文章
    app.get('/delete/:name/:day/:title',checkLogin);
    app.get('/delete/:name/:day/:title',function (req,res) {
         var currentUser=req.session.user;
         Post.delete(currentUser.name,req.params.day,req.params.title,function (error) {
              if(error){
                  req.flash("error",error);
                  return res.redirect(back);
              }
             req.flash("success","删除成功");
             return res.redirect('/')
         })
    })
    //点击留言按钮以后
    app.post('/u/:name/:day/:title',function (req,res) {
        var date=new Date();
        var time={
            date: date,
            year : date.getFullYear(),
            month : date.getFullYear() + "-" + (date.getMonth() + 1),
            day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        }
        var md5 = crypto.createHash('md5'),
            email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
            head = "http://cn.gravatar.com/avatar" + email_MD5 + "?s=48";
        var comment={
            name:req.body.name,
            email:req.body.email,
            website:req.body.website,
            time:time,
            head:head,
            content:req.body.content
        }
          var newComment=new Comment(req.params.name,req.params.day,req.params.title,comment);
        newComment.save(function (error) {
             if(error){
                  req.flash("error",error);
                 return res.redirect('back');
             }
              req.flash("success","留言成功");
            return res.redirect('back')
        })
    })
    //增加存档页面，这个页面只显示作者姓名、发布时间、文章的题目
    app.get('/archive',function (req,res) {
         Post.getArchive(function (error,posts) {
             if(error){
                 req.flash("error",error);
                 return res.redirect("/");
             }
             res.render('archive',{
                 title:"存档",
                 posts:posts,
                 user:req.session.user,
                 success:req.flash("success").toString(),
                 error:req.flash("error").toString()
             })
         })
    })
    //点击标签的时候，跳转到的是含有这个标签的左右文章
    app.get('/tag/:tag',function (req,res) {
         Post.getDocByTag(req.params.tag,function (error,docs) {
              if(error){
                  req.flash("error",error);
                  return res.redirect('/')
              }
             res.render('tag',{
                 title:'标签:'+req.params.tag,
                 posts:docs,
                 user:req.session.user,
                 success:req.flash("success").toString(),
                 error:req.flash("error").toString()
             })
         })
    })
    //在头部的搜索框里边，搜索文章
    app.post('/search',function (req,res) {
         Post.search(req.body.key,function (error,docs) {
              if(error){
                  req.flash("error",error);
                  return res.redirect('/');
              }

             res.render('search',{
                 title:"搜索",
                 posts:docs,
                 user:req.session.user,
                 success:req.flash("success").toString(),
                 error:req.flash("error").toString()
             })
         })
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