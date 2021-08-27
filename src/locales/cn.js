import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

const cn = {
  header: {
    header1: "交易记录",
    header2: "网络账户",
    header3: "资产上架",
    header4: "审计报告",
    header5: "当前网络",
    header6: "语言",
    header7: "社区",
    header8: "退出钱包",
    header9: "Nerve钱包",
  },
  home: {
    home1: "生成多链地址",
    home2: "手续费全部用于链上交易，NerveBridge未收取任何费用",
    home3: "可用: ",
    home4: "从",
    home5: "到",
    home6: "资产(网络)",
    home7: "余额或手续费不足",
    // home8: "metamask网络与bridge网络不一致",
    home8: "网络错误",
    home9: "合约地址: ",
    home10: "点击授权",
    home11: "加速",
    home12: "查询闪兑费用失败，请稍后重试",
    home13: "Swap",
    home14: "Cross-chain",
    home15: "跨链交易在各条链上确认时间较长，需数分钟， 请耐心等待",
    home16: "接收地址",
    home17: "发送",
    home18: "获得",
    home19: "订单确认",
    home20: "确认",
    home21: "发送",
    home22: "接收",
    home23: "所有手续费由第三方平台收取，NerveBridge未收取任何费用",
    home24: "输入代币名称或合约地址",
    home25: "请等待当前交易完成再发送下一笔",
  },
  public: {
    amount: "数量",
    fee: "手续费",
    next: "下一步",
    filter: "筛选",
    loading: "加载中...",
    noMore: "没有更多了",
    confirmed: "已确认",
    pending: "未确认",
    copySuccess: "已复制到剪切板",
    time: "时间"
  },
  accounts: {
    accounts1: "网络账户",
    accounts2: "所有网络账户地址，均为当前网络账户推导而出由当前网络账户私钥控制",
  },
  txList: {
    txList1: "交易记录",
    txList2: "发起网络",
    txList3: "接收网络",
    txList4: "进行中",
    txList5: "失败",
    txList6: "已完成",
    txList7: "兑换资产",
    txList8: "接收资产",
  },
  txDetail: {
    txDetail1: "交易详情",
    txDetail2: "(转入网络费用)",
    txDetail3: "(闪兑提现手续费)",
    txDetail4: "重新发送",
  },
  transfer: {
    transfer1: "转账",
    transfer2: "发起跨链交易",
    transfer3: "转入网络费用",
    transfer4: "将手续费兑换为NVT",
    transfer5: "将资产转入目标网络",
    transfer6: "交易数据丢失, 请重新操作",
    transfer7: "去中心化跨链需进行多次签名，中断签名将导致交易失败"
  },
  tips: {
    tips1: "交易已发出，等待区块确认",
    tips2: "获取闪兑信息失败",
    tips3: "未检测到Metamask",
    tips4: "网络异常，同步账户失败，请稍后再试",
    tips5: "派生多链地址失败",
    tips6: "交易失败，请稍后再试",
    tips7: "查询余额失败",
    tips8: "最小兑换数量: ",
    tips9: "最大兑换数量: ",
    tips10: "创建订单失败",
    tips11: "当前网络与交易网络不一致",
  },

  crossStatusType: {
    // 0: "跨链交易发起链未确认",
    // 1: "跨链交易发起链已确认",
    // 2: "等待广播闪对交易",
    // 3: "闪兑交易已广播待确认",
    // 4: "闪兑交易广播失败",
    // 5: "等待广播NERVE跨链交易",
    // 6: "跨链交易NERVE链已广播待确认",
    // 7: "跨链交易NERVE链广播失败",
    // 8: "目标链已确认",
    // 9: "跨链交易失败",
    0: "确认中",
    1: "确认中",
    2: "确认中",
    3: "确认中",
    4: "失败",
    5: "确认中",
    6: "确认中",
    7: "失败",
    8: "已确认",
    9: "失败",
    noFee: "未转入网络费用"
    // 1: "跨链交易发起链已确认",
    // 2: "跨链交易NERVE链已广播交易待确认",
    // 3: "跨链交易NERVE链广播失败",
    // 4: "目标链已确认",
    // 5: "跨链交易失败",
  },
  swftStatusType: {
    wait_deposit_send: "等待存币发送",
    timeout: "超时",
    wait_exchange_push: "等待交换信息推送",
    wait_exchange_return: "等待交换信息返回",
    wait_receive_send: "等待接收币种发送", 
    wait_receive_confirm: "等待接收币种确认", 
    receive_complete: "接收币种确认完成",
    wait_refund_send: "等待退原币币种发送",
    wait_refund_confirm: "等待退原币币种确认",
    refund_complete: "退原币币种确认完成",
    "ERROR/error": "正在处理的订单" ,
    WAIT_KYC: "等待进行KYC或联系客服提供链接"
  },

  ...zhLocale
};
export default cn
