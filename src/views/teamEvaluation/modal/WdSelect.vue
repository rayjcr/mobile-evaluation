<!--v-roll:visible=popupVisible-->
<template>
  <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
    <div class="wd-box">
      <div class="wd-header flex alignCenter">
        <div class="btn cancel" @click="handlerClear">清空</div>
        <div class="title flex_1">全部</div>
        <div class="btn sure" @click="_sure">确定</div>
      </div>
      <div class="wd-content">
        <div class="wd-tab">
          <ul class="tab">
            <li v-if="tabList.length == 0">暂无分类</li>
            <li v-else class="tab-item" :class="{'active': tabKey == index}" v-for="(item,index) in tabList" :key="index" @click="_tab(index)">
              {{item.name}}
            </li>
          </ul>
        </div>
        <div class="tab-content" ref="scrollView">
          <div style="height: 100%" :style="moveStyle">
            <ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
              <li class="flex alignCenter" ref="wdLi" v-for="(item,index) in wdList" :key="index" @click="_check(index)">
                <span class="radio" :class="{'checked': checkKey == index}" @click="_check(index)"></span>
                <div class="name flex_1" >{{item.name}}</div>
                <!-- <i class="mintui mintui-back back-icon" @click="findChild(index)"></i> -->
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </mt-popup>
</template>

<script>
  import {PjApi as API} from '@/utils/api'
  export default {
    name: "WdSelect",
    props: ['dimensionId'],
    data() {
      return {
        popupVisible: false,
        name: '',
        checkKey: -1,
        tabKey: 0,
        startY: 0,
        endY: 0,
        disY: 0,
        moveStyle: {},
        tabList: [],
        wdList: []
      }
    },
    activated() {
      this.getWDAll();
    },
    methods: {
      async getWDAll() {
        const res = await this.$req.get(API.getTeamTypeList, {});
        if (res.resultCode == 1) {
          this.wdList = res.value;
          this.tabList = [];
          setTimeout(() => {
            if(this.dimensionId) {
              this.checkedlist(this.wdList,this.dimensionId)
            }
          },300)
        }
      },
      async findChild(key) {
        this._pushTabList(key);
        if(!this.wdList[key].evaluationGroupVOList) {
          this.checkKey = key;
          // this.$toast('该维度下没有数据');
          return;
        }
        this.moveStyle = {};
        this.endY = 0;
        this.wdList = this.wdList[key].evaluationGroupVOList ? this.wdList[key].evaluationGroupVOList : [];
        this._pushTabList(0);
        this.checkKey = 0;
      },
      _touchstart(e) {
        this.startY = e.changedTouches[0].pageY
      },
      _touchmove(e) {
        let liHeight = this.$refs.wdLi[0].clientHeight;
        let boxH = this.$refs.scrollView.clientHeight
        let scrollHeight = this.wdList.length * liHeight;
        var disMaxY = (boxH - scrollHeight) >= 0 ? 0 : boxH - scrollHeight;
        let moveY = e.changedTouches[0].pageY
        this.disY = moveY - this.startY
        this.disY = (this.disY - 0) + (this.endY - 0)
        this.disY = this.disY >= 0 ? 0 : this.disY <= disMaxY ? disMaxY : this.disY
        this.moveStyle = {transform: `translate(0, ${this.disY}px)`}
      },
      _touchend() {
        this.endY = this.disY;
      },
      checkedlist(list,id,key,oldlist) {
        for(let i=0;i<list.length;i++){
          if(list[i].id == id) {
            this.checkKey = i;
            if(typeof key !== 'undefined') {
              this.tabList.push({
                checkKey: key,
                name: oldlist[key].name,
                key: oldlist[key].level - 1,
                arr: oldlist
              })
            }
            this.wdList = typeof key == 'undefined' ? this.wdList : this.wdList[key].evaluationGroupVOList
            this.tabList.push({
              checkKey: i,
              name: list[i].name,
              key: list[i].level - 1,
              arr: this.wdList
            })
            this.tabKey = this.tabList[this.tabList.length - 1].key;
            this.$emit('getWdName',this.tabList)
            return;
          } else {
            if(list[i].evaluationGroupVOList) {
              this.checkedlist(list[i].evaluationGroupVOList,id,i,list)
            }
          }
        }
      },
      show() {
        this.popupVisible = true;
      },
      hide() {
        this.popupVisible = false;
      },
      _check(key) {
        if (this.checkKey == key) return;
        this.checkKey = key;
        this._pushTabList(key);
      },
      _pushTabList(key) {
        let target = this.wdList[key];
        this.tabKey = this.wdList[0].level - 1;
        if (!!this.tabList[target.level - 1]) {
          this.tabList[target.level - 1].name = target.name;
          this.tabList[target.level - 1].checkKey = key
        } else {
          this.tabList.push({
            checkKey: key,
            name: target.name,
            key: target.level - 1,
            arr: this.wdList
          })
        }
      },
      _tab(key) {
        let target = this.tabList[key];
        this.wdList = target.arr;
        if(this.tabKey != key) {
          this.moveStyle = {};
          this.endY = 0;
        }
        this.tabKey = key;
        this.checkKey = target.checkKey;
        if (this.tabList[key+1]) {
          this.tabList.splice(key+1,this.tabList.length)
        }
      },
      handlerClear() {
        this.popupVisible=false
        this.$emit('clear')
      },
      _sure() {
        if (this.checkKey == -1) {
          this.$toast('请选择维度');
          return;
        }
        this.popupVisible = false;
        this.$emit('getWdName',this.tabList)
        this.$emit('getWdInfo',this.wdList[this.checkKey])
      }
    }
  }
</script>

<style lang="less" scoped>
  .mint-popup-bottom {
    border-radius: 40px 40px 0 0;
  }

  .wd-box {
    max-height: 674px;
    border-radius: 40px 40px 0 0;
    background-color: #ffffff;
    .wd-header {
      position: relative;
      height: 98px;
      line-height: 98px;
      color: #262627;
      font-size: 36px;
      .btn {
        width: 210px;
        font-size: 36px;
        text-align: center;
      }
      .cancel {
        color: #B6B8B8;
      }
      .sure {
        color: #33A5FF;
      }
      .title {
        color: #262627;
        font-size: 36px;
        font-weight: 800;
        text-align: center;
      }
    }
    .wd-content {
      padding-left: 60px;
      padding-right: 66px;
      overflow-x: hidden;
      .wd-tab {
        height: 60px;
        overflow-y: hidden;
        border-bottom: 2px solid #EFF1F3;
        .tab {
          height: 80px;
          line-height: 55px;
          color: #B6B8B8;
          font-size: 28px;
          display: -webkit-box;
          white-space: nowrap;
          overflow-x: scroll;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          .tab-item {
            display: inline-block;
            margin-right: 70px;
            cursor: pointer;
            &.active {
              color: #262727;
              border-bottom: 4px solid #33A5FF;
            }
          }
        }
      }
      .tab-content {
        max-height: 520px;
        overflow: hidden;
        li {
          height: 95px;
          cursor: pointer;
        }
        .name {
          color: #262727;
          font-size: 40px;
        }
        .radio {
          display: inline-block;
          vertical-align: middle;
          position: relative;
          width: 40px;
          height: 40px;
          margin-right: 20px;
          border-radius: 100%;
          background-color: #EFF1F3;
          &.checked {
            background-color: #33A5FF;
          }
          &:after {
            content: " ";
            border-radius: 100%;
            position: absolute;
            width: 12px;
            height: 12px;
            top: 50%;
            left: 50%;
            margin-left: -6px;
            margin-top: -6px;
            background-color: #ffffff;
          }
        }
        .back-icon {
          width: 30px;
          color: #B6B8B8;
          transform: rotate(-180deg);
        }
      }
    }
  }
</style>
