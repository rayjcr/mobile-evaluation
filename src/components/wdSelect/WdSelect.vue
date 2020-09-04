<!--v-roll:visible=popupVisible-->
<template>
  <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
    <div class="wd-box">
      <div class="wd-header flex alignCenter">
        <div class="btn cancel" @click="popupVisible=false">取消</div>
        <div class="title flex_1">全部</div>
        <div class="btn sure" @click="_sure">确定</div>
      </div>
      <div class="wd-content">
        <div class="wd-tab">
          <ul class="tab">
            <li class="tab-item active" v-if="tabList.length == 0">全部</li>
            <li v-else class="tab-item" :class="{'active': tabKey == index}" v-for="(item,index) in tabList" :key="index" @click="_tab(index)">
              {{item.name}}
            </li>
          </ul>
        </div>
        <div class="tab-content" ref="scrollView">
          <div style="height: 100%" :style="moveStyle">
            <ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
              <li class="flex alignCenter" ref="wdLi" v-for="(item,index) in wdList" :key="index">
                <div class="radio" :class="{'checked': checkKey == index}" @click="_check(index)" v-if="item.hasMedal"></div>
                <div class="disabled"  @click="_check(index)" v-else></div>
                <div class="name flex_1" @click="_check(index)">{{item.name}}</div>
                <i class="mintui mintui-back back-icon" @click="findChild(index)" v-if="item.dimensionItemVOList"></i>
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
        checkKey: 0, // 默认选中全部
        tabKey: 0,
        startY: 0,
        endY: 0,
        disY: 0,
        moveStyle: {},
        tabList: [],
        wdList: []
      }
    },
    watch: {
      dimensionId(nVal) {
        setTimeout(() => {
          this.checkedlist(this.wdList,nVal)
        },300)
      }
    },
    activated() {
      this._initData();
      this.getWDAll();
    },
    methods: {
      /*
      * 获取所有维度列表
      * */
      async getWDAll() {
        let data = {
          name: this.name
        };
        const res = await this.$req.get(API.getAll, data);
        if (res.resultCode == 1) {
          this.wdList = res.value;
          this.wdList.unshift({
            name: '全部',
            id: '',
            hasMedal: true
          })
          this.tabList = [];
        }
      },

      _initData() {
        this.checkKey = 0;
        this.startY = 0;
        this.endY = 0;
        this.disY = 0;
        this.moveStyle = {};
      },

      /*
      * 查找是否有子维度
      * */
      findChild(key) {
        this._pushTabList(key);
        let dimensionItemVOList = JSON.parse(JSON.stringify(this.wdList[key].dimensionItemVOList));
        let id = this.wdList[key].id;
        if(!dimensionItemVOList) {
          this.checkKey = key;
          return;
        }
        this.moveStyle = {};
        this.endY = 0;
        dimensionItemVOList.unshift({
          name: '全部',
          id,
          hasMedal: true
        })
        this.wdList = dimensionItemVOList;
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
      /*
      * 默认选中的维度项
      * */
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
            this.wdList = typeof key == 'undefined' ? this.wdList : this.wdList[key].dimensionItemVOList
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
            if(list[i].dimensionItemVOList) {
              this.checkedlist(list[i].dimensionItemVOList,id,i,list)
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
      /*
      * 选择维度
      * */
      _check(key) {
        if (!this.wdList[key].hasMedal) return; // 禁用
        if (this.checkKey == key || key == 0) {
          this.checkKey = 0; // 反选
          if(this.tabList.length > 1) {
            this.tabList[this.tabList.length-1].name = '全部';
          } else {
            this.tabList = [];
          }
          return;
        }
        
        this.checkKey = key;
        this._pushTabList(key);
      },
      /*
      * 更新tab对应的维度名称
      * */
      _pushTabList(key) {
        let target = this.wdList[key];
        if(!target) return;
        this.tabKey = this.wdList[1].level - 1;
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
      _sure() {
        if(!this.wdList[this.checkKey].hasMedal) {
          this.$toast('该维度下不存在勋章');
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
          position: relative;
          width: 80px;
          height: 80px;
          transform: scale(0.5);
          transform-origin: 0 center;
          border-radius: 100%;
          background-color: #EFF1F3;
          &.checked {
            background-color: #33A5FF;
          }
          &:after {
            content: " ";
            border-radius: 100%;
            position: absolute;
            width: 24px;
            height: 24px;
            top: 50%;
            left: 50%;
            margin-left: -12px;
            margin-top: -12px;
            background-color: #ffffff;
          }
        }
        .disabled {
          width: 80px;
          height: 80px;
          transform: scale(0.5);
          transform-origin: 0 center;
          background-image: url(../../assets/img/icon_disabled_radio@2x.png);
          background-position: center;
          background-size: 80px auto;
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
