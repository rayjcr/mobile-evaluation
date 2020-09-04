<!--
  年级，班级选择器
-->
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
            <li class="tab-item" :class="{'active': type == item.type}" v-for="(item,index) in tabList" :key="index" @click="_tab(item.type)">
              {{item.name}}
            </li>
          </ul>
        </div>
        <div class="tab-content" ref="scrollView">
          <div style="height: 100%" v-show="type == 2" :style="moveStyle">
            <ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
              <li class="flex alignCenter" ref="gradeLi" v-for="(item,index) in gradeList" :key="index">
                <span class="check-circle" :class="{'checked': item.checked == 'allChecked','hasChecked': item.checked == 'hasChecked'}" @click="_check(index,'gradeList')"></span>
                <div class="name flex_1" @click="_findChild(index)">{{item.gradeName}}</div>
                <i class="mintui mintui-back back-icon" @click="_findChild(index)"></i>
              </li>
            </ul>
          </div>
          <div style="height: 100%" v-show="type == 3" :style="moveStyle">
            <ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
              <li class="flex alignCenter" ref="classLi" v-for="(item,index) in newClassList" :key="index" @click="_check(index,'newClassList')">
                <span class="check-circle" :class="{'checked': item.checked}"></span>
                <div class="name flex_1">{{item.className}}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </mt-popup>
</template>

<script>
  export default {
    name: "GCSelect",
    props: ['activityType','gcInfo'],
    data() {
      return {
        popupVisible: false,
        name: '',
        type: 2,
        gradeKey: 0,
        startY: 0,
        endY: 0,
        disY: 0,
        moveStyle: {},
        tabList: [
          {type: 2, name: '年级'}
        ],
        classList: [],
        newClassList: [],
        gradeList: []
      }
    },
    watch: {
      type() {
        this.moveStyle = {};
        this.endY = 0;
      }
    },
    activated() {
      this.getClassList()
      this.getGradeList()
    },
    methods: {
      getClassList() {
        let classList = JSON.parse(sessionStorage.getItem('classList')); // 获取班级列表数据

        if (!classList || classList.length == 0) return;

        classList.forEach((c) => {
          this.$set(c,'checked',false)
          this.$set(c,'id','')
        });
        this.classList = classList;
      },
      getGradeList() {
        let gradeList = JSON.parse(sessionStorage.getItem('gradeList')); // 获取年级列表数据

        if (!gradeList || gradeList.length == 0) return;

        gradeList.forEach((c) => {
          this.$set(c,'checked','')
          this.$set(c,'id','')
        });
        this.gradeList = gradeList;
      },
      show() {
        this.popupVisible = true;
      },
      hide() {
        this.popupVisible = false;
      },

      _touchstart(e) {
        this.startY = e.changedTouches[0].pageY
      },
      _touchmove(e) {
        let liHeight = this.type == 2 ? this.$refs.gradeLi[0].clientHeight : this.$refs.classLi[0].clientHeight;
        let liLen = this.type == 2 ? this.gradeList.length : this.newClassList.length;
        let boxH = this.$refs.scrollView.clientHeight
        let scrollHeight = liLen * liHeight;
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

      _initTab() {
        this.type = 2;
        this.tabList = [{type: 2, name: '年级'}]
      },
      _tab(type) {
        this.type = type;
        if(type == 2) {
          this.tabList = [{type: 2, name: '年级'}]
        } else {
          this.tabList = [{type: 2, name: '年级'},{type: 3, name: '班级'}]
        }
      },
      _changeTabKey(type) {
        this.type = type;
      },
      _checkedList() { // 编辑时默认被选中的值
        if(this.activityType == 2) {  // 年级
          this.gradeList.forEach((c) => {
            this.gcInfo.forEach((v) => {
              if(c.gradeCode == v.gradeCode) {
                c.checked = 'allChecked'
                c.id = v.id
              }
            })
            this.classList.forEach((m) => {
              if( c.checked == 'allChecked' && c.gradeCode == m.gradeCode) {
                m.checked = true
                m.id = c.id
              }
            })
          })
        } else { // 班级
          this.classList.forEach((c) => {
            this.gcInfo.forEach((v) => {
              if(c.classCode == v.classCode) {
                c.checked = true
                c.id = v.id
              }
            })
          })
          let arr = new Array(this.gradeList.length),arr_checked = new Array(this.gradeList.length);
          this.gradeList.forEach((c,i) => {
            let cList = [],ccList = [];
            this.classList.forEach((v) => {
              if(c.gradeCode == v.gradeCode) {
                cList.push(v)
                arr[i] = cList
                if(v.checked) {
                  ccList.push(v)
                }
                arr_checked[i] = ccList
              }
            })
          })
          arr.forEach((c,i) => {
            if (c.length == arr_checked[i].length) {
              this.gradeList[i].checked = 'allChecked'
            } else if (arr_checked[i].length == 0) {
              this.gradeList[i].checked = ''
            } else {
              this.gradeList[i].checked = 'hasChecked'
            }
          })
        }
        this._getGCInfo();
        this._initTab()
      },
      _getGCInfo() {
        let arr = [];
        this.classList.forEach((c) => {
          if (c.checked) {
            arr.push({
              name: c.className,
              classCode: c.classCode,
              gradeCode: c.gradeCode,
              id: c.id
            })
          }
        });
        this.$emit('getGCInfo',arr);
      },
      _check(key,target) {
        if(target === 'gradeList') { // 年级
          this[target][key].checked = this[target][key].checked === 'allChecked' ? '' : 'allChecked'
          this.gradeList.forEach((c) => {
            this.classList.forEach((m) => {
              if(c.gradeCode == m.gradeCode) {
                m.checked =  c.checked === 'allChecked' ? true : c.checked === 'hasChecked' ? m.checked : false
                m.id = c.id
              }
            })
          })
        } else { // 班级
          this[target][key].checked = !this[target][key].checked;
          let checkedArr = [];
          this.newClassList.forEach((c) => {
            if (c.checked) {
              checkedArr.push(c)
            }
          })

          if (checkedArr.length == this.newClassList.length) { // 全选
            this.gradeList[this.gradeKey].checked = 'allChecked';
          } else {
            if (checkedArr.length == 0) {
              this.gradeList[this.gradeKey].checked = '';
            } else {
              this.gradeList[this.gradeKey].checked = 'hasChecked';
            }
          }
        }
      },
      _findChild(gradeKey) {
        let arr = [];
        this.gradeKey = gradeKey;
        this.classList.forEach((c) => {
          if(c.gradeCode == this.gradeList[gradeKey].gradeCode) {
            c.checked = this.gradeList[gradeKey].checked == '' ? false : this.gradeList[gradeKey].checked == 'allChecked' ? true : c.checked;
            arr.push(c)
          }
        })
        this.tabList.push({type: 3, name: '班级'})
        this._changeTabKey(3)
        this.newClassList = arr;
      },
      _sure() {
        let arr = [];
        this.classList.forEach((c) => {
          if (c.checked) {
            arr.push({
              name: c.className,
              classCode: c.classCode,
              gradeCode: c.gradeCode,
              id: c.id
            })
          }
        });
        if (arr.length == 0) {
          this.$toast('请选择');
          return;
        }
        this.popupVisible = false;
        this.$emit('getGCInfo',arr);
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
        font-size: 32px;
        text-align: center;
      }
      .cancel {
        color: #B6B8B8;
      }
      .sure {
        color: #33A5FF;
      }
      .title {
        font-weight: 600;
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
            &.active {
              color: #262727;
              border-bottom: 4px solid #33A5FF;
            }
          }
        }
      }
      .tab-content {
        height: 520px;
        overflow: hidden;
        li {
          height: 95px;
        }
        .name {
          color: #262727;
          font-size: 40px;
        }
        .check-circle {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          margin-right: 20px;
          background-color: #EFF1F3;
          &.checked {
            border-color: #33A5FF;
            background-color: #33A5FF;
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
              border-color: #EFF1F3;
              transform: rotate(45deg) scale(1.5);
              transition: transform .2s;
            }
          }
          &.hasChecked {
            border-color: #33A5FF;
            background-color: #33A5FF;
            &:after {
              content: '';
              position: absolute;
              left: 50%;
              top: 50%;
              width: 30px;
              height: 4px;
              margin-left: -15px;
              margin-top: -2px;
              background-color: #EFF1F3;
            }
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
