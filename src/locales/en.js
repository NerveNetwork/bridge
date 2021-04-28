import enLocale from 'element-ui/lib/locale/lang/en'

const en = {
  header: {
    header1: "Transactions",
    header2: "Addresses",
    header3: "Submit Token",
    header4: "Audit Report",
    header5: "Current Network",
    header6: "Language",
    header7: "Community",
    header8: "Quit",
  },
  home: {
    home1: "Import Addresses",
    home2: "All fees are used for on-chain transactions and NerveBridge charge nothing",
    home3: "Avaliable: ",
    home4: "From",
    home5: "To",
    home6: "Choose Asset",
    home7: "Balance or fee is not enough",
    home8: "Metamask network is inconsistent with DApp network",
    home9: "Contract: ",
    home10: "Approve",
    home11: "Speed up",
    home12: "Failed to check flash fee, please try again later",
  },
  public: {
    amount: "Amount",
    fee: "Fees",
    next: "Next",
    filter: "Select",
    loading: "Loading",
    noMore: "No More",
    confirmed: "Confirmed",
    pending: "Unconfirmed",
    copySuccess: "Copied to clipboard",
    time: "Date"
  },
  accounts: {
    accounts1: "Network Address",
    accounts2: "All network account addresses are derived from the current network account and controlled by its private key",
  },
  txList: {
    txList1: "Tansactions",
    txList2: "Start",
    txList3: "Receive",
    txList4: "Processing",
    txList5: "Failed",
    txList6: "Finished",
  },
  txDetail: {
    txDetail1: "Detail",
    txDetail2: "(Transfer swap fee)",
    txDetail3: "(Swap withdrwa fee)",
  },
  transfer: {
    transfer1: "Transfer",
    transfer2: "Transfer into Nerve",
    transfer3: "Transfer fee",
    transfer4: "Swap fee to NVT",
    transfer5: "Transfer into destination network",
    transfer6: "Transaction data lost，pls try again",
  },
  tips: {
    tips1: "Transaction has been sent, waiting for block confirmation",
    tips2: "Failed to query swap information",
  },

  crossStatusType: {
    0: "Initiation chain unconfirmed",
    1: "Initiation chain confirmed",
    2: "Waiting for the broadcast swap transaction",
    3: "Swap transaction unconfirmed",
    4: "Swap transaction broadcast failed",
    5: "Waiting to broadcast NERVE transaction",
    6: "NERVE broadcast to be confirmed",
    7: "NERVE broadcast failed",
    8: "Destination chain confirmed",
    9: "Failed",
    // 1: "跨链交易发起链已确认",
    // 2: "跨链交易NERVE链已广播交易待确认",
    // 3: "跨链交易NERVE链广播失败",
    // 4: "目标链已确认",
    // 5: "跨链交易失败",
  },
  ...enLocale

};
export default en
