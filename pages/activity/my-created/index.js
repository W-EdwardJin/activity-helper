// pages/activity/my-created/index.js
const app = getApp()

Page({
  data: {
    activities: [],
    loading: false,
    page: 1,
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
    })
    this.loadActivities().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities()
    }
  },

  async loadActivities() {
    // 如果正在加载或没有更多数据，直接返回
    if (this.data.loading || !this.data.hasMore) return

    if (!app.globalData.userInfo) {
      this.setData({ loading: false })
      wx.navigateTo({
        url: '/pages/user/login/index'
      })
      return
    }

    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const pageSize = 10

      // 获取当前用户创建的活动
      const res = await db.collection('activity')
        .where({
          creatorId: app.globalData.userInfo._id
        })
        .orderBy('createTime', 'desc')
        .skip((this.data.page - 1) * pageSize)
        .limit(pageSize)
        .get()

      const activities = res.data
      const hasMore = activities.length === pageSize

      // 更新活动列表和分页信息
      this.setData({
        activities: this.data.page === 1 ? activities : [...this.data.activities, ...activities],
        page: this.data.page + 1,
        hasMore,
        loading: false
      })
    } catch (err) {
      console.error('加载活动列表失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ 
        loading: false,
        hasMore: false
      })
    }
  },

  // 跳转到活动详情页
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/activity/detail/index?id=${id}`
    })
  },

  // 删除活动
  async deleteActivity(e) {
    const { id, title } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: `确定要删除活动「${title}」吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const db = wx.cloud.database()
            await db.collection('activity').doc(id).remove()
            
            // 同时删除相关的报名记录
            await db.collection('enrollment')
              .where({
                activityId: id
              })
              .remove()

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })

            // 重新加载活动列表
            this.setData({
              activities: [],
              page: 1,
              hasMore: true
            })
            this.loadActivities()
          } catch (err) {
            console.error('删除活动失败：', err)
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  }
})