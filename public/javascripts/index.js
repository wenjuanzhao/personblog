var g=$('#gs-input')
function hiddenhint() {
     if(g.val()=="输入关键字搜索"){
         $('#gs-input').val("")
     }
}
function showhint() {
    if(g.val()==""){
        $('#gs-input').val("输入关键字搜索")
    }
}