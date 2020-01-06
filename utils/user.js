const Bmob = require('bmob.js')
function getUserInfo(){
  var user = new Bmob.User();//实例化
  // 登录
  wx.login({
    success: function (res) {
      console.log(res);
      user.loginWithWeapp(res.code).then(function (user) {
        var openid = user.get("authData").weapp.openid;
        console.log(user, 'user', user.id, res);
        if (user.get("nickName")) {

          // 第二次登录，打印用户之前保存的昵称
          console.log(user.get("nickName"), 'res.get("nickName")');

          //更新openid
          wx.setStorageSync('openid', openid)
        } else {//注册成功的情况

          var u = Bmob.Object.extend("_User");
          var query = new Bmob.Query(u);
          query.get(user.id, {
            success: function (result) {
              wx.setStorageSync('own', result.get("uid"));
            },
            error: function (result, error) {
              console.log("查询失败");
            }
          });


          //保存用户其他信息，比如昵称头像之类的
          wx.getUserInfo({
            success: function (result) {

              var userInfo = result.userInfo;
              var nickName = userInfo.nickName;
              var avatarUrl = userInfo.avatarUrl;

              var u = Bmob.Object.extend("_User");
              var query = new Bmob.Query(u);
              // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
              query.get(user.id, {
                success: function (result) {
                  // 自动绑定之前的账号

                  result.set('nickName', nickName);
                  result.set("userPic", avatarUrl);
                  result.set("openid", openid);
                  result.save();

                }
              });

            }
          });


        }

      }, function (err) {
        console.log(err, 'errr');
      });

    }
  });
}
module.exports.getUserInfo = getUserInfo;