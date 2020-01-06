var user = require("../../utils/user.js");
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()
const innerAudioContext = wx.createInnerAudioContext()

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
    answer: '',
    //语音识别模块
    shownull: false,
    showmicro: false,
    chi: '' //翻译后的答案
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
    this.initRecord()
    app.getRecordAuth()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.addPicture()
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

  // 选取图片并上传
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
          url: 'http://514d7fa2.cpolar.io/register', //http://192.168.0.105:8880为服务器地址
          filePath: imgfilePath,
          name: 'image',
          header: {
            "Content-Type": "multipart/form-data"
          },
          formData: {
            'user': 'test'
          },
          success(res) {
            wx.showToast({
              title: '图片上传成功！'
            })
          }
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  
  // 发送问题
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
        plugin.translate({
          lfrom: "en_US",
          lto: "zh_CN",
          content: res.data,
          success: function (res) {
            if (res.retcode == 0) {
              console.log("result", res.result);
              _this.setData({
                chi: res.result
              })
            } else {
              console.warn("翻译失败", res)
            }
          },
          fail: function (res) {
            console.log("网络失败", res)
          }
        })
      }
    })
  },

  // 问题输入框填值和清空
  QuesInput: function (e) {
    var _this = this;
    var content = e.detail.value;
    if (content == '') {
      wx.showToast({
        title: '请点击语音按钮提问！',
        image: '/images/fail.png',
      })
      _this.setData({
        ques: content
      })
    } else{
      _this.setData({
        ques: content
      })
    }
  },
  qingkong: function (e) {
    var _this = this;
    _this.setData({
      ques: ''
    })
  },

  // 语音识别、翻译、合成模块
  initRecord: function () {
    var that = this;
    manager.onStart = (res) => {
      that.setData({
        showmicro: true
      })
    }
    // 识别结束事件
    manager.onStop = (res) => {
      var that = this;
      let text = res.result;
      if (text == '') {
        that.setData({
          shownull: true
        })
        setTimeout(function () {
          that.setData({
            shownull: false
          })
        }, 500)
      }
      //验证问题，如果问的是中文（使用时默认）则在翻译后填入输入框
      var pattern2 = new RegExp("[A-Za-z]+");
      if (!pattern2.test(text)) {
        plugin.translate({
          lfrom: "zh_CN",
          lto: "en_US",
          content: text,
          success: function (res) {
            if (res.retcode == 0) {
              console.log("result", res.result);
              text = res.result;
              that.setData({
                ques: text,
                showmicro: false
              })
            } else {
              console.warn("翻译失败", res)
            }
          }, fail: function (res) {
            console.log("网络失败", res)
          }
        })
      } else{
        that.setData({
          ques: text,
          showmicro: false
        })
      }
    }
  },

  //手指按下
  touchdown_plugin: function (e) {
    wx.stopBackgroundAudio();
    manager.start({
      lang: "zh_CN"
    })
  },
  //手指松开
  touchup_plugin: function () {
    manager.stop();
  },

  // 文字转语音（语音合成）
  wordtospeak: function (e) {
    var that = this;
    var chinese = this.data.chi;
    var content = this.data.answer;
    if (content == '') {
      wx.showToast({
        title: '获取答案失败',
        image: '/images/fail.png',
      })
    }
    plugin.textToSpeech({  //将答案朗读出来给盲人听
      lang: "zh_CN",
      tts: true,
      content: chinese,
      success: function (res) {
        innerAudioContext.autoplay = true;
        innerAudioContext.src = res.filename;
        innerAudioContext.onPlay(() => {
          console.log('开始播放')
        })
        wx.showLoading({
          title: '正在播放',
        })
        innerAudioContext.onError((res) => {
          if (res) {
            wx.hideLoading(),
            wx.showToast({
              title: '发生错误',
              image: '/images/fail.png',
            })
          }
        })
        innerAudioContext.onEnded(function () {
          wx.hideLoading()
        })
        console.log("succ tts", res.filename)
      },
      fail: function (res) {
        console.log("fail tts", res)
      },
    })
  },

})