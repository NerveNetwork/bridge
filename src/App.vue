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
