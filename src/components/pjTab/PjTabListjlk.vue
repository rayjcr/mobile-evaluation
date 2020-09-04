<template>
  <div class="jlk-tab">
    <div class="tab flex">
      <div class="item flex_1" v-for="(item,index) in newList" :key="index">
        <span :class="{'active': popupKey == item.type}" @click="popupTabFun(item.type)">{{item.name}}</span>
      </div>
    </div>
    <div class="tab-content scrollY" :class="{'scrollView': pjxList.length > 4}" v-show="popupKey == 1 || popupKey == 3">
      <vue-scroll :ops="scrollOps" v-if="pjxList.length > 0">
        <ul class="list-box clear">
          <li class="fl" v-for="(item,index) in pjxList" :key="index" @click="_select(index,item.number)">
            <div class="pj_icon" :class="{'checked': pjKey == index}">
              <img :src="item.icon || default_pjx">
              <p class="card-num" v-if="typeof item.number == 'number'">剩余:{{item.number}}</p>
            </div>
            <p class="name text-overflow">{{item.name}}</p>
          </li>
        </ul>
      </vue-scroll>
      <div v-else class="empty">暂无数据</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "PjTabListjlk",
    props: ['list','pjxList','type'],
    data() {
      return {
        popupKey: 1,
        pjKey: 0,
        scrollOps: {
          bar: {
            background: '#B6B8B8',
            keepShow: true,//是否一直显示
            size: '6px',
          },
        },
        default_pjx: '/static/img/defalut_pjx@2x.png' // 默认评价项图片
      }
    },
    watch: {
      popupKey(nVal) {
        this.$emit('getjlkType',nVal)
      },
      pjKey(nVal) {
        this.$emit('getJLKInfo',nVal)
      }
    },
    computed: {
      newList() {
        let xxdm = this.$cookie.get('xxdm');
        let _tabList = this.list || [];
        if(xxdm == '1657' || xxdm == '1658' || xxdm == '365') {
          //在指定位置添加元素,第一个参数指定位置,第二个参数指定要删除的元素,如果为0,则追加
          _tabList.splice(1, 0, {type: 3,name: '扣卡'});
        }
        return _tabList;
      }
    },
    methods: {
      popupTabFun(type) {
        this.popupKey = type;
      },
      _select(key,number) {
        this.pjKey = key;
        if(number == 0) {
          this.$toast('该卡片已发完');
        }
      }
    }
  }
</script>

<style type="text/css">
  .scrollView .__vuescroll{
    height: 488px!important;
  }
</style>
<style lang="less" scoped>
  .jlk-tab {
    .tab {
      height: 80px;
      .item {
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
      max-height: 488px;

      .list-box {
        padding: 10px 32px;
        li {
          width: 50%;
          margin-bottom: 34px;
          color: #262627;
          font-size: 24px;
          text-align: center;
          .pj_icon {
            position: relative;
            width: 325px;
            height: 153px;
            margin: 0 auto;
            border-radius: 8px;
            box-sizing: border-box;
            &.checked {
              border: 4px solid #33A5FF;
              box-shadow: 0 10px 40px rgba(51,165,255,0.29);
            }
          }
          img {
            width: 100%;
            height: 100%;
          }
          .name {
            color: #262627;
            font-size: 24px;
            margin-top: 14px;
          }
          .card-num {
            position: absolute;
            left: 0;
            top: 0;
            color: #ffffff;
            font-size: 20px;
            max-width: 90%;
            height: 40px;
            line-height: 40px;
            text-align: center;
            padding: 0 20px;
            background-color: rgba(0,0,0,.44);
            border-radius: 8px 0 8px 0;
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
