// 云函数入口文件
import cloud from 'wx-server-sdk'
import axios from 'axios'

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
export default async function(event, context) {
  try {
    const { userInfo } = event
    const db = cloud.database()

    // 获取用户历史参与的活动类型
    const enrollments = await db.collection('enrollment')
      .where({
        userId: userInfo._id
      })
      .get()

    // 获取这些活动的详细信息
    const activityIds = enrollments.data.map(e => e.activityId)
    const activities = await db.collection('activity')
      .where({
        _id: db.command.in(activityIds)
      })
      .get()

    // 构建用户画像
    const userProfile = {
      ...userInfo,
      historicalActivities: activities.data.map(a => ({
        type: a.type,
        title: a.title
      }))
    }

    // 构建请求体
    const requestBody = {
      model: 'deepseek-v3-241226',
      messages: [
        {
          role: 'system',
          content: '你是一个活动推荐助手。请根据用户的历史活动记录，直接生成3个具体的活动建议。每个活动都应该包含标题、类型、地点、开始时间、结束时间、人数限制和推荐原因。输出格式为JSON数组：[{"title":"活动标题","type":"活动类型","location":"活动地点","startTime":"开始时间","endTime":"结束时间","maxParticipants":人数限制,"description":"活动描述","reason":"推荐原因"}]'
        },
        {
          role: 'user',
          content: `用户画像：${JSON.stringify(userProfile)}`
        }
      ],
      temperature: 0.6
    }

    // 调用 DeepSeek V3 API
    const response = await axios({
      method: 'post',
      url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 0db0cc06-8810-4a97-ac2d-3008aed40462'
      },
      data: requestBody,
      timeout: 60000
    })

    // 解析推荐的活动
    const recommendedActivities = JSON.parse(response.data.choices[0].message.content)

    // 将推荐的活动添加到数据库
    const activityCollection = db.collection('activity')
    
    const createdActivities = await Promise.all(
      recommendedActivities.map(async (activity) => {
        const result = await activityCollection.add({
          data: {
            ...activity,
            status: '报名中',
            currentParticipants: 0,
            createTime: db.serverDate(),
            creatorId: 'system',
            recommendReason: activity.reason
          }
        })
        return {
          _id: result._id,
          ...activity,
          status: '报名中',
          currentParticipants: 0,
          creatorId: 'system',
          recommendReason: activity.reason
        }
      })
    )

    // 返回推荐结果
    return {
      success: true,
      data: createdActivities
    }

  } catch (error) {
    console.error('推荐活动失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}