// pages/activity/my-joined/index.js
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
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })

    try {
      const app = getApp()
      const db = wx.cloud.database()
      const _ = db.command
      const pageSize = 10

      // 先获取用户的报名记录
      const enrollments = await db.collection('enrollment')
        .where({
          userId: app.globalData.userInfo._id
        })
        .orderBy('createTime', 'desc')
        .skip((this.data.page - 1) * pageSize)
        .limit(pageSize)
        .get()

      if (enrollments.data.length === 0) {
        this.setData({
          hasMore: false
        })
        return
      }

      // 获取报名的活动详情
      const activityIds = enrollments.data.map(e => e.activityId)
      const activities = await db.collection('activity')
        .where({
          _id: _.in(activityIds)
        })
        .get()

      // 合并活动信息和报名状态
      const mergedActivities = activities.data.map(activity => {
        const enrollment = enrollments.data.find(e => e.activityId === activity._id)
        return {
          ...activity,
          enrollmentStatus: enrollment.status,
          enrollmentTime: enrollment.createTime
        }
      })

      this.setData({
        activities: this.data.page === 1 ? mergedActivities : [...this.data.activities, ...mergedActivities],
        page: this.data.page + 1,
        hasMore: enrollments.data.length === pageSize
      })
    } catch (err) {
      console.error('加载活动列表失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 跳转到活动详情页
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/activity/detail/index?id=${id}`
    })
  },

  // 取消报名
  async cancelEnrollment(e) {
    const { id, title } = e.currentTarget.dataset

    wx.showModal({
      title: '确认取消',
      content: `确定要取消参加活动「${title}」吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const app = getApp()
            const db = wx.cloud.database()

            // 删除报名记录
            await db.collection('enrollment')
              .where({
                activityId: id,
                userId: app.globalData.userInfo._id
              })
              .remove()

            // 更新活动参与人数
            await db.collection('activity').doc(id).update({
              data: {
                currentParticipants: db.command.inc(-1)
              }
            })

            wx.showToast({
              title: '已取消报名',
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
            console.error('取消报名失败：', err)
            wx.showToast({
              title: '操作失败',
              icon: 'error'
            })
          }
        }
      }
    })
  }
})