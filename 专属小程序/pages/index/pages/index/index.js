/**
 * 首页逻辑：小宝大人的专属男友服务菜单
 * 你可以重点替换这些内容：
 * 1) 电话号码：this.data.phoneNumber
 * 2) 轮播图片：bannerList 中的 /images/xxx.png 路径
 * 3) 各板块文案：feedList / playList / privilegeList / help 文案
 */
Page({
  db: null,

  data: {
    // 已按你的要求改为目标电话
    phoneNumber: "18851211888",

    // 吸顶导航配置
    navList: [
      { id: "feed", label: "🍯专属投喂" },
      { id: "play", label: "🎈陪玩服务" },
      { id: "help", label: "🆘紧急求助" },
      { id: "vip", label: "✨专属特权" }
    ],
    activeNav: "feed",

    // scroll-into-view 目标 id
    scrollIntoViewId: "",

    // 轮播卡片（用可爱表情，不依赖图片资源）
    bannerList: [
      { emoji: "🥰", title: "今日超爱你", sub: "哥哥把偏爱写在每一秒" },
      { emoji: "🍯", title: "甜甜投喂", sub: "你一开口我就去安排" },
      { emoji: "🧸", title: "抱抱续费", sub: "小宝大人永远优先" }
    ],

    // 专属投喂区
    feedList: [
      {
        emoji: "🧋",
        name: "奶茶补给",
        desc: "示例：三分糖珍珠奶茶 / 生椰拿铁 / 热可可",
        modalMsg: "奶茶需求收到，哥哥立刻去安排！"
      },
      {
        emoji: "🍎",
        name: "水果拼盘",
        desc: "示例：草莓+蓝莓+橙子，或你指定想吃的",
        modalMsg: "水果拼盘已接单，哥哥马上送上门～"
      },
      {
        emoji: "🥘",
        name: "家常菜投喂",
        desc: "示例：番茄炒蛋、可乐鸡翅、青椒土豆丝、排骨汤",
        modalMsg: "家常菜菜单已打开，哥哥按小宝大人口味做！"
      },
      {
        emoji: "🍰",
        name: "甜品安抚",
        desc: "示例：提拉米苏、小蛋糕、冰淇淋、双皮奶",
        modalMsg: "甜品抱抱券已生效，先吃一口再开心一点点～"
      },
      {
        emoji: "🍜",
        name: "暖胃夜宵",
        desc: "示例：馄饨、面条、粥、煎饺，暖胃也暖心",
        modalMsg: "夜宵雷达启动！热腾腾幸福马上到。"
      }
    ],

    // 陪玩服务区
    playList: [
      {
        emoji: "🔺",
        name: "三角洲行动",
        desc: "可陪练、并肩作战、语音报点，全程认真护航",
        modalMsg: "三角洲已上线，哥哥申请成为你的战术搭子！"
      },
      {
        emoji: "👑",
        name: "王者荣耀",
        desc: "排位上分、娱乐开黑、情侣组合都可以",
        modalMsg: "王者房间已开，哥哥准备好全程护着你啦～"
      },
      {
        emoji: "♟️",
        name: "金铲铲之战",
        desc: "陪玩思路讲解、阵容建议、快乐双排",
        modalMsg: "金铲铲已就位，哥哥带你快乐吃分～"
      },
      {
        emoji: "🛍️",
        name: "出去逛街",
        desc: "拎包、拍照、选店、排队，今日全程陪同",
        modalMsg: "逛街模式已开启，哥哥今天负责体力和夸夸！"
      },
      {
        emoji: "✈️",
        name: "旅游计划",
        desc: "一起做攻略、订行程、规划拍照打卡路线",
        modalMsg: "旅游搭子就位！哥哥来做攻略，让你只负责开心。"
      }
    ],

    // 专属特权清单
    privilegeList: [
      { emoji: "👑", text: "优先哄哄权：你永远拥有第一顺位安抚通道" },
      { emoji: "🧸", text: "无限抱抱权：线上线下都有效，长期自动续费" },
      { emoji: "💌", text: "碎碎念直达权：任何时刻都可以找我倾诉" }
    ],

    // 每日签到状态
    signDays: [false, false, false, false, false, false, false],
    signCount: 0,
    wishCount: 0,
    lastSignDate: "",

    // 自定义输入弹窗（支持自由填写）
    showCustomModal: false,
    modalServiceTitle: "",
    modalPlaceholder: "请输入你想要的具体内容",
    customInputValue: "",
    modalMsgForConfirm: "",
    modalMode: "service",
    wishRecords: [],
    // TODO: 替换成你在「订阅消息」里申请到的模板 ID
    notifyTemplateId: "YOUR_SUBSCRIBE_TEMPLATE_ID",
    receiverOpenId: "",
    
    // 查看记录相关
    showRecords: false,
    records: [],

    // 记录每个板块在滚动区内的大致顶部位置（rpx 近似换算后）
    sectionTopMap: {
      feed: 0,
      play: 520,
      help: 1040,
      vip: 1680
    }
  },

  onLoad() {
    this.initCloudDb();
    this.initSignData();
    this.loadWishRecordsFromCloud();
    this.loadNotifyConfig();
  },

  /**
   * 点击吸顶导航：更新激活态，并滚动到对应板块
   */
  onNavTap(e) {
    const target = e.currentTarget.dataset.target;
    this.setData({
      activeNav: target,
      scrollIntoViewId: target
    });
  },

  /**
   * 根据滚动位置更新导航高亮
   * 为了简单稳定，这里使用预估区间法（无需复杂节点测量）
   */
  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    const topMap = this.data.sectionTopMap;
    let current = "feed";

    if (scrollTop >= topMap.vip - 120) {
      current = "vip";
    } else if (scrollTop >= topMap.help - 120) {
      current = "help";
    } else if (scrollTop >= topMap.play - 120) {
      current = "play";
    }

    if (current !== this.data.activeNav) {
      this.setData({ activeNav: current });
    }
  },

  /**
   * 通用召唤按钮：打开可自由填写的自定义弹窗
   */
  onSummonTap(e) {
    const { title, msg } = e.currentTarget.dataset;
    this.setData({
      showCustomModal: true,
      modalServiceTitle: title || "专属服务",
      modalPlaceholder: "例如：口味、数量、时间、地点、预算等都可以写",
      // 用于确认文案，保存在 data 上更直观
      modalMsgForConfirm: msg || "请求已送达，哥哥正在火速赶来宠你～",
      modalMode: "service",
      customInputValue: ""
    });
  },

  onCustomInput(e) {
    this.setData({
      customInputValue: e.detail.value
    });
  },

  onCloseCustomModal() {
    this.setData({
      showCustomModal: false
    });
  },

  onConfirmCustomModal() {
    const { modalServiceTitle, customInputValue, modalMsgForConfirm, modalMode, wishCount, wishRecords } = this.data;

    if (modalMode === "wish") {
      if (!customInputValue.trim()) {
        wx.showToast({
          title: "请先填写心愿内容",
          icon: "none"
        });
        return;
      }

      const nextWishCount = wishCount - 1;
      const nextRecords = [
        {
          content: customInputValue.trim(),
          date: this.getTodayString()
        },
        ...wishRecords
      ];

      this.setData({
        showCustomModal: false,
        wishCount: nextWishCount,
        wishRecords: nextRecords
      });
      this.saveSignData();
      this.saveWishToCloud(nextRecords[0]);
      this.sendSubmissionNotify({
        type: "心愿申请",
        content: nextRecords[0].content,
        date: nextRecords[0].date
      });

      wx.showModal({
        title: "心愿申请已提交",
        content: `哥哥已收到本次心愿：${customInputValue.trim()}\n\n当前剩余心愿申请权：${nextWishCount} 次`,
        showCancel: false,
        confirmText: "好耶",
        confirmColor: "#C08A6B"
      });
      return;
    }

    const detailText = customInputValue
      ? `\n\n你的备注：${customInputValue}`
      : "\n\n你还没填写细节，哥哥先按最贴心的方案来。";

    // 添加到记录列表
    const newRecord = {
      id: Date.now(),
      serviceType: modalServiceTitle || "专属服务",
      content: customInputValue.trim() || "未填写备注，按默认贴心方案执行",
      createTime: this.getTodayString(),
      createdAt: Date.now(),
      status: "pending"
    };
    
    const currentRecords = this.data.records || [];
    const nextRecords = [newRecord, ...currentRecords];

    this.setData({
      showCustomModal: false,
      records: nextRecords
    });

    // 保存到云数据库
    this.saveRecordToCloud(newRecord);
    this.sendSubmissionNotify({
      type: modalServiceTitle || "专属服务",
      content: newRecord.content,
      date: newRecord.createTime
    });
  },

  /**
   * 使用一次心愿申请权（可填写具体心愿并消耗次数）
   */
  onUseWishTap() {
    const { wishCount } = this.data;
    if (wishCount <= 0) {
      wx.showToast({
        title: "心愿申请权不足，先去签到吧",
        icon: "none"
      });
      return;
    }

    this.setData({
      showCustomModal: true,
      modalServiceTitle: "心愿申请",
      modalPlaceholder: "写下你这次的心愿内容（例如：想吃什么、想去哪里、想要什么惊喜）",
      modalMsgForConfirm: "",
      modalMode: "wish",
      customInputValue: ""
    });
  },

  /**
   * 紧急求助的非拨号入口
   */
  onHelpTap(e) {
    const type = e.currentTarget.dataset.type;
    const modalMap = {
      emotion: {
        title: "情绪急救站已开启",
        content: "小宝大人先深呼吸，我在这里抱住你。你可以慢慢说，我会一直听。"
      },
      peace: {
        title: "吵架和解通道接入中",
        content: "先给你一个台阶也给我一个台阶，我们是同一队，不是对立面。"
      },
      night: {
        title: "深夜树洞营业中",
        content: "夜色很安静，我也很认真。你的每一句碎碎念，我都想珍藏。"
      }
    };

    const targetModal = modalMap[type] || {
      title: "专属通道已开启",
      content: "你的信号我收到啦，哥哥现在就来。"
    };

    wx.showModal({
      title: targetModal.title,
      content: targetModal.content,
      showCancel: false,
      confirmText: "抱抱",
      confirmColor: "#C08A6B"
    });
  },

  /**
   * 紧急拨号：调用微信原生 API
   */
  onEmergencyCall() {
    const phone = this.data.phoneNumber;

    if (!phone || phone === "13800138000") {
      wx.showModal({
        title: "请先设置号码",
        content: "请在 pages/index/index.js 中，把 phoneNumber 改成你的真实号码。",
        showCancel: false,
        confirmText: "我知道啦",
        confirmColor: "#C08A6B"
      });
      return;
    }

    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({
          title: "拨号失败，请稍后重试",
          icon: "none"
        });
      }
    });
  },

  /**
   * 初始化签到数据（本地缓存）
   */
  initSignData() {
    const signData = wx.getStorageSync("dailySignData");
    if (!signData) return;
    this.setData({
      signDays: signData.signDays || [false, false, false, false, false, false, false],
      signCount: signData.signCount || 0,
      wishCount: signData.wishCount || 0,
      lastSignDate: signData.lastSignDate || "",
      wishRecords: signData.wishRecords || []
    });
  },

  /**
   * 初始化云数据库连接
   */
  initCloudDb() {
    const app = getApp();
    const cloudEnabled = app && app.globalData && app.globalData.cloudEnabled;
    if (!cloudEnabled || !wx.cloud) return;

    try {
      this.db = wx.cloud.database();
    } catch (error) {
      this.db = null;
    }
  },

  /**
   * 从云数据库读取心愿记录（若云环境未配置则自动跳过）
   */
  loadWishRecordsFromCloud() {
    if (!this.db) return;

    this.db
      .collection("wish_records")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get()
      .then((res) => {
        const cloudRecords = (res.data || []).map((item) => ({
          content: item.content || "",
          date: item.date || ""
        }));

        if (cloudRecords.length > 0) {
          this.setData({
            wishRecords: cloudRecords
          });
          this.saveSignData();
        }
      })
      .catch(() => {
        // 云端读取失败时不打断页面，继续使用本地缓存
      });
  },

  /**
   * 读取提醒配置（接收人 openid）
   */
  loadNotifyConfig() {
    if (!this.db) return;
    this.db
      .collection("app_config")
      .doc("notify_config")
      .get()
      .then((res) => {
        const data = res.data || {};
        this.setData({
          receiverOpenId: data.receiverOpenId || ""
        });
      })
      .catch(() => {
        // 未配置时保持空
      });
  },

  /**
   * 跳转到查看记录页面
   */
  goToRecords() {
    wx.navigateTo({
      url: '/pages/index/pages/records/index'
    });
  },

  /**
   * 切换记录显示
   */
  toggleRecords() {
    const showRecords = !this.data.showRecords;
    if (showRecords === true) {
      this.loadRecordsFromCloud();
    }
    this.setData({ showRecords });
  },

  /**
   * 从云数据库加载记录
   */
  loadRecordsFromCloud() {
    if (!this.db) {
      this.setData({ records: [] });
      return;
    }

    wx.showLoading({ title: '加载中...' });

    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - oneMonthMs;

    this.db.collection("service_records")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()
      .then((res) => {
        wx.hideLoading();

        const filteredRecords = (res.data || []).filter(
          (record) => !record.createdAt || record.createdAt >= cutoff
        );

        this.setData({ records: filteredRecords });
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
        this.setData({ records: [] });
      });
  },

  /**
   * 标记为已完成
   */
  markAsCompleted(e) {
    const id = e.currentTarget.dataset.id;
    const records = this.data.records.map(item => {
      if (item.id === id && item.status === 'pending') {
        return { ...item, status: 'completed' };
      }
      return item;
    });
    this.setData({ records });
    wx.showToast({
      title: '已完成',
      icon: 'success'
    });

    // 更新云数据库
    this.updateRecordStatusInCloud(id, 'completed');
  },

  /**
   * 更新云数据库中的记录状态
   */
  updateRecordStatusInCloud(id, status) {
    if (!this.db) return;

    this.db.collection("service_records")
      .where({ id: id })
      .update({
        data: {
          status: status
        }
      })
      .catch(() => {
        // 云端更新失败时不打断本地流程
      });
  },

  /**
   * 写入云数据库（云环境不可用时自动跳过）
   */
  saveWishToCloud(record) {
    if (!this.db || !record) return;

    this.db.collection("wish_records").add({
      data: {
        content: record.content,
        date: record.date,
        createdAt: Date.now()
      }
    }).catch(() => {
      // 云端写入失败时不打断本地流程
    });
  },

  /**
   * 保存记录到云数据库
   */
  saveRecordToCloud(record) {
    if (!this.db || !record) return;

    this.db.collection("service_records").add({
      data: {
        id: record.id,
        serviceType: record.serviceType,
        content: record.content,
        createTime: record.createTime,
        createdAt: record.createdAt,
        status: record.status
      }
    }).then(() => {
      wx.showToast({
        title: '记录已保存',
        icon: 'success'
      });
    }).catch(() => {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    });
  },

  /**
   * 一次性开启自动提醒：
   * 1) 获取当前用户 openid 作为接收人
   * 2) 请求订阅消息授权
   * 3) 保存配置，后续她提交会自动提醒
   */
  onSubscribeNotify() {
    const templateId = this.data.notifyTemplateId;
    if (!templateId || templateId === "YOUR_SUBSCRIBE_TEMPLATE_ID") {
      wx.showModal({
        title: "先配置模板ID",
        content: "请先在 index.js 把 notifyTemplateId 换成真实订阅消息模板 ID。",
        showCancel: false
      });
      return;
    }
    if (!wx.cloud || !this.db) {
      wx.showToast({ title: "云开发未就绪", icon: "none" });
      return;
    }

    wx.cloud.callFunction({
      name: "getOpenId"
    }).then((res) => {
      const openid = res.result && res.result.openid;
      if (!openid) {
        wx.showToast({ title: "获取身份失败", icon: "none" });
        return;
      }

      wx.requestSubscribeMessage({
        tmplIds: [templateId],
        success: () => {
          this.db.collection("app_config").doc("notify_config").set({
            data: {
              receiverOpenId: openid,
              templateId,
              updatedAt: Date.now()
            }
          }).then(() => {
            this.setData({ receiverOpenId: openid });
            wx.showModal({
              title: "自动提醒已开启",
              content: "后续她每次提交心愿，你都会自动收到提醒消息。",
              showCancel: false
            });
          }).catch(() => {
            wx.showToast({ title: "保存配置失败", icon: "none" });
          });
        },
        fail: () => {
          wx.showToast({
            title: "授权失败或被拒绝",
            icon: "none"
          });
        }
      });
    });
  },

  /**
   * 提交后给哥哥发送订阅消息提醒（心愿/投喂/陪玩统一走这里）
   */
  sendSubmissionNotify(payload) {
    if (!wx.cloud || !payload) return;
    const summary = `${payload.type}：${payload.content}`;
    wx.cloud.callFunction({
      name: "sendWishNotify",
      data: {
        content: summary,
        date: payload.date,
        page: "pages/index/pages/index/index"
      }
    }).catch(() => {
      // 发送失败不影响主流程
    });
  },

  /**
   * 点击签到：一天只能签一次，连续签满 7 天 +1 心愿申请权
   */
  onSignTap() {
    const today = this.getTodayString();
    const { lastSignDate, signCount, signDays, wishCount } = this.data;

    if (lastSignDate === today) {
      wx.showToast({
        title: "今天已经签过啦",
        icon: "none"
      });
      return;
    }

    const nextCount = signCount + 1;
    const nextSignDays = signDays.map((item, index) => (index < nextCount ? true : item));

    // 满 7 天后，奖励 +1 并重置一周进度
    if (nextCount >= 7) {
      const resetDays = [false, false, false, false, false, false, false];
      const nextWish = wishCount + 1;

      this.setData({
        signDays: resetDays,
        signCount: 0,
        wishCount: nextWish,
        lastSignDate: today
      });
      this.saveSignData();

      wx.showModal({
        title: "签到满7天啦",
        content: "恭喜小宝大人解锁 1 次心愿申请权！哥哥已记录在案～",
        showCancel: false,
        confirmText: "开心收下",
        confirmColor: "#C08A6B"
      });
      return;
    }

    this.setData({
      signDays: nextSignDays,
      signCount: nextCount,
      lastSignDate: today
    });
    this.saveSignData();

    wx.showToast({
      title: `签到成功（第${nextCount}天）`,
      icon: "none"
    });
  },

  saveSignData() {
    const { signDays, signCount, wishCount, lastSignDate, wishRecords } = this.data;
    wx.setStorageSync("dailySignData", {
      signDays,
      signCount,
      wishCount,
      lastSignDate,
      wishRecords
    });
  },

  getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
});