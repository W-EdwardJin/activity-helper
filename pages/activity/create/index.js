// pages/activity/create/index.js
Page({
  data: {
    // 表单数据
    startTime: '',
    endTime: '',
    activityType: '',
    fileList: [],
    maxParticipants: '',
    location: '', // 活动地点

    // 时间选择器相关
    currentDate: new Date().getTime(),
    minDate: new Date().getTime(),
    showStartTimePicker: false,
    showEndTimePicker: false,

    // 活动类型选择器
    showActivityTypePicker: false,
    activityTypes: ['聚会', '运动', '聚餐', '旅行', '会议', '其他'],

    // 上传相关
    uploadPath: 'activity-covers/',
    cloudPath: ''
  },

  // 开始时间选择器
  showStartTimePicker() {
    this.setData({ showStartTimePicker: true });
  },

  closeStartTimePicker() {
    this.setData({ showStartTimePicker: false });
  },

  onStartTimeConfirm(event) {
    const date = new Date(event.detail);
    this.setData({
      startTime: this.formatDate(date),
      showStartTimePicker: false
    });
  },

  // 结束时间选择器
  showEndTimePicker() {
    this.setData({ showEndTimePicker: true });
  },

  closeEndTimePicker() {
    this.setData({ showEndTimePicker: false });
  },

  onEndTimeConfirm(event) {
    const date = new Date(event.detail);
    this.setData({
      endTime: this.formatDate(date),
      showEndTimePicker: false
    });
  },

  // 活动类型选择器
  showActivityTypePicker() {
    this.setData({ showActivityTypePicker: true });
  },

  closeActivityTypePicker() {
    this.setData({ showActivityTypePicker: false });
  },

  onActivityTypeConfirm(event) {
    const { value } = event.detail;
    this.setData({
      activityType: value,
      showActivityTypePicker: false
    });
  },

  // 图片上传
  afterRead(event) {
    const { file } = event.detail;
    const { fileList = [] } = this.data;
    fileList.push({ ...file, status: 'uploading', message: '上传中' });
    this.setData({ fileList });

    // 上传图片到云存储
    const cloudPath = `activity/${Date.now()}-${Math.random().toString(36).substr(2)}.${file.url.match(/\.([^.]+)$/)[1]}`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath: file.url,
      success: (res) => {
        fileList[fileList.length - 1].url = res.fileID;
        fileList[fileList.length - 1].status = 'done';
        this.setData({ fileList });
      },
      fail: () => {
        fileList[fileList.length - 1].status = 'failed';
        fileList[fileList.length - 1].message = '上传失败';
        this.setData({ fileList });
      }
    });
  },

  deleteImage(event) {
    const { index } = event.detail;
    const { fileList } = this.data;
    fileList.splice(index, 1);
    this.setData({ fileList });
  },

  // 表单提交
  async onSubmit(event) {
    const formData = event.detail.value;
    const { fileList } = this.data;

    try {
      const db = wx.cloud.database();
      await db.collection('activity').add({
        data: {
          ...formData,
          coverImage: fileList[0]?.url || '',
          creatorId: wx.getStorageSync('userId'),
          status: '报名中',
          currentParticipants: 0,
          createTime: db.serverDate()
        }
      });

      wx.showToast({
        title: '创建成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.showToast({
        title: '创建失败',
        icon: 'error'
      });
    }
  },

  // 日期格式化
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
  // 选择地点
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res.name + ' - ' + res.address
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '选择地点失败',
          icon: 'none'
        });
      }
    });
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
})