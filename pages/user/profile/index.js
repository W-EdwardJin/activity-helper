// pages/user/profile/index.js
Page({
  data: {
    userInfo: null,
    isEditing: false,
    editForm: {
      nickName: '',
      avatarUrl: '',
      phoneNumber: ''
    }
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo
    if (userInfo) {
      this.setData({
        userInfo,
        editForm: {
          nickName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
          phoneNumber: userInfo.phoneNumber || ''
        }
      })
    }
  },

  // 开始编辑
  startEdit() {
    this.setData({ isEditing: true })
  },

  // 取消编辑
  cancelEdit() {
    this.setData({
      isEditing: false,
      editForm: {
        nickName: this.data.userInfo.nickName || '',
        avatarUrl: this.data.userInfo.avatarUrl || '',
        phoneNumber: this.data.userInfo.phoneNumber || ''
      }
    })
  },

  // 更新表单数据
  handleInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`editForm.${field}`]: e.detail.value
    })
  },

  // 选择头像
  async chooseAvatar() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFiles.length > 0) {
        // 上传头像到云存储
        const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).substr(2)}.${res.tempFiles[0].tempFilePath.match(/\.([^.]+)$/)[1]}`
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: res.tempFiles[0].tempFilePath
        })

        this.setData({
          'editForm.avatarUrl': uploadRes.fileID
        })
      }
    } catch (err) {
      console.error('选择头像失败：', err)
      wx.showToast({
        title: '选择头像失败',
        icon: 'none'
      })
    }
  },

  // 保存编辑
  async saveEdit() {
    if (!this.data.editForm.nickName) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      })
      return
    }

    try {
      const db = wx.cloud.database()
      const app = getApp()

      // 更新用户信息到云数据库
      await wx.cloud.callFunction({
        name: 'updateUserProfile',
        data: this.data.editForm
      })

      // 更新本地存储和全局数据
      const newUserInfo = {
        ...this.data.userInfo,
        ...this.data.editForm
      }
      app.globalData.userInfo = newUserInfo
      wx.setStorageSync('userInfo', newUserInfo)

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      this.setData({
        isEditing: false,
        userInfo: newUserInfo
      })
    } catch (err) {
      console.error('保存失败：', err)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  }
})