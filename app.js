// app.js
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false
  },

  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'social-activity-help-2be86b6c5aa', // 云开发环境ID
        traceUser: true
      })
    }

    // 检查登录状态
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    // 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }
  },

  // 用户登录
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 调用云函数登录
            wx.cloud.callFunction({
              name: 'login',
              success: (result) => {
                if (result.result.success) {
                  // 只更新登录状态，用户信息将在获取用户授权后更新
                  this.globalData.isLoggedIn = true
                  resolve(result.result)
                } else {
                  reject(new Error('登录失败'))
                }
              },
              fail: (err) => {
                console.error('登录失败：', err)
                reject(err)
              }
            })
          } else {
            reject(new Error('登录失败：' + res.errMsg))
          }
        },
        fail: reject
      })
    })
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    wx.removeStorageSync('userInfo')
  }
})