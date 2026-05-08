/**
 * 小程序全局入口文件
 * 真机调试必须存在 app.js，否则会报 entry file app.js not found
 */
App({
  onLaunch() {
    // TODO: 把这里替换成你自己的云开发环境 ID（在微信开发者工具「云开发控制台」可查看）
    const envId = "cloudbase-4gnr95vpe9898ed4";

    // 初始化云开发（启用后即可使用云数据库）
    if (wx.cloud) {
      wx.cloud.init({
        env: envId,
        traceUser: true
      });
      this.globalData.cloudEnabled = true;
    } else {
      this.globalData.cloudEnabled = false;
    }

    this.globalData.envId = envId;
  },

  globalData: {
    envId: "",
    cloudEnabled: false
  }
});
