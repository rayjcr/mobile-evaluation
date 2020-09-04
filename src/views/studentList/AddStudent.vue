<template>
  <div class="mail-list-box">
    <div class="list-top flex alignCenter">
      <div class="flex_1">
        <v-search ref="search" :placeholder="'搜索学生'" @getSearch="getSearch"></v-search>
      </div>
    </div>

    <div class="selected-all flex alignCenter" @click="selectedAllFun(true)" v-show="isSelectedAll == false">
      <div class="check-circle" :class="{'checked': isSelectedAll}"></div>
      <span>全选</span>
    </div>
    <div class="selected-all flex alignCenter" @click="selectedAllFun(false)" v-show="isSelectedAll == true">
      <div class="check-circle" :class="{'checked': isSelectedAll}"></div>
      <span>取消全选</span>
    </div>

    <div class="list-box">
      <v-scroll class="listview"
                ref="listview"
                :listen-scroll="true"
                :probe-type="3"
                :data="data"
                @scroll="handleScroll">
        <!-- left list -->
        <ul>
          <li class="list-group"
              v-for="(group, index) in data"
              :key="index"
              ref="listGroup">
            <div class="list-group-title border-topbottom">{{group.headLetter}}</div>
            <ul class="clear">
              <li class="list-group-item fl"
                  :class="{'marginRight0': (i+1)%3 == 0 ,'checked': item.checked,'disable disable2':item.status==-2,'disable disable1':item.status==-1}"
                  v-for="(item, i) in group.evaluationClassList"
                  @click="plSelectId(index,i)"
                  :key="i">
                <img class="avatar" v-if="item.gender == 1" :src="item.icon?item.icon:'/static/img/boy@2x.png'">
                <img class="avatar" v-else :src="item.icon?item.icon:'/static/img/girl@2x.png'">
                <div class="name text-overflow">{{item.studentName}}</div>
                <div class="check-circle" :class="{'checked': item.checked}"></div>
              </li>
            </ul>
          </li>
        </ul>
        <!-- right alphabet -->
        <div class="list-shortcut"
             ref="listShortcut"
             @touchstart="handleShortcutTouchStart"
             @touchmove="handleShortcutTouchMove"
             @touchend="handleShortcutTouchEnd">
          <ul>
            <!--:class="{'current': currentIndex === index}"-->
            <li class="item"
                v-for="(item, index) in shortcutList"
                :key="index"
                :data-index="index"
                :class="{'current': currentIndex === index}"
                >
              {{item}}
            </li>
          </ul>
        </div>
      </v-scroll>
    </div>
    <div class="list-bottom-pj flex alignCenter">
      <div class="flex_1 btn gray-btn" @click="cancel">取消</div>
      <div class="flex_1 btn blue-btn" @click="save">选择{{checkedList.length}}人</div>
    </div>
  </div>
</template>

<script>
  import Search from '@/components/Search.vue'
  import Scroll from '@/components/Scroll.vue'
  import {StudentApi as API} from '@/utils/api'
  const ANCHOR_HEIGHT = 18;
  export default {
    name: "AddStudent",
    data() {
      return {
        classCode: this.$route.query.classCode,// 班级代码

        data: [],
        copyArr: [],
        scrollY: -1,
        currentIndex: 0,
        pjMultiPerson: 0, // 0,默认单人评价，1，评价多人
        checkedList: [], // 存放选中人的id
        selectedxsList: [], // 存放选中的学生列表
        isSelectedAll: false,
        popupVisible: false,
        allDataLen: 0,
      }
    },
    components: {
      'v-search': Search,
      'v-scroll': Scroll
    },
    watch: {
      data() {
        this.$nextTick(() => {
          if(this.data.length > 0) {
            this._calcGroupHeight()
          }
        })
      },
      scrollY(newY) {
        const heightList = this.heightList
        // 当滚动到最顶部，newY > 0（对应操作：在最顶部向下拉）
        if (newY > 0) {
          newY = 0
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动，正常情况
        for (let i = 0; i < heightList.length - 1; i++) {
          let heightTop = heightList[i]
          let heightBottom = heightList[i + 1]
          if (-newY >= heightTop && -newY < heightBottom) {
            this.currentIndex = i
            return
          }
        }
        // 当滚动到底部，且-newY 大于最后一个元素的上限
        this.currentIndex = heightList.length - 2
      }
    },
    computed: {
      shortcutList() {
        return this.data.map(group => {
          return group.headLetter.slice(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].headLetter : ''
      }
    },
    created() {
      this.touch = {}
      this.heightList = [];
    },
    activated() {
      Promise.all([this.initData(),this.getStudentList()]).then(() => {}).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    methods: {
      async getStudentList() {
        this.checkedList = [];

        let data = {
          classCode: this.classCode,
          orderType: 'name',
          teacherCode: this.$cookie.get('userId')
        };
        var stulist= sessionStorage.getItem('avaliablexsList');
        if(stulist){
          document.title = '选择协作人'
          // sessionStorage.removeItem('avaliablexsList');
          this.data = JSON.parse(stulist);
          this.copyArr = JSON.parse(JSON.stringify(this.data));
          if (this.selectedxsList.length > 0) { // 默认选中
            this.selectedFun(this.data) // 对应学生勾选

            this.selectedxsList.forEach((c) => {
              this.checkedList.push({
                id: c.studentId,
                studentId: c.studentId,
                name: c.name,
                gender: c.gender,
                number: c.number,
                icon: ''
              });
            })
          }
          return 
        }
        const res = await this.$req.get(API.getEvaluationClassStudentList, data);
        if (res.resultCode == 1) {
          this.data = res.value;
          this.copyArr = JSON.parse(JSON.stringify(res.value));

          if (this.selectedxsList.length > 0) { // 默认选中
            this.selectedFun(res.value) // 对应学生勾选

            this.selectedxsList.forEach((c) => {
              this.checkedList.push({
                id: c.studentId,
                studentId: c.studentId,
                name: c.name,
                gender: c.gender,
                number: c.number,
                icon: ''
              });
            })
          }
        }
      },
      getSearch(value) {
        this.isSelectedAll = false;
        this.checkedList = [];

        let a = value.replace(/(^\s*)|(\s*$)/g, "");
        if (a == '') {
          let arr = JSON.parse(JSON.stringify(this.copyArr));
          this.data = arr;
          return;
        }
        let arr = [],newArr = [];
        this.data.forEach((value,index) => {
          arr[index] = value;
          arr[index].evaluationClassList = value.evaluationClassList.filter(
            item => item.studentName.indexOf(a) >= 0)
        });
        arr.forEach((c) => {
          if (c.evaluationClassList.length > 0) {
            c.evaluationClassList.forEach((v) => {
              v.checked = false;
            })
            newArr.push(c)
          }
        });
        this.data = newArr;

      },
      selectedFun(data) {
        data.forEach((c) => {
            c.evaluationClassList.forEach((v) => {
              this.selectedxsList.forEach((b) => {
                if (v.studentCode == b.studentId) {
                  this.$set(v,'checked',true);
                }
              })
            })
        })
      },
      plSelectId(key,tarKey) {
        if(this.data[key].evaluationClassList[tarKey].status&&this.data[key].evaluationClassList[tarKey].status!=1){
          // 不可选
          return
        }
        this.checkedList = [];
        let target = this.data[key].evaluationClassList[tarKey];
        let checked = target.checked;
        this.$set(target,'checked',!checked);

        this.data.forEach((c) => {
          c.evaluationClassList.forEach((v) => {
            if (v.checked) {
              this.checkedList.push({
                id: v.studentCode,
                studentId: v.studentCode,
                name: v.studentName,
                number: 1,
                gender: v.gender,
                icon: v.icon
              });
            }
          })
        });

        if (this.allDataLen != 0 && this.checkedList.length == this.allDataLen) {
          this.isSelectedAll = true
        } else {
          this.isSelectedAll = false
        }
      },
      setSelectedAll(bolean) {
        this.checkedList = [];

        this.data.forEach((c) => {
          c.evaluationClassList.forEach((v) => {
            if(v.status&&v.status!=1){
              // 不可选
            } else {
              this.$set(v,'checked',bolean);
              if (bolean) this.checkedList.push({
                id: v.studentCode,
                studentId: v.studentCode,
                name: v.studentName,
                number: 1,
                gender: v.gender,
                icon: v.icon
              });              
            }
          })
        })
      },
      selectedAllFun(bool) {
        this.isSelectedAll = bool;
        this.setSelectedAll(bool);
        this.allDataLen = this.checkedList.length;
      },
      initData() {
        this.setSelectedAll(false);
        this.isSelectedAll = false;
        this.$refs.search.keyWord = '';
        this.allDataLen = 0;
        this.classCode = this.$route.query.classCode;

        let selectedxsList = sessionStorage.getItem('selectedxsList') || '[]';
        this.selectedxsList = JSON.parse(selectedxsList);
      },
      cancel() {
        this.$router.back();
      },
      save() {
        if(this.checkedList.length > 0) {
          if(this.$route.query.origin == 'editGroup') { // 来源编辑小组
            let groupInfo = {
              groupName: sessionStorage.getItem('groupName'),
              groupId: JSON.parse(sessionStorage.getItem('groupInfo')).groupId,
              members: this.checkedList
            };
            sessionStorage.setItem('groupInfo',JSON.stringify(groupInfo)) // 存储选中学生列表
          } else {
            sessionStorage.setItem('selectedxsList',JSON.stringify(this.checkedList)) // 存储选中学生列表
          }

          setTimeout(() => {
            this.$router.back();
          },100)
        }
      },
      handleShortcutTouchStart(e) {
        this.$refs.listShortcut.style.backgroundColor = 'rgba(0, 0, 0, .2)';
        const anchorIndex = +e.target.dataset['index'] // 获取到的是字符串
        this.touch.y1 = e.touches[0].pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      handleShortcutTouchMove(e) {
        this.touch.y2 = e.touches[0].pageY
        let deltaIndex = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT
        deltaIndex = Math.floor(deltaIndex)
        const anchorIndex = this.touch.anchorIndex + deltaIndex
        this._scrollTo(anchorIndex)
      },
      handleShortcutTouchEnd(e) {
        this.$refs.listShortcut.style.backgroundColor = 'rgba(255, 255, 255, .3)'
      },
      handleScroll(pos) {
        this.scrollY = pos.y
      },
      _calcGroupHeight() {
        this.heightList = []
        const listEl = this.$refs.listGroup
        let height = 0
        this.heightList.push(height)
        for (let i = 0; i < listEl.length; i++) {
          let item = listEl[i]
          height += item.clientHeight
          this.heightList.push(height)
        }
      },
      _scrollTo(index) {
        // 点击上下多余部分
        if (Object.is(index, null) || Object.is(index, NaN)) {
          return
        }
        // 边界情况
        if (index < 0) {
          index = 0
        }
        if (index > this.heightList.length - 2) {
          index = this.heightList.length - 2
        }
        this.scrollY = -this.heightList[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      }
    }
  }
</script>

<style lang="less" scoped>
  .mail-list-box {
    height: 100%;

    .list-top {
      height: 90px;
      padding: 0 32px;
      background-color: #ffffff;
    }

    .selected-all {
      width: 190px;
      height: 44px;
      margin-left: 32px;
      padding-top: 30px;
      span {
        color: #262727;
        margin-left: 20px;
      }

      .check-circle {
        position: relative;
        width: 40px;
        height: 40px;
        background: url('/static/img/icon_radio_white@2x.png') no-repeat center;
        background-size: 40px auto;
        &.checked {
          background: url('/static/img/icon_radio_checked@2x.png') no-repeat center;
          background-size: 40px auto;
        }
      }
    }

    .list-box {
      padding: 0 12px 0 34px;
      height: calc(100% - 260px);

      .listview {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .list-group {
          .list-group-title {
            padding-top: 40px;
            padding-bottom: 20px;
            color: #B6B8B8;
            font-size: 28px;
          }
          .list-group-item {
            position: relative;
            width: 180px;
            height: 200px;
            text-align: center;
            margin-right: 20px;
            margin-bottom: 30px;
            border-radius: 20px;
            background-color: #ffffff;
            box-sizing: border-box;
            &.marginRight0 {
              margin-right: 0;
            }
            &.checked {
              border: 2px solid #33A5FF;
            }
            &.disable::before{
              content: '';
              background:rgba(0,0,0,0.5);
              position: absolute;
              left: 0;
              top: 0;
              width:100%;
              height:100%;
              z-index: 9;
              border-radius: 20px;
              font-size:14px;
              font-family:PingFang SC;
              font-weight:400;
              color:rgba(255,255,255,1);
              text-align: center;
              white-space:pre;
              box-sizing: border-box;
            }
            &.disable1::before{
              padding-top: 35%;
              content: '不可选\A(已接本任务)';
            }
            &.disable2::before{
              padding-top: 30%;
              content: '不可选\A(可接任务数\A达到上限)';
            }
            .check-circle {
              position: absolute;
              right: 8px;
              top: 8px;
              width: 40px;
              height: 40px;
              background: url('/static/img/icon_radio@2x.png') no-repeat center;
              background-size: 40px auto;
              &.checked {
                background: url('/static/img/icon_radio_checked@2x.png') no-repeat center;
                background-size: 40px auto;
              }
            }
            .avatar {
              width: 100px;
              height: 100px;
              border-radius: 50%;
              margin: 20px 0 20px 0;
            }
            .name {
              padding: 0 32px;
              color: #262627;
              font-size: 28px;
            }
          }
        }
        .list-shortcut {
          z-index: 1;
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          width: 40px;
          padding: 40px 0;
          border-radius: 10px;
          text-align: center;
          & .item {
            padding: 3px;
            line-height: 1;
            color: #B6B8B8;
            font-size: 28px;
            &.current {
              color: #33A5FF;
            }
          }
        }
      }
    }

    .list-bottom-pj {
      height: 110px;
      padding: 0 32px;
      background-color: #ffffff;
      .btn {
        height: 88px;
        line-height: 88px;
        text-align: center;
        font-size: 30px;
        cursor: pointer;
        margin-bottom: 10px;
        border-radius: 50px;
      }
      .gray-btn {
        margin-right: 46px;
      }
    }

  }
</style>
