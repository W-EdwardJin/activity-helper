// pages/index/index.js
Page({
  data: {
    activities: [],
    loading: true,
    activeType: 'recommend',
    types: [
      { text: '推荐', value: 'recommend' },
      { text: '运动', value: 'sports' },
      { text: '聚餐', value: 'dinner' },
      { text: '聚会', value: 'party' }
    ]
  },

  onLoad() {
    this.loadActivities()
  },

  onPullDownRefresh() {
    this.loadActivities()
  },

  // 加载活动列表
  async loadActivities() {
    try {
      this.setData({ loading: true })
      const db = wx.cloud.database()
      
      // if (this.data.activeType === 'recommend') {
      //   // 调用推荐云函数
      //   const app = getApp()
      //   const result = await wx.cloud.callFunction({
      //     name: 'recommendActivities',
      //     data: {
      //       userInfo: app.globalData.userInfo || {}
      //     }
      //   })
        
      //   if (result.result.success) {
      //     this.setData({
      //       activities: result.result.data,
      //       loading: false
      //     })
      //   } else {
      //     throw new Error('获取推荐活动失败')
      //   }
      // } else {
        // 原有的活动列表加载逻辑
        let query = db.collection('activity')
        if (this.data.activeType !== 'all') {
          query = query.where({
            type: this.data.activeType
          })
        }
        const activities = await query
          .orderBy('createTime', 'desc')
          .get()

        this.setData({
          activities: activities.data,
          loading: false
        })
      // }

      wx.stopPullDownRefresh()
    } catch (err) {
      console.error('加载活动列表失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
  },

  // 切换活动类型
  onTypeChange(event) {
    const type = event.detail
    this.setData({ activeType: type }, () => {
      this.loadActivities()
    })
  },

  // 跳转到活动详情
  goToDetail(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity/detail/index?id=${id}`
    })
  }
})