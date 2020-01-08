const app = getApp()

Page({
  data: {
  },

  // 用户选择语言
  select_chinese: function(){
    wx.navigateTo({
      url: '/pages/vqa/vqac/vqac',
    })
  },
  select_english: function(){
    wx.navigateTo({
      url: '/pages/vqa/vqae/vqae',
    })
  },
  onLoad: function() {
  }
})