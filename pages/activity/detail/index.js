// pages/activity/detail/index.js
Page({
  data: {
    activity: null,
    participants: [],
    isCreator: false,
    hasJoined: false,
    loading: true
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.activityId = id
      this.loadActivityDetail()
      this.loadParticipants()
    }
  },

  // 加载活动详情
  async loadActivityDetail() {
    try {
      const db = wx.cloud.database()
      const activity = await db.collection('activity').doc(this.activityId).get()
      
      const app = getApp()
      const isCreator = activity.data.creatorId === app.globalData.userInfo._id
      
      this.setData({
        activity: activity.data,
        isCreator,
        loading: false
      })
    } catch (err) {
      console.error('加载活动详情失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 加载参与者列表
  async loadParticipants() {
    try {
      const db = wx.cloud.database()
      const enrollments = await db.collection('enrollment')
        .where({
          activityId: this.activityId
        })
        .get()

      // 获取所有参与者的用户信息
      const userIds = enrollments.data.map(e => e.userId)
      const users = await db.collection('user')
        .where({
          _id: db.command.in(userIds)
        })
        .get()

      // 合并报名状态和用户信息
      const participants = enrollments.data.map(enrollment => {
        const user = users.data.find(u => u._id === enrollment.userId)
        return {
          ...enrollment,
          ...user
        }
      })

      // 检查当前用户是否已报名
      const app = getApp()
      const isEnrolled = participants.some(p => p.userId === app.globalData.userInfo._id)

      this.setData({
        participants,
        hasJoined: isEnrolled
      })
    } catch (err) {
      console.error('加载参与者列表失败：', err)
    }
  },

  // 报名活动
  async enroll() {
    if (!this.data.activity) return

    const app = getApp()
    if (!app.globalData.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/user/login/index'
      })
      return
    }

    try {
      const db = wx.cloud.database()
      await db.collection('enrollment').add({
        data: {
          activityId: this.activityId,
          userId: app.globalData.userInfo._id,
          status: 'confirmed',
          createTime: db.serverDate()
        }
      })

      // 更新活动参与人数
      await db.collection('activity').doc(this.activityId).update({
        data: {
          currentParticipants: db.command.inc(1)
        }
      })

      wx.showToast({
        title: '报名成功',
        icon: 'success'
      })

      // 重新加载数据
      this.loadActivityDetail()
      this.loadParticipants()
    } catch (err) {
      console.error('报名失败：', err)
      wx.showToast({
        title: '报名失败',
        icon: 'error'
      })
    }
  },

  // 取消报名
  async cancelEnrollment() {
    try {
      const db = wx.cloud.database()
      const app = getApp()
      
      // 删除报名记录
      await db.collection('enrollment')
        .where({
          activityId: this.activityId,
          userId: app.globalData.userInfo._id
        })
        .remove()

      // 更新活动参与人数
      await db.collection('activity').doc(this.activityId).update({
        data: {
          currentParticipants: db.command.inc(-1)
        }
      })

      wx.showToast({
        title: '已取消报名',
        icon: 'success'
      })

      // 重新加载数据
      this.loadActivityDetail()
      this.loadParticipants()
    } catch (err) {
      console.error('取消报名失败：', err)
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      })
    }
  },
  // 分享活动
  onShareAppMessage() {
    if (this.data.activity) {
      return {
        title: this.data.activity.title,
        path: `/pages/activity/detail/index?id=${this.activityId}`,
        imageUrl: this.data.activity.coverImage || '/assets/images/default_cover.png'
      }
    }
    return {
      title: '活动详情',
      path: '/pages/index/index'
    }
  }
})