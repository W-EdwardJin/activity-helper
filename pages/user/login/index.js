// pages/user/login/index.js
Page({
  data: {
    isLoading: false
  },

  userProfile: null, // 声明为页面级变量

  onLoad(options) {
    // 获取回调页面路径
    this.callbackPage = options.callback || '/pages/index/index'
  },

  handleLogin() {
    if (this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    // 显示加载中提示
    wx.showLoading({
      title: '登录中...',
      mask: true
    })

    const app = getApp()
    
    // 先进行基础登录
    app.login().then(() => {
      // 隐藏加载中提示
      wx.hideLoading()
      
      // 请求用户授权获取头像和昵称
      return new Promise((resolve, reject) => {
        wx.showModal({
          title: '授权提示',
          content: '需要获取您的头像和昵称，是否授权？',
          success: (res) => {
            if (res.confirm) {
              // 用户点击确定，继续获取用户信息
              wx.getUserProfile({
                desc: '用于完善会员资料',
                lang: 'zh_CN',
                success: (profileRes) => {
                  this.userProfile = profileRes.userInfo // 使用this.userProfile保存用户信息
                  resolve(profileRes)
                },
                fail: reject
              })
            } else {
              // 用户点击取消
              reject(new Error('用户拒绝授权'))
            }
          },
          fail: reject
        })
      })
    }).then(() => {
      // 更新用户信息到云数据库
      return wx.cloud.callFunction({
        name: 'updateUserProfile',
        data: {
          nickName: this.userProfile.nickName,
          avatarUrl: this.userProfile.avatarUrl
        }
      })
    }).then(() => {
      // 保存用户信息到全局数据和本地存储
      app.globalData.userInfo = this.userProfile
      app.globalData.isLoggedIn = true
      wx.setStorageSync('userInfo', this.userProfile)

      // 显示成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      })

      // 返回之前的页面
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 1500)
    }).catch(err => {
      console.error('操作失败：', err)
      
      // 根据错误类型显示不同提示
      if (err.message === '用户拒绝授权') {
        wx.showToast({
          title: '需要您的授权才能继续使用',
          icon: 'none'
        })
      } else if (err.errMsg && err.errMsg.includes('getUserProfile:fail auth deny')) {
        wx.showToast({
          title: '需要您的授权才能继续',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: err.errMsg && err.errMsg.includes('login:fail') ? '登录失败，请重试' : '获取用户信息失败',
          icon: 'none'
        })
      }
    }).finally(() => {
      this.setData({ isLoading: false })
    })
  }
})