<template>
  <div class="chain-list" v-show="value" ref="wrap">
    <ul>
      <li
        v-for="item in chainConfig"
        :key="item.chain"
        @click.stop="handleClick(item)"
      >
<!--        {{ item.chainName }}-->
        <p :class="{'active': item.chain === currentChain, 'disable': item.chain === disabledChain}">
          <img :src="item.icon" alt="">
          {{ item.chain }}
        </p>
      </li>
      <div class="pop-arrow"></div>
    </ul>
  </div>
</template>

<script>
import { getChainConfigs } from '@/api/util';

export default {
  name: 'ChainList',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    currentChain: String,
    disabledChain: String
  },
  data() {
    return {
      chainConfig: {}
    }
  },

  mounted() {
    window.addEventListener("click", (e) => {
      if (!this.$refs.wrap || !this.value) return;
      if (!this.$refs.wrap.contains(e.target)) {
        this.$emit("input", false)
      }
    }, false)
    this.setChainList()
  },

  methods: {
    handleClick(item) {
      if (item.chain === this.disabledChain) return;
      this.$emit("input", false);
      if (item.chain !== this.currentChain) {
        this.$emit('change', item);
      }
    },
    setChainList() {
      this.chainConfig = getChainConfigs();
      console.log(this.chainConfig, 123465)
    }
  }
}
</script>

<style scoped lang="less">
.chain-list {
  position: absolute;
  top: 30px;
  left: 20px;
  z-index: 99999;
  width: 150px;
  padding: 6px 0;
  margin-top: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  li {
    padding: 5px 0;
    p {
      display: flex;
      align-items: center;
      padding: 0 15px;
      img {
        width: 28px;
        margin-right: 10px;
      }
      &:hover {
        background-color: #f5f7fa;
      }
      &.active {
        color: #409eff;
        font-weight: 700;
      }
      &.disable {
        cursor: not-allowed;
        color: #C0C4CC;
        &:hover {
          background-color: #fff;
        }
      }
    }
  }
  .pop-arrow, .pop-arrow:after {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-width: 6px;
    border-top-width: 0;
    border-color: transparent;
    border-style: solid;
  }
  .pop-arrow {
    top: -6px;
    left: 30px;
    border-bottom-color: #EBEEF5;
    &:after {
      content: " ";
      top: 1px;
      margin-left: -6px;
      border-bottom-color: #FFF;
    }
  }
}
</style>