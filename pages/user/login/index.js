// pages/user/login/index.js
Page({
  data: {
    isLoading: false
  },

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

    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善会员资料',
      lang: 'zh_CN',
      success: (res) => {
        const userInfo = {
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName
        }
        const app = getApp()
        
        // 调用应用登录方法
        app.login().then(() => {
          // 更新全局数据
          app.globalData.userInfo = userInfo
          app.globalData.isLoggedIn = true
          wx.setStorageSync('userInfo', userInfo)
          
          // 隐藏加载中提示
          wx.hideLoading()
          
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
          console.error('登录失败：', err)
          // 隐藏加载中提示
          wx.hideLoading()
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          })
        }).finally(() => {
          this.setData({ isLoading: false })
        })
      },
      fail: (err) => {
        console.log('获取用户信息失败：', err)
        // 隐藏加载中提示
        wx.hideLoading()
        this.setData({ isLoading: false })
        if (err.errMsg.includes('getUserProfile:fail auth deny')) {
          wx.showToast({
            title: '需要您的授权才能继续',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          })
        }
      }
    })
  }
})