/**
 * 最终上传到cos的URL
 * 把以下字段配置成自己的cos相关信息，详情可看API文档 https://www.qcloud.com/document/product/436/6066
 * REGION: cos上传的地区
 * APPID: 账号的appid
 * BUCKET_NAME: cos bucket的名字
 * DIR_NAME: 上传的文件目录
 */
var cosUrl = "https://" + "ap-chengdu" + ".file.myqcloud.com/files/v2/" + "1252859906" + "/" + "cardmanager-1252859906" +"/card"

//填写自己的鉴权服务器地址
var cosSignatureUrl = 'https://weixin.shopin.net/wechatshop/getTencentSign.html' 
// var cosSignatureUrl = 'http://localhost:8083/wechatshop/getTencentSign.html' 
/**
 * 上传方法
 * filePath: 上传的文件路径
 * fileName： 上传到cos后的文件名
 */
function upload(filePath, fileName) {
  // var openId = "123";
  // wx.uploadFile({
  //   url: "https://localhost:8083/wechatshop/wx_upload",
  //   filePath: filePath,
  //   name: 'file',
  //   formData:{
  //     'openId':openId
  //   },
    
    
  //   success: function (uploadRes) {
  //     var data = uploadRes.data
  //     console.log('uploadRes', uploadRes)
  //     var upload_res = JSON.parse(data)
  //     var imageUrl = upload_res.data.source_url;
  //     console.log(imageUrl);
  //     //do something
  //   },
  //   fail: function (e) {
  //     console.log('e', e)
  //   }
  // })

    // 鉴权获取签名
    wx.request({
        url: cosSignatureUrl,
        success: function(cosRes) {

            // 签名
            var signature = cosRes.data
            console.log(signature);

            // 头部带上签名，上传文件至COS
            wx.uploadFile({
                url: cosUrl + '/' + fileName,
                filePath: filePath,
                header: {
                    'Authorization': signature
                },
                name: 'filecontent',
                formData: {
                    op: 'upload'
                },
                success: function(uploadRes){
                    var data = uploadRes.data
                    console.log('uploadRes', uploadRes)
                    var upload_res = JSON.parse(data)
                    var imageUrl = upload_res.data.source_url;
                    console.log(imageUrl);
                    //do something
                },
                fail: function(e) {
                    console.log('e', e)
                }
            })
        }
    })
}

module.exports = upload