//生成图片验证码
var code;
var ts_yzm=$("#ts_yzm");
var Button1=$("#Button1");
function createCode() {
    code = "";
    var codeLength = 4; //验证码的长度
    var checkCode = document.getElementById("checkCode");
    var codeChars = new Array(0,1,2, 3, 4, 5, 6, 7, 8, 9,
        'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'); //所有候选组成验证码的字符，当然也可以用中文的
    for (var i = 0; i < codeLength; i++)
    {
        var charNum = Math.floor(Math.random() * 52);
        code += codeChars[charNum];
    }
    if (checkCode)
    {
        checkCode.className = "code";
        checkCode.innerHTML = code;
    }
}
function validateCode()
{

    var inputCode = document.getElementById("inputCode").value;
    if (inputCode.length <= 0)
    {
        ts_yzm.html("请输入验证码")
        Button1.attr('disabled',true);
    }
    else if (inputCode.toUpperCase() != code.toUpperCase())
    {
        ts_yzm.html("验证码输入有误");
        Button1.attr('disabled',true);
        createCode();
    }
    else
    {
        ts_yzm.html("验证码正确");
        Button1.attr('disabled',false);
    }
}
//检测密码的复杂度

function checkStrong(val) {
    var modes = 0;
    if (val.length < 6) return 0;
    if (/\d/.test(val)) modes++; //数字
    if (/[a-z]/.test(val)) modes++; //小写
    if (/[A-Z]/.test(val)) modes++; //大写
    if (/\W/.test(val)) modes++; //特殊字符
    if (val.length > 12) return 4;
    return modes;
}
//用户输入表单正确后的颜色改变

function valideCSS(element,con,err_info,success_info) {
    if(con){
        if(element.hasClass("reg_success")){
            element.removeClass("reg_success")
        }
        element.addClass("reg_error");
        element.html(err_info);  //"建议密码的长度大于6"
        Button1.attr('disabled',true);
    }
    else{
        if(element.hasClass("reg_error")){
            element.removeClass("reg_success")
        }
        element.addClass("reg_success");
        element.html(success_info);  //"密码长度复合要求，继续完成注册"
        Button1.attr('disabled',false);
    }
}