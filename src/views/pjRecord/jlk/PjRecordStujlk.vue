<template>
  <div class="record-jlk-box">
    <div class="record-content">
      <div class="search-box1" @click="popupVisible=true">
        <span>{{rankTimeType == 1 ? '按周' : '按月'}}</span>
        <span class="icon_down"></span>
      </div>
      <div class="section">
        <!--时间本周本月本学期-->
        <v-time ref="time" @getTimeWB="getTimeWB"></v-time>

        <div class="jlk-box">
          <p>本{{rankTimeType == 1 ? '周' : '月'}}共获卡<span>{{totalCount}}</span>张，比上{{rankTimeType == 1 ? '周' : '月'}}{{totalCount - preTotalCount > 0 ? '多' : '少'}}获<span>{{Math.abs(totalCount - preTotalCount)}}</span>张<span class="jiantou">{{totalCount - preTotalCount > 0 ? '↑' : '↓'}}</span></p>
          <p class="marginBottom20">收到提醒<span>{{txCount}}</span>次</p>
          <div class="jlk-list clear">
            <div class="fl" :class="{'margin' : (index+1)%2 != 0}" v-for="(item,index) in list" :key="index">
              <div class="img-box">
                <img :src="item.icon">
              </div>
              <div class="bottom">
                <div class="left text-overflow">{{item.name}}</div>
                <div class="right">
                  <span class="num">{{item.totalMedal}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tab-box clear">
        <div class="tab-item fl" @click="_tab(1)">获卡</div>
        <div class="tab-item fl" @click="_tab(2)">提醒</div>
        <span :class="{'span_left0': type == 1, 'span_left100': type == 2}">{{type == 1 ? '获卡' : '提醒'}}</span>
      </div>
      <div class="section">
        <div class="top flex alignCenter">
          <div class="title flex_1">{{ type == 1 ? '获卡记录' : '提醒记录' }}</div>
          <div class="right">
            <v-search ref="search" :placeholder="'搜索记录'" @getSearch="getSearch"></v-search>
          </div>
        </div>
        <div class="content" v-show="type == 1">
          <v-jlk-send v-if="recordList.length > 0" type='3' :list="recordList"></v-jlk-send>
          <div class="empty" v-else>
            <v-empty-list :text="'无数据'"></v-empty-list>
          </div>
        </div>
        <div class="content" v-show="type == 2">
          <v-jlk-tx v-if="txList.length > 0" :list="txList"></v-jlk-tx>
          <div class="empty" v-else>
            <v-empty-list :text="'无数据'"></v-empty-list>
          </div>
        </div>
      </div>
    </div>

    <!--撤销评价记录？-->
    <v-confirm ref="confirm" content="撤销后该记录在教师端/学生端都不显示，学生增加/减少的分数或者勋章原路返回" @sure="undoRecord"></v-confirm>


    <!--选择器-->
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
      <mt-picker :slots="dataList" :visible-item-count="5" :show-toolbar="true" ref="picker" value-key="name"
                 :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm">完成</div>
        </div>
      </mt-picker>
    </mt-popup>

    <!--底部判断是加载图标还是提示“全部加载”-->
    <div class="wait-list-loading" v-show="queryLoading" v-if="recordList.length > 10">
      <span v-show="moreLoading&&!allLoaded">加载中...</span>
      <span v-show="allLoaded">已全部加载</span>
    </div>
  </div>
</template>

<script>
  import {PjApi,RemindApi} from '@/utils/api'

  import Time from '@/components/time/Time.vue'
  import Search from '@/components/Search.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import Confirm from "@/components/confirm/confirm.vue";

  import JLKSend from './jlk-send.vue'
  import JLKTX from './jlk-tx.vue'

  export default {
    name: "PjRecordStujlk",
    components: {
      'v-time': Time,
      'v-search': Search,
      'v-jlk-send': JLKSend, // 发卡
      'v-jlk-tx': JLKTX, // 提醒
      "v-confirm": Confirm,
      'v-empty-list': EmptyList
    },
    data() {
      return {
        userId: this.$cookie.get('userId'),
        type: 1, // 1发卡,2提醒
        popupVisible: false,
        queryLoading: true,
        moreLoading: false,
        allLoaded: false,
        isbool: true, // 滚动到底部加载数据并且防止触发多次
        page: 1, // 当前页码
        limit: 10, // 每页显示记录条数
        totalCount: 0, // 本周共发卡
        preTotalCount: 0, // 上周共发卡
        txCount: 0, // 收到提醒数
        keyWords: '',
        startTime: '',
        endTime: '',
        rankTimeType: 1,
        timeList: [
          {type: 1,name: '按周'},
          {type: 2,name: '按月'}
        ],
        list: [], // 获卡列表
        recordList: [],
        txList: []
      }
    },
    computed: {
      dataList() {
        let dateSlots = [
          {
            flex: 1,
            values: this.timeList,
            className: 'slot1',
            textAlign: 'center'
          }
        ];
        return dateSlots
      }
    },
    watch: {
      startTime(nVal) {
        if(nVal) {
          Promise.all([
            this.initData(),
            this.getRecordInfo(),
            this.getPageList(),
            this.getRecordList()
          ]).then((result) => {}).catch((error) => {
            console.log(error)
          })
        }
      }
    },
    activated() {
      this.$refs.search.keyWord = '';

      let p1 = this.initWeek,
          p2 = this.initData,
          p3 = null,
          p4 = null,
          p5 = null;

      //默认在按周查询才请求
      if(this.rankTimeType == 1) {
        p3 = this.getRecordInfo; // 获取激励卡一级子勋章获取统计
        p4 = this.getPageList; // 获取提醒数目
        p5 = this.getRecordList
      }

      this.type = 1; // 默认发卡

      Promise.all([
        p1(),
        p2(),
        p3 ? p3() : null,
        p4 ? p4() : null,
        p5 ? p5() : null
      ]).then((result) => {}).catch((error) => {
        console.log(error)
      })
    },
    methods: {
      /*
      * 获取激励卡一级子勋章获取统计
      * */
      async getRecordInfo() {
        if(!this.startTime) return;
        let data = {
          rankTimeType: this.rankTimeType,
          startTime: this.startTime,
          studentId: this.userId
        };
        const res = await this.$req.get(PjApi.recordInfo, data);
        if (res.resultCode == 1) {
          this.totalCount = res.value.totalCount || 0;
          this.preTotalCount = res.value.preTotalCount || 0;
          this.list = res.value.list || []
        }
      },
      /*
      * 获取发卡记录列表
      * */
      async getRecordList() {
        if(!this.startTime) return;
        this.$indicator.open('请稍后...');
        let data = {
          //status: 1,
          type: '1,2',
          page: this.page,
          limit: this.limit,
          userId: this.userId,
          keyWords: this.keyWords,
          rewardType: 5,
          startTime: this.rankTimeType == 1 ? this.startTime : this.startTime + ' 00:00:00',
          endTime: this.rankTimeType == 1 ? this.endTime : this.endTime + ' 23:59:59'
        };
        this.isbool = false;
        const res = await this.$req.post(PjApi.getPjxRecordList, data);
        let {resultCode,value} = res;
        if (resultCode == 1) {
          let list = value.dataList;
          let arr = list.filter((c) => {
            return c.score || c.medal
          })
          this.recordList = [...this.recordList, ...arr];

          if (value.dataList.length >= this.limit) {
            this.page++;
          } else {
            this.allLoaded = true;
          }
          this.isbool = true;
        }
      },
      /*
      * 获取提醒记录列表
      * */
      async getPageList() {
        if(!this.startTime) return;
        let data = {
          page: this.page,
          limit: this.limit,
          timeType: this.rankTimeType,
          studentId: this.userId,
          keyWord: this.keyWords,
          startTime: this.rankTimeType == 1 ? this.startTime : this.startTime + ' 00:00:00'
        }
        this.isbool = false;
        const res = await this.$req.get(RemindApi.getPageList, data);
        if(res.resultCode == 1) {
          this.txCount = res.value.totalCount;

          this.txList = [...this.txList, ...res.value.dataList]
          if (res.value.dataList.length >= this.limit) {
            this.page++
          } else {
            this.allLoaded = true
          }
          this.isbool = true;
        }
      },
      /*
      * 撤销评价记录
      * */
      async undoRecord() {
        const res = await this.$req.put(API.undoRecord+this.recordId);

        if (res.resultCode == 1) {
          this.$toast('撤销成功');
          this.$refs.confirm._hide();
          this.$root.eventHub.$emit('closeDetailModal');
          let p1 = this.initData,
            p2 = null;
          if(this.evaluationObject == 3) {
            p2 = this.getTeamList
          } else {
            p2 = this.getRecordList
          }
          Promise.all([p1(), p2 ? p2() : null]).then(() => {
          }).catch((error) => {
            console.log(error);
          });
        }
      },
      /*
      * 是否撤销评价记录?
      * */
      revokeRecord(id) {
        this.recordId = id;
        this.$refs.confirm._show();
      },
      /*
      * 关键词搜索
      * */
      getSearch(keyWords) {
        this.initData();
        this.keyWords = keyWords;
        if (this.type == 1) {
          this.getRecordList()
        } else {
          this.getPageList()
        }
      },
      initData() {
        this.page = 1;
        this.allLoaded = false;
        this.popupVisible = false;
        this.recordList = [];
        this.txList = []
      },
      /*
      * 初始化周次
      * */
      initWeek () {
        this.rankTimeType = 1;
        this.$refs.time.type = 1;
      },
      /*
      * 获取周次信息
      * */
      getTimeWB(data) {
        this.startTime = data.startTime;
        this.endTime = data.endTime
      },
      onConfirm() {
        let subjectSelected = this.$refs.picker.getValues()[0];
        this.rankTimeType = subjectSelected.type;
        this.$refs.time.type = this.rankTimeType;
        this.popupVisible = false;
      },
      initHttp() {
        if(this.type == 1) { // 发卡
          this.getRecordList()
        } else { // 提醒
          this.getPageList()
        }
      },
      _tab(type) {
        this.type = type;
        this.$refs.search.keyWord = '';
        if(this.startTime) {
          Promise.all([
            this.initData(),
            this.initHttp()]
          ).then((result) => {}).catch((error) => {
            console.log(error)
          })
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .record-jlk-box {
    .tab-box {
      position: relative;
      width: 320px;
      height: 60px;
      border-radius: 34px;
      cursor: pointer;
      margin: 20px 0;
      background-color: #FFFFFF;
      .tab-item {
        width: 50%;
        line-height: 60px;
        text-align: center;
        color: #B6B8B8;
        font-size: 30px;
      }
      .active {
        color: #ffffff;
      }
      span {
        position: absolute;
        top: 0;
        width: 160px;
        height: 60px;
        line-height: 60px;
        color: #ffffff;
        font-size: 30px;
        text-align: center;
        border-radius: 34px;
        background-color: #33A5FF;
        transition: all .2s;
      }
      .span_left0 {
        left: 0;
      }
      .span_left100 {
        left: 160px
      }
    }
    .record-content {
      padding: 0 32px;
      .search-box1 {
        width: 200px;
        height: 88px;
        line-height: 88px;
        span {
          color: #262727;
          font-size: 28px;
          margin-right: 10px;
        }
        .icon_down {
          display: inline-block;
          width: 33px;
          height: 28px;
          vertical-align: top;
          background: url('/static/img/icon_down@2x.png') no-repeat center;
          background-size: 33px auto;
          margin-top: 30px;
        }
      }
      .section {
        margin-bottom: 20px;
        border-radius: 20px;
        background-color: #FFFFFF;
        .jlk-box {
          margin: 0 30px;
          border-top: 2px solid #EFF1F3;
          p {
            color: #262627;
            font-size: 32px;
            margin-top: 20px;
            span {
              color: #33A5FF;
              font-weight: 600;
            }
          }
          .marginBottom20{
            margin-bottom: 20px;
          }
          .jlk-list {
            .fl {
              margin-bottom: 30px;
            }
            .margin {
              margin-left: 40px;
              margin-right: 100px;
            }
            .img-box {
              width: 216px;
              height: 100px;
              img {
                width: 100%;
                height: 100%;
              }
            }
            .bottom  {
              position: relative;
              color: #262727;
              font-size: 28px;
              margin-top: 20px;
              .name {
                display: inline-block;
                width: 150px;
              }
              .left {
                width: 150px;
              }
              .right {
                position: absolute;
                bottom: -5px;
                right: 0;
              }
              span {
                color: #33A5FF;
                font-weight: 600;
              }
              .num {
                font-size: 48px;
                &:before {
                  content: 'X';
                  font-size: 28px;
                  position: absolute;
                  left: -25px;
                  bottom: 5px;
                }
              }
            }
          }
          .student-list {
            padding-left: 40px;
            padding-bottom: 40px;
            li {
              text-align: center;
              margin-right: 84px;
            }
            .marginRight0 {
              margin-right: 0;
            }
            .img-box {
              width: 120px;
              height: 120px;
              margin-bottom: 20px;
              img {
                width: 100%;
                height: 100%;
                border-radius: 100%;
              }
            }
            .name {
              color: #262627;
              font-size: 36px;
              font-weight: 600;
              margin-bottom: 5px;
            }
            .class {
              color: #B6B8B8;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .cs {
              color: #262727;
              font-size: 28px;
              span {
                color: #33A5FF;
              }
            }
          }
        }
        .top {
          padding: 0 32px;
          height: 84px;
          border-bottom: 2px solid #EFF1F3;
          .title {
            color: #262727;
            font-size: 36px;
            font-weight: 600;
          }
          .right {
            width: 360px;
          }
        }
        .content {
          padding: 0 32px;
        }
        .empty {
          position: relative;
          height: 500px;
        }
      }
    }
    .wait-list-loading {
      height: 80px;
      line-height: 80px;
      text-align: center;
    }
  }
</style>
