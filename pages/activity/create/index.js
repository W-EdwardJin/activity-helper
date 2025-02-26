// pages/activity/create/index.js
Page({
  data: {
    // 表单数据
    activityTitle: '',
    activityType: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: 20,
    activityDetails: '',
    fileList: [],
    location: '', // 活动地点

    // 时间选择器相关
    currentDate: new Date().getTime(),
    currentTime: '12:00',
    minDate: new Date().getTime(),
    showStartTimePicker: false,
    showEndTimePicker: false,
    formatter: function(type, value) {
      if (type === 'year') {
        return value + '年';
      } else if (type === 'month') {
        return value + '月';
      } else if (type === 'day') {
        return value + '日';
      } else if (type === 'hour') {
        return value + '时';
      } else if (type === 'minute') {
        return value + '分';
      }
      return value;
    },

    // 活动类型选择器
    showActivityTypePicker: false,
    activityTypes: ['聚会', '运动', '聚餐', '旅行', '会议', '其他'],

    // 地图选择器
    showLocationPicker: false,
    latitude: 39.9,
    longitude: 116.4
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

  // 日期选择器
  showDatePicker() {
    this.setData({ showDatePicker: true });
  },

  closeDatePicker() {
    this.setData({ showDatePicker: false });
  },

  onDateConfirm(event) {
    const date = new Date(event.detail);
    this.setData({
      activityDate: this.formatDate(date),
      showDatePicker: false
    });
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

  // 地点选择器
  showLocationPicker() {
    this.setData({ showLocationPicker: true });
  },

  closeLocationPicker() {
    this.setData({ showLocationPicker: false });
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
          showLocationPicker: false
        });
      }
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
    const app = getApp();
    if (!app.globalData.userInfo) {
      wx.navigateTo({
        url: '/pages/user/login/index'
      });
      return;
    }

    const formData = event.detail.value;
    const { fileList } = this.data;

    // 表单验证
    if (!formData.title) {
      wx.showToast({
        title: '请输入活动标题',
        icon: 'none'
      });
      return;
    }

    if (!this.data.startTime) {
      wx.showToast({
        title: '请选择开始时间',
        icon: 'none'
      });
      return;
    }

    if (!this.data.endTime) {
      wx.showToast({
        title: '请选择结束时间',
        icon: 'none'
      });
      return;
    }

    if (!formData.location) {
      wx.showToast({
        title: '请选择活动地点',
        icon: 'none'
      });
      return;
    }

    if (!this.data.activityType) {
      wx.showToast({
        title: '请选择活动类型',
        icon: 'none'
      });
      return;
    }

    // 用户登录状态已在前面验证，无需重复检查

    try {
      const db = wx.cloud.database();
      await db.collection('activity').add({
        data: {
          title: formData.title,
          type: this.data.activityType,
          startTime: this.data.startTime,
          endTime: this.data.endTime,
          location: formData.location,
          maxParticipants: parseInt(this.data.maxParticipants) || 20,
          details: formData.details,
          coverImage: fileList[0]?.url || '',
          creatorId: app.globalData.userInfo._id,
          status: '报名中',
          createTime: db.serverDate(),
          participants: []
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
      console.error('创建活动失败:', error);
      wx.showToast({
        title: error.message || '创建失败，请稍后重试',
        icon: 'none'
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