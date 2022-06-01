<template>
  <div class="my-fee fee">
    <span class="label">{{ $t("public.fee") }}</span>
    <slot></slot>
  </div>
</template>

<script>

export default {
  props: {
    label: String
  },
  mounted() {
    /*
      tooltip插入到指定元素内
    */
    // this.$refs.wrap.appendChild(
    //   this.$refs.mypop.popperVM.$el
    // )
  }
}

</script>
<style lang="less">
.my-fee {
  display: flex;
  justify-content: space-between;
  .el-tooltip__popper {
    top: auto!important;
    bottom: 20px;
  }
}
/*.new-tooltip-wrap {
  position: relative;
  width: 100%;
}*/
</style>
