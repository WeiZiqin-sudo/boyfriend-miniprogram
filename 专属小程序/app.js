/**
 * 小程序全局入口文件
 * 预留：若你以后把项目根切回外层目录，也不会缺失入口
 */
App({
  globalData: {
    cloudEnabled: true
  },

  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        traceUser: true,
      });
    }
  }
});