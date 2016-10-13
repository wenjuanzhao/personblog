var mongo=require('./db');
var markdown=require('markdown').markdown;
function Post(name,title,post,tags,head) {
     this.name=name;
     this.title=title;
     this.post=post;
    this.tags=tags;
    this.head=head;
}
module.exports=Post;
Post.prototype.save=function (callback) {
      var date=new Date();
      var time={
          date: date,
          year : date.getFullYear(),
          month : date.getFullYear() + "-" + (date.getMonth() + 1),
          day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
          minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
      }
    var post={
        time:time,
        name:this.name,
        title:this.title,
        post:this.post,
        comments:[],
        tags:this.tags,
        pv:0,
        head:this.head
    }
    mongo.open(function (error,db) {
          if(error){
             return  callback(error);
          }
        db.collection('posts',function (error,collections) {
            if(error){
                mongo.close();
                return callback(error);
            }
            collections.insert(post,{safe:true},function (error,post) {
                mongo.close();
                  if(error){

                      return callback(error)
                  }
                  callback(null);
            })
        })
    })
}
//传入用户名字或者不传的时候，返回所有的文章
Post.getTen=function (name,page,callback) {
     mongo.open(function (error,db) {
         if(error){
             return callback(error);
         }
         db.collection('posts',function (error,collection) {
              if(error){
                  mongo.close();
                  return callback(error);
              }
             var query={};
             //得考虑没有传入name的情况
             if(name){
                 query.name=name;
             }
             collection.count(query,function (error,total) {
                  if(error){
                      mongo.close()
                      return callback(error);
                  }
                 collection.find(query,{skip:(page-1)*5,limit:5}).sort({time:-1}).toArray(function (error,docs) {
                     mongo.close();
                     if(error){
                         return callback(error)
                     }
                     //将返回的文章转换为markdown格式
                     docs.forEach(function (doc) {
                          docs.post=markdown.toHTML(doc.post);
                     })
                     callback(null,docs,total);
                 })
             })
         })
     })
}
//传入的是用户名，发布时间(天),文章题目，返回的是一篇文章  文章的markdown格式
Post.getOne=function (name,day,title,callback) {
     mongo.open(function (error,db) {
          if(error){
              return callback(error);
          }
         db.collection('posts',function (error,collection) {
              if(error){
                  mongo.close();
                  return callback(error);
              }
              collection.findOne({"name":name,"time.day":day,"title":title},function (error,doc) {

                  if(doc){
                         //访问找到了文章
                      collection.update({"name":name,"time.day":day,"title":title},{$inc:{pv:1}},function (error) {
                          mongo.close();
                          if(error){
                              return callback(error);
                          }
                      });
                      doc.post=markdown.toHTML(doc.post);

                    /*  doc.comments.forEach(function (comment) {
                          comment.content=markdown.toHTML(comment.content)
                      })*/
                  }
                    
                  callback(null,doc);
              })
         })
     })
}
//根据用户传入的用户名，发布时间(天)，文章题目，来返回一篇文章的原始格式
Post.edit=function (name,day,title,callback) {
     mongo.open(function (error,db) {
         if(error){
             return callback(error)
         }
         db.collection('posts',function (error,collection) {
               if(error){
                   mongo.close();
                   return callback(error);
               }
             collection.findOne({"name":name,"time.day":day,"title":title},function (error,doc) {
                 mongo.close();
                   if(error){
                       callback(error);
                   }
                  callback(null,doc);
             })
         })
     })
}
//根据用户传入的用户名，发布时间(天)，文章题目，修改了的文章  实现更新数据库的文章
Post.update=function (name,day,title,post,callback) {
    mongo.open(function (error,db) {
        if(error){
            return callback(error);
        }
        db.collection('posts',function (error,collection) {
             if(error){
                 mongo.close();
                 return callback(error)
             }
            collection.update({"name":name,"time.day":day,"title":title},{$set:{post:post}},function (error) {
                mongo.close();
                if(error){
                     return callback(error);
                 }
                callback(null);
            })
        })
    })
}
//根据用户传入的用户名，发布时间(天)，文章题目，实现文章的删除
Post.delete=function (name, day, title, callback) {
    mongo.open(function (error,db) {
        if(error){
            return callback(error)
        }
        db.collection('posts',function (error,collection) {
             if(error){
                 mongo.close();
                 return callback(error);
             }
            //其中的{w:1}表示的是安全的级别
            collection.remove({"name":name,"time.day":day,"title":title},{w:1},function (error) {
                mongo.close();
                if(error){
                    return callback(error);
                }
                callback(null)
            })
        })
    })
}
//实现的是所有文章的存档页面
Post.getArchive=function (callback) {
    mongo.open(function (error,db) {
        if(error){
            return callback(error);
        }
        db.collection('posts',function (error,collection) {
            if(error){
                mongo.close();
                return callback(error);
            }
            collection.find({},{name:1,time:1,title:1}).sort({time:-1}).toArray(function (error,docs) {
                mongo.close();
                if(error){
                    return callback(error)
                }
                callback(null,docs);
            })
            
        })
    })
}
//传进来指定的标签，返回的是含有这个标签的文章
Post.getDocByTag=function (tag, callback) {
    mongo.open(function (error,db) {
        if(error){
            return callback(error);
        }
        db.collection('posts',function (error,collection) {
             if(error){
                 mongo.close();
                 return callback(error);
             }
            collection.find({tags:tag},{name:1,time:1,title:1}).sort({time:-1}).toArray(function (error,docs) {
                mongo.close();
                 if(error){
                       return callback(error)
                 }
                 callback(null,docs);
            })
        })
    })
}
//根据题目的关键字搜索文章
Post.search=function (key, callback) {
    mongo.open(function (error,db) {
         if(error){
             return callback(error);
         }
         db.collection('posts',function (error,collection) {
                if(error){
                    mongo.close();
                    return callback(error);
                }
             var pattern=new RegExp(key,"i");
             collection.find({"title":pattern},{"name":1,"time":1,"title":1}).sort({time:-1}).toArray(function (error,docs) {
                 mongo.close();
                 if(error){
                     return callback(error);
                 }
                callback(null,docs);
             })
         })
    })
      var pattern=new RegExp(key,"i");
      
}
