<template>
  <el-dialog
      title=""
      :visible.sync="show"
      :modal-append-to-body="false"
      width="80%"
      top="10vh"
      class="swap-assets-dialog"
      @close="$emit('input', false)"
  >
    <el-input v-model="searchVal" :placeholder="$t('home.home24')" class="search-input"></el-input>
    <div class="assets-wrap">
      <div class="left">
        <ul>
          <li v-for="item in supportChains" :key="item.symbol">
            <div class="wrap" @click="changeChain(item.value)">
              <img :src="item.logoActive" alt="" v-if="item.value === activeChain">
              <img :src="item.logo" alt="" v-else>
            </div>
          </li>
        </ul>
      </div>
      <div class="right">
        <ul v-if="filteredList.length">
          <li
              v-for="item in filteredList"
              :key="item.id"
              @click="selectAsset(item)"
          >
            <div class="logo-wrap">
              <img :src="getLogoSrc(item.icon)" alt="" />
            </div>
            <div class="asset-info">
              <p>{{ item.symbol }}</p>
              <span
                  v-if="item.contractAddress && item.contractAddress.length > 20"
              >
              {{ $t("home.home9") + superLong(item.contractAddress, 5) }}
            </span>
            </div>
          </li>
        </ul>
        <p class="no-data" v-else style="margin-top: 20px">No Data</p>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { superLong, getLogoSrc, supportChainList } from "@/api/util";

export default {
  name: "AssetsDialog",
  props: {
    value: Boolean,
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      show: false,
      searchVal: "",
      filteredList: [],
      activeChain: "Ethereum",
      supportChains: [],
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
        this.getListByChain()
      }
    }
  },
  mounted() {
    const sort = ["ETH", "BNB", "HT", "OKT", "ONE", "MATIC", "KCS", "NULS", "NVT"]
    this.supportChains = supportChainList.sort((a, b) => {
      return sort.indexOf(a.symbol) - sort.indexOf(b.symbol)
    })
  },
  methods: {
    getListByChain() {
      this.backupList = this.filteredList = this.list.filter(v => v.registerChain === this.activeChain);
    },
    // 切换链
    changeChain(chain) {
      this.searchVal = ""
      this.activeChain = chain;
      this.getListByChain();
    },
    // 选择资产
    selectAsset(item) {
      this.activeId = item.id
      this.$emit("selectAsset", item);
      this.$emit("input", false);
    },
    getLogoSrc(url) {
      return getLogoSrc(url);
    },
    superLong(str, len = 8) {
      return superLong(str, len);
    },
  }
}
</script>

<style lang="less">
.swap-assets-dialog {
  .el-dialog {
    //max-height: 60vh;
    .el-dialog__header {
      border-bottom: none;
    }
    //.el-dialog__title {
    //  height: 24px;
    //}
    .el-dialog__body {
      padding: 5px 20px 15px;
    }
  }
  .search-input {
    margin: 10px 0;
    .el-input__inner {
      border-radius: 20px;
      height: 40px;
      line-height: 40px;
    }
  }
  .assets-wrap {
    display: flex;
    height: 450px;

  }
  .assets-wrap .left {
    //width: 50px;
    padding-right: 20px;
    border-right: 1px solid #E9EBF3;
    li {
      height: 45px;
      display: flex;
      align-items: center;
      .wrap {
        position: relative;
        cursor: pointer;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
        .mask {
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(230, 232, 232, 1);
        }
      }
    }
    @media screen and (max-width: 400px){
      width: 40px;
      padding-right: 10px;
      li {
        height: 50px;
        .wrap {
          width: 25px;
          height: 25px;
        }
      }
    }
  }
  .assets-wrap .right {
    flex: 1;
    padding-left: 20px;
    height: 100%;
    overflow: auto;
    li {
      display: flex;
      // justify-content: space-between;
      align-items: center;
      cursor: pointer;
      height: 55px;
      &:hover {
        // background-color: rgb(224, 217, 235);
      }
      .logo-wrap {
        width: 30px;
        height: 30px;
        margin-right: 15px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
      .asset-info {
        p {
          font-size: 15px;
          font-weight: bold;
          color: #515b7d;
        }
        span {
          font-size: 13px;
          color: #99a3c4;
        }
      }
      &.active {
        opacity: 0.65;
      }
    }
    @media screen and (max-width: 400px){
      width: 40px;
      padding-left: 10px;
      li {
        height: 50px;
        .logo-wrap {
          width: 25px;
          height: 25px;
        }
      }
    }
  }
}
</style>