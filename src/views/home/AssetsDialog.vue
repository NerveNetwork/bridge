<template>
  <el-dialog
      title=""
      :visible.sync="show"
      :modal-append-to-body="false"
      width="90%"
      top="10vh"
      class="assets-list-dialog"
      @close="$emit('input', false)"
  >
    <div class="asset-select-header">
      {{ $t("home.home29") }}
      <span @click="show = false">
        <img src="../../assets/img/back-icon.svg" alt="">
      </span>
    </div>
    <el-input v-model="searchVal" :placeholder="$t('home.home24')" class="search-input"></el-input>
    <ul v-if="filteredList.length">
      <li
          v-for="item in filteredList"
          :key="item.id"
          @click="selectAsset(item)"
          :class="{ active: activeId === item.id }"
      >
        <div class="left">
          <div class="logo-wrap">
            <img :src="getLogoSrc(item.icon)" alt="" />
          </div>
          <div class="asset-info">
            <div class="symbol-name">{{ item.symbol }}</div>
            <div class="symbol-origin-chain" v-if="showRegisterChain">{{item.registerChain}}</div>
<!--            <div class="symbol-name">
              <p>{{ item.symbol }}</p>
              <span class="origin-chain" v-if="showRegisterChain">{{item.registerChain}}</span>
            </div>-->
          </div>
        </div>
        <div class="balance-loading" v-if="item.balance===undefined">
          <img src="../../assets/img/balance-loading.svg" alt="">
        </div>
        <div class="balance" v-else>
          <span>{{ item.fixedBalance }}</span>
        </div>
      </li>
    </ul>
    <p class="no-data" v-else>No Data</p>
  </el-dialog>
</template>

<script>
import { superLong, getLogoSrc } from "@/api/util";
export default {
  name: "AssetsDialog",
  props: {
    value: Boolean,
    list: {
      type: Array,
      default: () => []
    },
    showRegisterChain: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      show: false,
      searchVal: "",
      filteredList: [],
      activeId: ""
    }
  },
  watch: {
    value(val) {
      this.show = val;
    },
    show(val) {
      if (!val) {
        this.searchVal = "";
      }
    },
    searchVal(val) {
      if (val) {
        this.filteredList = this.backupList.filter(v => {
          const search  = val.toUpperCase();
          const symbol = v.symbol.toUpperCase();
          const contractAddress = v.contractAddress ? v.contractAddress.toUpperCase() : "";
          // console.log(search, symbol, contractAddress, 45)
          return symbol.indexOf(search) > -1 || contractAddress && contractAddress === search
        })
      } else {
        this.filteredList = this.list
      }
    },
    list: {
      deep: true,
      immediate: true,
      handler(val) {
        this.backupList = val;
        this.filteredList = val;
      }
    }
  },
  methods: {
    selectAsset(item) {
      this.activeId = item.id
      this.$emit("selectAsset", item);
      this.$emit("input", false);
    },
    getLogoSrc(url) {
      return getLogoSrc(url);
    },
    superLong(str, len = 5) {
      return superLong(str, len);
    },
  }
}
</script>

<style lang="less">
  .assets-list-dialog {
    .el-dialog {
      max-height: 60vh;
      .el-dialog__header {
        //border: none;
        //margin-bottom: 5px;
        display: none;
      }
      .asset-select-header {
        margin-top: 10px;
        position: relative;
        text-align: center;
        font-size: 18px;
        padding: 10px 0;
        span {
          padding-top: 6px;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
        }
      }
      .el-dialog__body {
        padding: 5px 20px 20px;
        .el-input__inner {
          border-color: #E9EBF3;
        }
      }
    }
    .search-input {
      margin: 10px 0;
      .el-input__inner {
        border-radius: 10px;
        height: 40px;
        line-height: 40px;
      }
    }
    ul {
      max-height: calc(60vh - 140px);
      overflow: auto;
    }
    li {
      display: flex;
      // justify-content: space-between;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      //height: 55px;
      padding: 12px 8px 12px 0;
      border-bottom: 1px solid #E9EBF3;
      overflow: hidden;
      &:hover {
        // background-color: rgb(224, 217, 235);
      }
      &:last-of-type {
        border-bottom: none;
      }
      .left {
        display: flex;
        align-items: center;
      }
      .logo-wrap {
        width: 30px;
        height: 30px;
        margin-right: 10px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
      .asset-info {
        display: flex;
        flex-direction: column;
        position: relative;
        .symbol-name {
          line-height: 1;
          margin-bottom: 10px;
          color: #515b7d;
          white-space: nowrap;
          overflow: hidden;
          max-width: 150px;
          text-overflow: ellipsis;
          font-size: 15px;
          font-weight: bold;
        }
        .symbol-origin-chain {
          border: 1px solid #5BCAF9;
          border-radius: 4px;
          font-size: 16px;
          font-weight: normal;
          color: #5BCAF9;
          transform: translate(-20%, -10%) scale(0.5);
          text-align: center;
          position: absolute;
          top: 13px;
          left: -3px;
          padding: 0 8px;
          word-break: initial;
        }
      }
      .balance {
        //flex: 1;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        max-width: 150px;
        text-overflow: ellipsis;
        margin-left: 10px;
      }
      .balance-loading {
        //display: inline-block;
        width: 24px;
        height: 24px;
        overflow: hidden;
        transform-origin: center center;
        animation: balance-loading 1.5s linear infinite;
      }
      &.active {
        opacity: 0.65;
      }
    }
  }
  @keyframes balance-loading {
    50% {
      transform: rotate(180deg)
    }

    to {
      transform: rotate(359deg)
    }
  }
</style>