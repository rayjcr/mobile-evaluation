<template>
  <div class="pj-tab">
    <div class="tab flex">
      <div class="item" v-for="(item,index) in list" :key="index">
        <span :class="{'active': popupKey == item.type}" @click="popupTabFun(item.type)">{{item.name}}</span>
      </div>
    </div>
    <div class="tab-content scrollY" :class="{'scrollView': pjList.length > 4}">
      <vue-scroll :ops="scrollOps" v-if="pjList.length > 0">
        <ul class="list-box clear">
          <li class="fl" :class="{'checked': pjKey == index}" v-for="(item,index) in pjList" :key="index" @click="_select(index)">
            <img :src="item.icon || default_pjx">
            <p class="text-overflow">{{item.name}}</p>
            <span v-if="pjKey == index" class="check-circle"></span>
          </li>
        </ul>
      </vue-scroll>
      <div v-else class="empty">暂无数据</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "PjTabList",
    props: ['rewardType','list','pjList'],
    data() {
      return {
        popupKey: 3,
        pjKey: 0,
        scrollOps: {
          bar: {
            background: '#B6B8B8',
            keepShow: true,//是否一直显示
          },
        },
        default_pjx: '/static/img/defalut_pjx@2x.png' // 默认评价项图片
      }
    },
    watch: {
      rewardType(nVal) {
        this.popupKey = nVal;
      },
      popupKey(nVal) {
        this.$emit('getRewardType',nVal)
      },
      pjKey(nVal) {
        this.$emit('getPjInfo',nVal)
      }
    },
    methods: {
      popupTabFun(type) {
        this.popupKey = type;
      },
      _select(key) {
        this.pjKey = key;
      }
    }
  }
</script>

<style type="text/css">
  .scrollView .__vuescroll{
    height: 408px!important;
  }
</style>
<style lang="less" scoped>
  .pj-tab {
    .tab {
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
    .tab-content {
      max-height: 408px;
      .list-box {
        padding: 60px 0 38px 0;
        li {
          position: relative;
          height: 158px;
          margin-bottom: 34px;
          margin-left: 35px;
          color: #262627;
          font-size: 24px;
          text-align: center;
          padding: 16px 12px 20px 12px;
          &.checked {
            transform: translateY(-4px);
            background-color: #FFFFFF;
            box-shadow: 0 12px 40px rgba(51,165,255,0.29);
            border-radius: 8px;
          }
          img {
            width: 90px;
            height: 90px;
            object-fit: cover;
            border-radius: 50%;
            box-sizing: border-box;
          }
          p {
            width: 180px;
            color: #262627;
            font-size: 24px;
            margin-top: 14px;
          }
          .check-circle {
            position: absolute;
            right: -8px;
            bottom: -8px;
            width: 40px;
            height: 40px;
            background-color: #ffffff;
            border: 4px solid #33A5FF;
            border-radius: 50%;
            &:after {
              content: '';
              width: 5px;
              height: 11px;
              position: absolute;
              left: 17px;
              top: 10px;
              border: 2px solid transparent;
              border-top: 0;
              border-left: 0;
              border-color: #33A5FF;
              transform: rotate(45deg) scale(1.5);
              transition: transform .2s;
            }
          }
        }
      }
      .empty {
        height: 120px;
        line-height: 120px;
        text-align: center;
      }
    }
  }
</style>
