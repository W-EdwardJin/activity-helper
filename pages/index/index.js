// pages/index/index.js
Page({
  data: {
    activities: [],
    loading: false,
    activeType: 'all',
    types: [
      { text: '全部', value: 'all' },
      { text: '聚会', value: '聚会' },
      { text: '运动', value: '运动' },
      { text: '聚餐', value: '聚餐' },
      { text: '旅行', value: '旅行' },
      { text: '会议', value: '会议' },
      { text: '其他', value: '其他' }
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
      if (this.data.activeType !== 'all') {
        query = query.where({
          type: this.data.activeType
        })
      }

      const activities = await query
        .orderBy('createTime', 'desc')
        .skip((this.data.page - 1) * this.data.pageSize)
        .limit(this.data.pageSize)
        .get()

      // 确保数据加载成功后再更新状态
      if (activities && activities.data) {
        this.setData({
          activities: this.data.page === 1 ? activities.data : [...this.data.activities, ...activities.data],
          page: this.data.page + 1,
          hasMore: activities.data.length === this.data.pageSize,
          loading: false
        })
      } else {
        this.setData({
          loading: false,
          hasMore: false
        })
      }

      wx.stopPullDownRefresh()
    } catch (err) {
      console.error('加载活动列表失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ 
        loading: false,
        hasMore: true,
        page: this.data.page === 1 ? 1 : this.data.page - 1
      })
    }
  },

  // 切换活动类型
  onTypeChange(event) {
    const type = event.detail.name || 'all'  // 修复：正确获取类型值
    if (type === this.data.activeType) return // 避免重复加载

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