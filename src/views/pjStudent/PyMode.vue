<template>
  <div class="py-mode-box">
    <div class="reward-type flex">
      <div class="item" v-for="(item,index) in rewardList" :key="index">
        <span :class="{'active': popupKey == item.type}" @click="popupTabFun(item.type)">{{item.name}}</span>
      </div>
    </div>

    <!--评语折叠展示-->
    <div class="py-mode-list scrollY" :class="{'fullScreen': !isFoldShow}" ref="pyMode">
      <ul v-if="new_list.length > 0" id="ul">
        <li v-for="(item,index) in new_list" :key="index" >
          <div class="li_item" v-if="item.commentList.length > 0">
            <div class="li-top flex alignCenter">
              <div class="li-top-left">{{item.name}}</div>
              <div class="li-top-right">{{item.dimensionName}}</div>
            </div>
            <div
              class="py-item flex alignCenter"
              :class="{'active': v.checked}"
              :id="v.checked? 'active': ''"
              v-for="(v,i) in item.commentList"
              :key="i"
              @click="_selectPy(index,i)"
            >
              <div class="py-item-left text-overflow">{{v.content}}</div>
              <div class="py-item-right" v-if="v.defaultReward">{{popupKey == 3 || popupKey == 5 ? '+' : '-'}}{{v.defaultReward}}</div>
              <div class="py-item-right" v-else>{{popupKey == 3 || popupKey == 5 ? '+' : '-'}}{{rewardMin}}</div>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="empty">暂无数据</div>
    </div>

    <!-- 展开收缩小箭头 -->
    <div class="mask-bottom">
      <div class="icon icon_down" v-if="isFoldShow" @click="isFoldShow = false"></div>
      <div class="icon icon_up" v-else @click="isFoldShow = true;isFlag = false"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "PyMode",
    props: {
      rewardMin: {
        default: 1
      },
      rewardType: {
        default: 3
      },
      rewardList: {
        type: Array,
        default: () => []
      },
      list: {
        type: Array,
        default: () => []
      },
    },
    data() {
      return {
        isFoldShow: false, // 折叠显示,默认展开
        isFlag: true, // 滚动监听的逻辑是否往下执行
        scrollTop: 0
      }
    },
    computed: {
      popupKey() {
        let rewardType = this.rewardType;
        return rewardType;
      },
      new_list() {
        let list = this.list;
        list.forEach((c) => {
          c.commentList.forEach((v) => {
            this.$set(v, "checked", false);
          });
        });
        return list;
      }
    },
    watch: {
      isFoldShow(nVal) {
        this.$emit("getFoldShow", nVal);
        if(nVal) {
          this.isFlag = true;
          this._scrollVisualArea()
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        let pyMode = this.$refs.pyMode;
        // 监听这个dom的scroll事件
        pyMode.addEventListener("scroll", () => {
          let scrollTop = pyMode.scrollTop;
          if(this.isFlag) {
            this.scrollTop = scrollTop;
            return;
          }
          if(this.isFoldShow) {
            let disY = Math.abs(scrollTop - this.scrollTop);
            this.isFoldShow = disY >= 80 ? false : true;
          } 
        });
      });
    },
    activated() {
      this.isFoldShow = false;
      this.isFlag = true;
    },
    methods: {
      /*
      * 奖惩项切换
      * */
      popupTabFun(type) {
        this.$emit("getRewardType", type);
      },
      /*
      * 选择评语项
      * */
      _selectPy(key, i) {
        this.new_list.forEach((c) => {
          c.commentList.forEach((v) => {
            v.checked = false;
          });
        });

        this.new_list[key].commentList[i].checked = true;
        
        let defaultReward = this.new_list[key].commentList[i].defaultReward || this.rewardMin,
          content = this.new_list[key].commentList[i].content,
          id = this.new_list[key].id;

        this.$emit('getPyInfo',{
          defaultReward,
          content,
          id
        })

        // 关闭全屏显示
        if (!this.isFoldShow) {
          this.isFlag = true;
          this.isFoldShow = true;
        }
      },
      /*
      * 选中项滚动到可视区
      * */
      _scrollVisualArea() {
        setTimeout(() => {
          let activeLi = document.querySelector("#active");
          if(!activeLi) return;
          let ul = document.querySelector("#ul"),
            offsetTop = activeLi.offsetTop,
            ulTop = ul.offsetTop;

          this.$refs.pyMode.scrollTop = offsetTop - ulTop;
        }, 500);
        setTimeout(() => {
          this.isFlag = false;
        },700)
      }
    }
  };
</script>

<style lang="less" scoped>
  .py-mode-box {
    position: relative;
    .reward-type {
      .item {
        width: 25%;
        text-align: center;
        span {
          color: #B6B8B8;
          font-size: 30px;
        }
        span.active {
          position: relative;
          color: #262627;
          font-weight: 600;

          &:after {
            content: '';
            position: absolute;
            z-index: 203;
            width: 80%;
            height: 5px;
            border-radius: 2px;
            bottom: -15px;
            left: 50%;
            margin-left: -40%;
            background-color: #33A5FF;
          }
        }
      }
    }
    ul {
      padding-bottom: 40px;
    }
    .py-mode-list {
      height: 408px;
      margin-top: 40px;
      padding: 0 32px;
      transition: height 0.5s ease;
    }
    .fullScreen {
      height: calc(100vh - 180px);
    }
    .li_item {
      margin-bottom: 40px;
      .li-top-left {
        color: #262627;
        font-weight: 600;
        font-size: 32px;
        margin-right: 16px;
      }
      .li-top-right {
        color: #B6B8B8;
        font-size: 24px;
      }
      .py-item {
        height: 56px;
        color: #262627;
        margin-top: 20px;
        padding: 0 20px;
        font-size: 28px;
        border-radius: 28px;
        background-color: #EFF1F3;
        &.active {
          color: #FFFFFF;
          background-color: #33A5FF;
          .py-item-right {
            color: #FFFFFF;
          }
        }
        .py-item-left {
          width: 95%;
        }
        .py-item-right {
          color: #B6B8B8;
        }
      }
    }

    .empty {
      height: 120px;
      line-height: 120px;
      text-align: center;
    }

    .mask-bottom {
      position: absolute;
      z-index: 100;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 80px;
      background: linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 100%);
      .icon {
        width: 100%;
        height: 100%;
        background-position: center 32px;
        background-size: 32px auto;
        background-repeat: no-repeat;
      }
      .icon_down {
        background-image: url(./img/icon_down@2x.png);
      }
      .icon_up {
        background-image: url(./img/icon_up@2x.png);
      }
    }
  }
</style>
