// pages/user/index.js
Page({
  data: {
    isLoggedIn: false,
    userInfo: null
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const app = getApp();
    // 优先从本地存储获取用户信息，因为登录成功后会先更新到本地存储
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo;
    if (userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      });
      // 确保全局数据与本地存储同步
      app.globalData.userInfo = userInfo;
      app.globalData.isLoggedIn = true;
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: null
      });
    }
  },

  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/user/login/index'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo');
          // 清除全局数据
          const app = getApp();
          app.globalData.userInfo = null;
          app.globalData.isLoggedIn = false;
          // 更新页面状态
          this.setData({
            isLoggedIn: false,
            userInfo: null
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 检查登录状态并跳转
  checkLoginAndNavigate(url) {
    // 关于我们页面无需登录即可访问
    if (url === '/pages/about/index') {
      wx.navigateTo({ url });
      return true;
    }
    
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        this.goToLogin();
      }, 1500);
      return false;
    }
    wx.navigateTo({ url });
    return true;
  },

  // 页面跳转处理函数
  handleNavigation(e) {
    const url = e.currentTarget.dataset.url;
    this.checkLoginAndNavigate(url);
  }
});
