<template>
  <div class="my-fee fee">
    <span class="label">{{ $t("public.fee") }}</span>
<!--      <el-tooltip
        effect="dark"
        :content="label || $t('home.home2')"
        placement="top"
        :append-to-body="false"
        ref="mypop"
      >
        <span class="el-icon-info"></span>
      </el-tooltip>
      <div class=new-tooltip-wrap ref="wrap"></div>-->
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