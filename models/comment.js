var mongo=require('./db');
function Comment(name,day,title,comment) {
    this.name=name;
    this.day=day;
    this.title=title;
    this.comment=comment;
}
module.exports=Comment;
Comment.prototype.save=function (callback) {
    var name=this.name,day=this.day,title=this.title,comment=this.comment;
    mongo.open(function (error,db) {
        if(error){
            return callback(error)
        }
        db.collection('posts',function (error,collection) {
             if(error){
                 mongo.close();
                 return callback(error);
             }
            collection.update({"name":name,"time.day":day,"title":title},{$push:{comments:comment}},function (error) {
                mongo.close();
                if(error){ 
                     return mongo.close();
                }
                callback(null);
            })
        })
    })
}