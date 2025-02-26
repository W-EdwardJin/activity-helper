// pages/index/index.js
Page({
  data: {
    activities: [],
    loading: false,
    activeType: 'recommend',
    types: [
      { text: '全部', value: 'recommend' },
      { text: '运动', value: 'sports' },
      { text: '聚餐', value: 'dinner' },
      { text: '聚会', value: 'party' }
    ],
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.loadActivities()
  },

  onPullDownRefresh() {
    this.setData({
      activities: [],
      page: 1,
      hasMore: true
    }, () => {
      this.loadActivities()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities()
    }
  },

  // 加载活动列表
  async loadActivities() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      
      let query = db.collection('activity')
      if (this.data.activeType !== 'recommend') {
        query = query.where({
          type: this.data.activeType
        })
      }

      const activities = await query
        .orderBy('createTime', 'desc')
        .skip((this.data.page - 1) * this.data.pageSize)
        .limit(this.data.pageSize)
        .get()

      this.setData({
        activities: this.data.page === 1 ? activities.data : [...this.data.activities, ...activities.data],
        page: this.data.page + 1,
        hasMore: activities.data.length === this.data.pageSize,
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
    this.setData({
      activeType: type,
      activities: [],
      page: 1,
      hasMore: true
    }, () => {
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