// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  try {
    // 查询用户信息
    const userCollection = db.collection('user')
    let userInfo = await userCollection.where({
      openid: wxContext.OPENID
    }).get()

    // 如果用户不存在，创建新用户
    if (!userInfo.data.length) {
      await userCollection.add({
        data: {
          openid: wxContext.OPENID,
          appid: wxContext.APPID,
          unionid: wxContext.UNIONID,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
    }

    return {
      success: true,
      userInfo: userInfo.data[0] || {}
    }
  } catch (err) {
    console.error('[云函数] [login] 调用失败：', err)
    return {
      success: false,
      error: err
    }
  }
}