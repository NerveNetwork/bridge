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
    header9: "Nerve Wallet",
    header10: 'The current plugin does not support the selected chain, do you want to switch plugins?',
    header11: 'Cancel',
    header12: 'Confirm',
    header13: 'Tips',
  },
  home: {
    home1: "Import Addresses",
    home2: "All fees are used for on-chain transactions and NerveBridge charge nothing",
    home3: "Avaliable: ",
    home4: "From",
    home5: "To",
    home6: "Assets",
    home7: "Balance or fee is not enough",
    // home8: "Metamask network is inconsistent with DApp network",
    home8: "Network error",
    home9: "Contract: ",
    home10: "Approve",
    home11: "Speed up",
    home12: "Failed to check flash fee, please try again later",
    home13: "Swap",
    home14: "Cross-chain",
    home15: "Cross-chain transactions take a long time to confirm on each chain, which takes several minutes, please wait patiently",
    home16: "Receving address",
    home17: "Send",
    home18: "Receive",
    home19: "Order confirmation",
    home20: "Confirm",
    home21: "Send",
    home22: "Receive",
    home23: "All fees are charged by the third-party platform, NerveBridge charge no fees",
    home24: "Enter the token symbol or address",
    home25: "Please wait for the current transaction to complete before sending the next one",
    home26: "Please select an assets",
    home27: "Pending Txs",
    home28: "Wrong Network",
    home29: "Select",
    home30: "Create order failed",
    home31: "Failed to get address",
    home32: "NULS contract asset transfer upgrading, pls be patient",
    home33: "Please log in to tronLink first.",
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
    time: "Date",
    noData: 'No Data',
    crossFee: 'Cross-chain fee',
    txFee: 'Transaction fee'
  },
  accounts: {
    accounts1: "Network Address",
    accounts2: "All network account addresses are derived from the current network account and controlled by its private key",
  },
  txList: {
    txList1: "Tansactions",
    txList2: "Source",
    txList3: "Target",
    txList4: "Processing",
    txList5: "Failed",
    txList6: "Finished",
    txList7: "Send asset",
    txList8: "Receive asset",
    txList9: "Payment requested",
    txList10: "Continue to send",
  },
  txDetail: {
    txDetail1: "Detail",
    txDetail2: "(Transfer network fee)",
    txDetail3: "(Swap withdrawal fee)",
    txDetail4: "Continue To Send",
    txDetail5: "Fees to be paid",
    txDetail6: "Available",
    txDetail7: " (5~10 minutes expected)",
    txDetail8: "User Support",
    txDetail9: "Bridge Fee",
  },
  transfer: {
    transfer1: "Transfer",
    transfer2: "Initiate cross-chain transaction",
    transfer3: "Transfer network fee",
    transfer4: "Swap fee to NVT",
    transfer5: "Transfer asset to target network",
    transfer6: "Transaction data lost，pls try again",
    transfer7: "Decentralized cross-chain requires multiple signatures. Interruption of signatures will result in transaction failure",
  },
  tips: {
    tips1: "Transaction has been sent, waiting for block confirmation",
    tips2: "Failed to query swap information",
    tips3: "Metamask not detected",
    tips4: "The network is abnormal, the account synchronization failed, please try again later",
    tips5: "Failed to derive multi-chain address",
    tips6: "Transfer Failed,pls try again later",
    tips7: "Failed to check balance",
    tips8: "Minimum exchange quantity: ",
    tips9: "Maximum exchange quantity",
    tips10: "Failed to create order",
    tips11: "The current network is inconsistent with the trading network",
    tips12: "Insufficient balance",
    tips13: "Failed to assemble cross-chain transaction",
    tips14: "Assembled NERVE withdrawal transaction failed",
    tips15: "Assembled cross-chain transfer transaction failed",
    tips16: "Assembly transferring fee transaction failed",
    tips17: "Broadcast transaction failed",
    tips18: "Failed to get cross-chain configuration",
    tips19: "Cross-chain channels need to be upgraded and maintained",
    tips20: "Failed to update order",
    tips21: 'Failed to calculate fee'
  },

  crossStatusType: {
    undefined: '',
    0: "Confirming",
    1: "Confirming",
    2: "Confirming",
    3: "Confirmed",
    4: "Failed",
    5: "Time out"
  },
  ...enLocale

};
export default en
