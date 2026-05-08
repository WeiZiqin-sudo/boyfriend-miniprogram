const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const configRes = await db.collection("app_config").doc("notify_config").get();
  const config = configRes.data || {};

  if (!config.receiverOpenId || !config.templateId) {
    return {
      success: false,
      message: "notify_config 未配置 receiverOpenId/templateId"
    };
  }

  const content = (event.content || "有新的心愿提交").slice(0, 20);
  const date = event.date || "";
  const page = event.page || "pages/index/pages/index/index";

  await cloud.openapi.subscribeMessage.send({
    touser: config.receiverOpenId,
    templateId: config.templateId,
    page,
    data: {
      thing1: { value: "收到新的专属需求" },
      thing2: { value: content },
      time3: { value: date || new Date().toLocaleString() }
    },
    miniprogramState: "formal"
  });

  return {
    success: true
  };
};
