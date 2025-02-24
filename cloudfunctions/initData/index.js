// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const activityCollection = db.collection('activity')

  // 示例活动数据
  const activities = [
    {
      title: '周末篮球友谊赛',
      description: '一起来打篮球吧！适合所有水平的玩家。',
      type: 'sports',
      startTime: '2024-02-10 14:00',
      endTime: '2024-02-10 16:00',
      location: '市体育中心篮球场',
      maxParticipants: 10,
      currentParticipants: 1,
      status: '报名中',
      coverUrl: 'cloud://social-activity-helper.736f-social-activity-helper/activities/basketball.jpg',
      createTime: db.serverDate()
    },
    {
      title: '火锅聚餐',
      description: '一起来吃火锅，欢迎新朋友参加！',
      type: 'dinner',
      startTime: '2024-02-15 18:00',
      endTime: '2024-02-15 20:00',
      location: '老街口火锅店',
      maxParticipants: 8,
      currentParticipants: 2,
      status: '报名中',
      coverUrl: 'cloud://social-activity-helper.736f-social-activity-helper/activities/hotpot.jpg',
      createTime: db.serverDate()
    }
  ]

  try {
    // 清空现有数据
    await activityCollection.where({}).remove()

    // 插入新数据
    for (const activity of activities) {
      await activityCollection.add({
        data: activity
      })
    }

    return {
      success: true,
      message: '数据初始化成功'
    }
  } catch (err) {
    console.error('[云函数] [initData] 调用失败：', err)
    return {
      success: false,
      error: err
    }
  }
}