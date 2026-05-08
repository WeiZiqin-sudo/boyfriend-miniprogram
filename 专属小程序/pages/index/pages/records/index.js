// 哥哥查看记录页面：与首页共用云库 service_records
const HOME_PAGE = "pages/index/pages/index/index";

Page({
  db: null,

  data: {
    records: [],
    loading: true,
    loadError: false
  },

  onLoad() {
    this.initCloudDb();
  },

  onShow() {
    if (this.db) {
      this.loadRecordsFromCloud();
    } else {
      this.initCloudDb();
      if (this.db) {
        this.loadRecordsFromCloud();
      } else {
        this.setData({ loading: false, records: [], loadError: true });
        wx.showToast({
          title: "云开发未就绪",
          icon: "none"
        });
      }
    }
  },

  initCloudDb() {
    const app = getApp();
    const cloudEnabled = app && app.globalData && app.globalData.cloudEnabled;
    if (!cloudEnabled || !wx.cloud) return;

    try {
      this.db = wx.cloud.database();
    } catch {
      this.db = null;
    }
  },

  loadRecordsFromCloud() {
    if (!this.db) {
      this.setData({ loading: false, records: [], loadError: true });
      return;
    }

    this.setData({ loading: true, loadError: false });
    wx.showLoading({ title: "加载中..." });

    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - oneMonthMs;

    this.db
      .collection("service_records")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()
      .then((res) => {
        wx.hideLoading();
        const records = (res.data || []).filter(
          (record) => !record.createdAt || record.createdAt >= cutoff
        );
        this.setData({ records, loading: false, loadError: false });
      })
      .catch(() => {
        wx.hideLoading();
        this.setData({ records: [], loading: false, loadError: true });
        wx.showToast({
          title: "加载失败",
          icon: "none"
        });
      });
  },

  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: "/" + HOME_PAGE });
      }
    });
  }
});
