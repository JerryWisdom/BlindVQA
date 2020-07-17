const app = getApp()

var user = require("../../../utils/user.js");
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()
const innerAudioContext = wx.createInnerAudioContext()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mylang: 'zh_CN',
    pic_url: 'https://hducsrao.xyz/register/',  //https://192.168.0.105:8880为服务器地址
    ques_url: 'https://hducsrao.xyz/question/',
    quesIP: '',
    //相册或者拍照获取路径
    chooseImageSrc: '',
    imageUrl: '',
    ques: null,
    answer: '',
    //语音识别模块
    shownull: false,
    showmicro: false,
    chi: '', //翻译后的答案
    recording: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this
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
    wx.request({
      url: 'https://pv.sohu.com/cityjson?ie=utf-8',
      success: function (e) {
        var aaa = e.data.split(' ');
        // console.log(aaa)
        var bbb = aaa[4]
        var ccc = bbb.replace('"', '')
        var ddd = ccc.replace('"', '')
        var eee = ddd.replace(',', '').split('.')
        _this.setData({
          quesIP: 'question' + eee[0] + eee[1] + eee[2] + eee[3]
        })
      },
      fail: function () {
        console.log("失败了");
      }
    })
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
          chooseImageSrc: tempFilePaths
        })
        wx.uploadFile({
          url: _this.data.pic_url, 
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
    var that = this;
    var myques = this.data.ques;
    var userlang = this.data.mylang;
    // var pattern2 = new RegExp("[A-Za-z]+");
    // if (!pattern2.test(myques)) {
    //   console.log("翻译")
    //   plugin.translate({
    //     lfrom: "zh_CN",
    //     lto: "en_US",
    //     content: myques,
    //     success: function (res) {
    //       if (res.retcode == 0) {
    //         console.log("result", res.result);
    //         that.setData({
    //           ques: res.result
    //         })
    //       } else {
    //         console.warn("翻译失败", res)
    //       }
    //     }, fail: function (res) {
    //       console.log("网络失败", res)
    //     }
    //   })
    // }
    console.log(that.data.ques)
    var post_data = {}
    post_data[that.data.quesIP] = that.data.ques
    console.log(post_data)
    wx.request({
      url: this.data.ques_url, 
      method: 'post',
      data: post_data,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        console.log("send question success");
        if(res.data.length>=20){
          wx.showToast({
            title: '获取答案失败',
            image: '/images/fail.png',
          })
        } else{
          that.setData({
            answer: res.data,
            chi: res.data
          })
          if(userlang == 'zh_CN') {
            plugin.translate({
              lfrom: "en_US",
              lto: userlang,
              content: res.data,
              success: function (res) {
                if (res.retcode == 0) {
                  console.log("result", res.result);
                  that.setData({
                    chi: res.result
                  })
                } else {
                  console.warn("翻译失败", res)
                }
              }, fail: function (res) {
                console.log("网络失败", res)
              }
            })
          }
        }
      }, fail: function (res) {
        wx.showToast({
          title: '获取答案失败',
          image: '/images/fail.png',
        })
      }
    })
  },

  // 问题输入框填值和清空
  QuesInput: function (e) {
    var that = this;
    var content = e.detail.value;
    if (content == '') {
      wx.showToast({
        title: '请点击语音按钮提问！',
        image: '/images/fail.png',
      })
      that.setData({
        ques: content
      })
    }
    else{
      that.setData({
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
        showmicro: false
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
    var that = this;
    wx.stopBackgroundAudio();
    manager.start({
      lang: this.data.mylang
    })
    wx.showToast({
      title: '按住识别',
      image: '/images/microphone.png',
      duration: 800
    })
    that.setData({
      showmicro: true,
      recording: true
    })
  },
  //手指松开
  touchup_plugin: function (e) {
    var that = this;
    if (that.data.recording) {
      manager.stop()
      wx.showToast({
        title: '停止识别',
        image: '/images/stop.png',
        duration: 800
      })
      that.setData({
        showmicro: false,
        recording: false
      })
    }
  },

  // 文字转语音（语音合成）
  wordtospeak: function (e) {
    var that = this;
    var chinese = this.data.chi;
    if (this.data.recording) {
      manager.stop
    }
    that.setData({
      recording: false
    })
    console.log(chinese);
    plugin.textToSpeech({  //将答案朗读出来给盲人听
      lang: this.data.mylang,
      tts: true,
      content: chinese,
      success: function (res) {
        console.log(" tts", res)
        innerAudioContext.autoplay = true
        innerAudioContext.src = res.filename
        innerAudioContext.onPlay(() => {
          console.log('开始播放')
        })
        wx.showLoading({
          title: '正在播放',
        })
        innerAudioContext.onError((res) => {
          if (res) {
            wx.hideLoading()
              // wx.showToast({
              //   title: '文本格式错误',
              //   image: '/images/fail.png',
              // })
          }
        })
        innerAudioContext.onEnded(function () {
          wx.stopBackgroundAudio();
          wx.hideLoading();
          manager.start({
            lang: this.data.mylang
          })
          // setTimeout(function () {
          //   wx.hideLoading()
          // }, 300)
        })
      },
      fail: function (res) {
        console.log("fail tts", res)
      },
    })
  },

})