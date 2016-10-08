var mongo=require('./db');
function Post(name,title,post) {
     this.name=name;
     this.title=title;
     this.post=post;
}
module.exports=Post;
Post.prototype.save=function (callback) {
      var date=new Date();
      var time={
          date:date,
          year:date.getFullYear(),
          month:date.getFullYear()+'-'+(date.getMonth()+1),
          day:date.getFullYear()+'-'+(date.getMonth()+1)+date.getDate(),
          minute:date.getFullYear()+'-'+(date.getMonth()+1)+date.getDate()+' '+date.getHours()+":"+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
      }
    var post={
        time:time,
        name:this.name,
        title:this.title,
        post:this.post,
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
                  if(error){
                      mongo.close();
                      return callback(error)
                  }
                  callback(null);
            })
        })
    })
}
Post.get=function (name,callback) {
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
             collection.find(query).sort({time:-1}).toArray(function (error,docs) {
                 if(error){
                     mongo.close();
                     return callback(error);
                 }
                 callback(null,docs);
             })
         })
     })
}