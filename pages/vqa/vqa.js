var user = require("../../utils/user.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //相册或者拍照获取路径
    chooseImageSrc: '',
    imageUrl: '',
    //是否展示图片
    showView: false,
    ques: null,
    answer: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "Blind VQA",
      success: function (e) {
        console.log(e);
      }, fail: function (e) {
        console.log(e);
      }
    }
    )
    var openId = wx.getStorageSync('openId')
    if (openId == '') {
      user.getUserInfo()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.addPicture()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },

  QuesInput: function (e) {
    var _this = this;
      _this.setData({
        ques: e.detail.value
      })
  },
  qingkong: function (e) {
    var _this = this;
    _this.setData({
      ques: ''
    })
  },

  addPicture: function () {
    var _this = this;
    wx: wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log(res.tempFilePaths + "  \n" + res.tempFiles[0]);
        var tempFilePaths = res.tempFilePaths;
        var imgfilePath = res.tempFilePaths[0];
        _this.setData({
          chooseImageSrc: tempFilePaths,
          showView: true   //展示图片
        })
        wx.uploadFile({
          url: 'http://514d7fa2.cpolar.io/register', //http://192.168.0.105:8880
          filePath: imgfilePath,
          name: 'image',
          header: {
            "Content-Type": "multipart/form-data"
          },
          formData: {
            'user': 'test'
          },
          success(res) {
            console.log("upload image success");
          }
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  
  send: function (res) {
    var _this = this;
    var myques = this.data.ques;
    wx.request({
      url: 'http://514d7fa2.cpolar.io/question', //http://192.168.0.105:8880
      method: 'post',
      data: {
        question: myques
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        console.log("send question success");
        _this.setData({
          answer: res.data
        })
      }
    })
  },
})