// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const db = cloud.database()
    const userCollection = db.collection('user')
    
    // 更新用户信息
    await userCollection.where({
      openid: wxContext.OPENID
    }).update({
      data: {
        nickName: event.nickName,
        avatarUrl: event.avatarUrl,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('[云函数] [updateUserProfile] 调用失败：', err)
    return {
      success: false,
      error: err
    }
  }
}