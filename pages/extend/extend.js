Page({
  data: {
  },
  //事件处理函数
  gotoSmallTalk: function() {
    wx.navigateTo({
      url: '/pages/extend/talk/talk'
    })
  },
  gotoDraw: function () {
    wx.navigateTo({
      url: '/pages/extend/draw/draw'
    })
  },
  onLoad(){
  }
})
