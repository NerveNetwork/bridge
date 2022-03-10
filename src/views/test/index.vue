<template>
  <div class="test-nuls" style="text-align: center;padding-top: 20px">
    <el-button @click="handleClisk">点我</el-button>
  </div>
</template>

<script>

export default {
  data() {
    return {

    };
  },

  methods: {
    async handleClisk() {
      const nabox = window.nabox;
      const data = {
        from: nabox.selectedAddress,
        value: 1,
        contractAddress: "tNULSeBaN58rJgMb1oGbjpDhH7yDRatY2ZVbU5",
        methodName: "receiveAllAssets",
        methodDesc: "",
        args: [],
        multyAssetValues: [["1", 5, 1]]
      }
      const res = await nabox.contractCall(data) // 返回交易hash
    }
  }
}
</script>

<style lang="less">


</style>
