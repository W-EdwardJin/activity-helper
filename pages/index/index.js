// pages/index/index.js
Page({
  data: {
    activities: [],
    loading: true,
    activeType: 'all',
    types: [
      { text: '全部', value: 'all' },
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
      let query = db.collection('activity')
      
      // 根据类型筛选
      if (this.data.activeType !== 'all') {
        query = query.where({
          type: this.data.activeType
        })
      }

      // 按创建时间倒序排列
      const activities = await query
        .orderBy('createTime', 'desc')
        .get()

      this.setData({
        activities: activities.data,
        loading: false
      })

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