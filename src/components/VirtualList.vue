<template>
  <div class="virtual-list" :style="{ height }" ref="virtualList">
    <div class="scroll-box" :style="{ height }" @scroll="handleScroll" ref="scrollBox">
      <div class="scroll-hold" :style="{ width: '100%', height: scrollHoldHeight }"></div>
      <div class="list-wrap" v-if="renderList.length" ref="contentBox">
        <template v-for="item in renderList">
          <slot :item="item"></slot>
        </template>
      </div>
      <p class="no-data" v-else>No Data</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VirtualList',
  props: {
    list: Array,
    height: {
      type: [Number, String],
      default: '420px'
    },
    itemHeight: {
      type: [Number, String],
      default: 50
    },
    bufferCount: {
      type: [Number, String],
      default: 3
    },
    autoResetScroll: {
      type: Boolean,
      default: true
    }
  },
  data() {
    this.canShowAmount = 0;
    return {
      renderList: [],
      start: 0,
      end: 0
    }
  },
  watch: {
    list: {
      // immediate: true,
      deep: true,
      handler(val) {
        if (val && this.autoResetScroll) {
          this.resetScroll();
        }
      }
    }
  },
  computed: {
    scrollHoldHeight() {
      return this.list.length * this.itemHeight + 'px'
    }
  },
  mounted() {
    const { offsetHeight } = this.$refs.virtualList;
    this.canShowAmount = Math.floor(offsetHeight / this.itemHeight) + this.bufferCount; // 显示的 + 用于缓冲的
    this.getRenderList(0, this.canShowAmount)
  },
  methods: {
    resetScroll() {
      if (this.$refs.scrollBox) {
        this.start = 0;
        this.end = 0;
        this.$refs.scrollBox.scrollTop = 0;
        if (this.$refs.contentBox) {
          this.$refs.contentBox.style.transform = `translate3d(0, 0, 0)`
        }
        this.getRenderList(0, this.canShowAmount)
      }
    },
    getRenderList(start, end) {
      this.start = start;
      this.end = end;
      this.renderList = this.list.slice(start, end);
    },
    handleScroll() {
      const { scrollTop } = this.$refs.scrollBox;
      const start = Math.floor(scrollTop / this.itemHeight);
      const boxOffset = scrollTop - (scrollTop % this.itemHeight);
      const end = this.canShowAmount + start
      // console.log(start, this.start, '===start===')
      // console.log(end, this.end, '===end===')
      if (start !== this.start && end !== this.end) {
        this.getRenderList(start, end)
        this.$nextTick(() => {
          this.$refs.contentBox.style.transform = `translate3d(0, ${boxOffset}px, 0)`
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.virtual-list {
  position: relative;
  overflow: auto;
  .scroll-box {
    position: relative;
    overflow: auto;
  }
  .scroll-hold {
    position: absolute;
    z-index: -1;
    width: 100%;
  }
  .list-wrap {
    height: 100%;
  }
}
</style>