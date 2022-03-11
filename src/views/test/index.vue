<template>
  <div class="test-nuls" style="">
    <div>
      <div class="flex">
        <span>nuls数量：</span><el-input v-model="nulsVal"></el-input>
      </div>
      <div class="flex">
        <span>usdt数量：</span><el-input v-model="usdtVal"></el-input>
      </div>
    </div>
    <el-button @click="handleClisk">确认</el-button>
  </div>
</template>

<script>

export default {
  data() {
    return {
      nulsVal: '',
      usdtVal: ''
    };
  },

  methods: {
    async handleClisk() {
      try {
        const nabox = window.nabox;
        const data = {
          from: nabox.selectedAddress,
          value: this.nulsVal,
          contractAddress: "tNULSeBaN58rJgMb1oGbjpDhH7yDRatY2ZVbU5",
          methodName: "receiveAllAssets",
          methodDesc: "",
          args: [],
          multyAssetValues: [[this.usdtVal, 5, 74]]
        }
        const res = await nabox.contractCall(data) // 返回交易hash
        this.$message.success(res);
      } catch (e) {
        this.$message.error(e)
      }
    }
  }
}
</script>

<style lang="less">
.test-nuls {
  padding: 20px 20px 0;
  text-align: center;
  .flex {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    span {
      width: 120px;
      margin-right: 10px;
    }
  }
}

</style>
