<template>
  <div id="app" class="app shadow">
    <HeaderBar v-show="$route.path !== '/transfer'" />
    <router-view>
    </router-view>
  </div>
</template>

<script>
  import HeaderBar from './components/HeaderBar'

  export default {
    data() {
      return {};
    },
    components: {
      HeaderBar,
    },
    mounted() {
      // var tx = [{orderId: 'f86e6c84-7f23-4199-a5ee-d5fd05666ccf', hash: '580d407fb464c1f113dd5de25bcad4627cf9b7577b91ed69f4d450b6c5615272'}, {orderId: '020d4680-3511-4bbe-a3f8-46137345a4fd', hash: 'bfad6f589fd751edde78b0b24070d991c3ae5ae375e87b78497967ae0d68f76b'}]
      // localStorage.setItem('unConfirmedTx', JSON.stringify(tx))
      // 检查是否有因为网络问题导致未更新的交易
      const unConfirmedTx = this.$store.state.unConfirmedTx;
      if (unConfirmedTx.length) {
        unConfirmedTx.forEach(tx => {
          const { hash, orderId } = tx;
          this.$store.dispatch('changeUnConfirmedTx', tx)
        })
      }
    }
  }
</script>

<style lang="less">
  @import "assets/css/base.less";

  .app {
    background-color: #ffffff;
    width: 100%;
    height: 100%;
    position: relative;
    @media screen and (min-width: 1200px) {
      width: 400px;
      height: 780px;
      margin: 0 auto;
    }
  }
  @media screen and (max-width: 1200px) {
    html, body {
      height: 100%;
    }
  }

</style>
