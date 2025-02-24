// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 查询用户是否已存在
    const db = cloud.database()
    const userCollection = db.collection('user')
    
    let user = await userCollection.where({
      openid: wxContext.OPENID
    }).get()

    // 如果用户不存在，则创建新用户
    if (!user.data.length) {
      const newUser = {
        openid: wxContext.OPENID,
        createTime: db.serverDate(),
        nickName: '',
        avatarUrl: ''
      }
      
      await userCollection.add({
        data: newUser
      })
      
      user = {
        data: [newUser]
      }
    }

    return {
      success: true,
      userInfo: user.data[0]
    }
  } catch (err) {
    console.error('[云函数] [login] 调用失败：', err)
    return {
      success: false,
      error: err
    }
  }
}