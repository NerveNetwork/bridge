<template>
  <transition name="drawer-fade">
    <div class="menu-wrap" v-show="value">
      <div class="nav-menu">
        <transition name="model">
          <div class="model" v-show="value" @click="hide"></div>
        </transition>
        <div class="header_content" :class="value ? 'show' : 'hide'">
          <ul class="menu-ul">
            <li @click="toUrl('txList')">
              <i class="iconfont icon-jiaoyijilu"></i>
              <span>{{ $t('header.header1') }}</span>
            </li>
            <li @click="toUrl('accounts')">
              <i class="iconfont icon-wangluozhanghu"></i>
              <span>{{ $t('header.header2') }}</span>
            </li>
            <li>
              <a href="https://swap.nabox.io/" :target="isMobile && '_self' || '_blank'">
                <i class="iconfont icon-swapbox"></i>
                <span>SwapBox</span>
              </a>
            </li>
            <li>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdPXX4EDtzxqBg3OBMIq7EtoiBxnxcqokIeVzAqyXQFYbmf4w/viewform"
                :target="isMobile && '_self' || '_blank'">
                <i class="iconfont icon-zichanshangjia"></i>
                <span>{{ $t('header.header3') }}</span>
              </a>
            </li>
            <li>
              <a href="https://drive.google.com/drive/folders/13gk5XzfJmCUyRCmoleWH47REUOyGc4yo"
                 :target="isMobile && '_self' || '_blank'">
                <i class="iconfont icon-shenjibaogao"></i>
                <span>{{ $t('header.header4') }}</span>
              </a>
            </li>
          </ul>
          <div class="bottom-wrap">
            <div class="community">
              <a href="https://t.me/NerveNetwork" :target="isMobile && '_self' || '_blank'">
                <img src="../assets/img/Telegram.svg" alt="">
              </a>
              <a href="https://discord.gg/PBkHeD7" :target="isMobile && '_self' || '_blank'" style="padding-top: 1px">
                <img style="padding-top: 2px;" src="../assets/img/Discord.svg" alt="">
              </a>
            </div>
            <div class="language clicks" @click="lang=lang==='cn' ? 'en' : 'cn'">
              <!-- <span class="iconfont icon-yuyan"> -->
              <img src="../assets/img/lang.svg" alt="">
              <span>{{ lang === 'cn' ? 'English' : '中文' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

export default {
  data() {
    this.isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)
    return {
      lang: localStorage.getItem('lang') || 'en'
    }
  },
  props: {
    value: Boolean
  },
  watch: {
    lang(val) {
      if (val) {
        this.$i18n.locale = val
        localStorage.setItem('lang', val)
        this.hide()
      }
    }
  },
  methods: {
    hide() {
      this.$emit("input", false);
    },
    toUrl(name) {
      this.$router.push({
        name
      })
      this.hide()
    }

  }
}
</script>

<style lang="less">
.menu-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 64px;
  bottom: 0;
  z-index: 99999;
}
.nav-menu {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  overflow: hidden;
  z-index: 10;

  .model {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0.46;
    background-color: rgb(33, 33, 33);
  }

  .header_content {
    &.show {
      animation: rtl-drawer-in .3s;
    }

    animation: rtl-drawer-out .3s;
    background-color: #fff;
    position: absolute;
    min-width: 155px;
    height: 100%;
    right: 0;
    top: 0;
    padding-top: 15px;
    .menu-ul {
      li {
        padding: 15px 15px;
        cursor: pointer;
        line-height: 1;

        .iconfont {
          margin-right: 10px;
          font-size: 18px;
        }

        &:hover {
          background-color: rgb(239, 244, 245);
        }
      }
    }
  }

  .network {
    padding: 10px 20px 0;

    .label {
      color: #99A3C4;
      font-size: 12px;
      margin-bottom: 5px;
    }

    .el-radio-group {
      .el-radio-button {
        margin: 0 10px 15px 0;

        &.is-active .el-radio-button__inner {
          box-shadow: none;
          background-color: #5BCAF9;
          color: #fff;
        }

        &:nth-of-type(2n) {
          margin-right: 0;
        }
      }

      .el-radio-button__inner {
        border-radius: 10px;
        font-size: 12px;
        width: 80px;
        height: 35px;
        line-height: 35px;
        padding: 0;
        color: #515E7B;
        background-color: #EBEEF8;
        border: none;

        &:hover {
          color: #5BCAF9;
        }
      }
    }
  }

  .bottom-wrap {
    //display: flex;
    //align-items: center;
    position: absolute;
    bottom: 25px;
    left: 0;
    margin-top: 40px;
    padding: 0 20px;

    .community, .language {
      display: flex;
      align-items: center;
    }

    img {
      width: 22px;
      margin-right: 15px;
      cursor: pointer;
      vertical-align: middle;
      &:hover {
        opacity: 0.65;
      }
    }

    .language {
      cursor: pointer;
      padding-top: 15px;
      img {
        margin-right: 5px;
      }
      &:hover {
        opacity: 0.65;
      }
    }

    .icon-yuyan {
      font-size: 22px;
      margin-right: 5px;
      margin-left: 10px;
    }
  }
}

.drawer-fade-enter-active, .drawer-fade-leave-active {
  transition: opacity 0.3s
}

.drawer-fade-enter, .drawer-fade-leave-to {
  opacity: 0;
}

.model-enter-active, .model-leave-active {
  transition: opacity 0.2s
}

.model-enter, .model-leave-to {
  opacity: 0;
}

@keyframes rtl-drawer-in {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0%);
  }
}

@keyframes rtl-drawer-out {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>