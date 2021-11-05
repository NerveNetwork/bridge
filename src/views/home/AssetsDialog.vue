<template>
  <el-dialog
      title=""
      :visible.sync="show"
      :modal-append-to-body="false"
      width="80%"
      top="10vh"
      class="assets-list-dialog"
      @close="$emit('input', false)"
  >
    <el-input v-model="searchVal" :placeholder="$t('home.home24')" class="search-input"></el-input>
    <ul v-if="filteredList.length">
      <li
          v-for="item in filteredList"
          :key="item.id"
          @click="selectAsset(item)"
          :class="{ active: activeId === item.id }"
      >
        <div class="logo-wrap">
          <img :src="getLogoSrc(item.icon)" alt="" />
        </div>
        <div class="asset-info">
          <p style="line-height: 1">{{ item.symbol }}<span class="origin-chain" v-if="showRegisterChain">{{item.registerChain}}</span></p>
          <span
              v-if="item.contractAddress && item.contractAddress.length > 20"
          >
              {{ $t("home.home9") + superLong(item.contractAddress) }}
            </span>
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
    superLong(str, len = 8) {
      return superLong(str, len);
    },
  }
}
</script>

<style lang="less">
  .assets-list-dialog {
    .el-dialog {
      max-height: 60vh;
      overflow: auto;
      .el-dialog__header {
        border: none;
        margin-bottom: 5px;
      }
      .el-dialog__body {
        padding: 5px 20px 15px;
        .el-input__inner {
          border-color: #E9EBF3;
        }
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
    li {
      display: flex;
      // justify-content: space-between;
      align-items: center;
      cursor: pointer;
      height: 55px;
      border-bottom: 1px solid #E9EBF3;
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
          &.origin-chain {
            font-size: 20px;
            transform: translate(-20%, 3px) scale(0.5);
            color: #5BCAF9;
            padding: 0 5px;
          }
        }
      }
      &.active {
        opacity: 0.65;
      }
    }
  }
</style>