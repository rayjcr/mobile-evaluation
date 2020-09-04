<template>
  <div class="student-home-page scrollY" ref="viewBox">
    <div class="header flex alignCenter">
      <div class="avatar"></div>
      <div class="name">{{studentName}}</div>
      <div class="userLevel" v-if="userLevel" :style="{backgroundImage:  'url(' + userLevel + ')'}"></div>
    </div>

    <!--分数和勋章展示-->
    <section v-if="reportCard">
      <div class="flex alignCenter" style="height: 100%;">
        <div class="flex_1 flex_item">
          <div class="num">{{reportCard.totalScore || 0}}</div>
          <p class="title">{{xxdm == 754 ? '累计长青币' : '总积分'}}</p>
        </div>
        <div class="flex_1 flex_item">
          <div class="num">{{totalMedalNum || 0}}</div>
          <p class="title">{{xxdm == 754 ? '总青藤章' : '总勋章数'}}</p>
        </div>
        <div class="flex_1 flex_item">
          <div class="num">{{reportCard.availableMedalNum || 0}}</div>
          <p class="title">{{xxdm == 754 ? '可用青藤章' : '可用勋章数'}}</p>
        </div>
      </div>
    </section>

    <!--勋章墙-->
    <div class="medal-title flex alignCenter">
      <div class="title">勋章墙</div>
      <!-- <div class="right flex alignCenter">
        全部勋章
        <i class="mintui mintui-back"></i>
      </div> -->
    </div>
    <div class="medal-box">
      <v-medal-wall>
        <div class="medal-list clear" v-if="medalList.length > 0">
          <div class="medal-item fl" :class="{'marginRight0': (index+1) % 4 == 0}" v-for="(item,index) in medalList"
              :key="index" @click="showMedalModal(index)">
            <div class="img-box">
              <img :src="item.icon" :class="{'opacity' : !item.have}">
              <img src="./img/noHave@2x.png" class="noHave" v-if="!item.have">
            </div>
            <p class="text-overflow">{{item.name}}</p>
          </div>
        </div>
        <div class="no-medal flex alignCenter justifyCenter" v-else>后台暂未配置勋章</div>
      </v-medal-wall>
    </div>
    
    <!--评价-->
    <div class="pj-box">
      <div class="pj-top">评价</div>
      <div class="search-box flex alignCenter" @click="popupVisible=true">
          {{searchTime}}
        </div>
      <!--图表统计-->
      <div class="record-echarts">
        <!--时间本周本月本学期-->
        <v-time ref="time" @getTimeWB="getTimeWB"></v-time>
        <div class="flex echarts-box">
          <v-line ref="lineChart"></v-line>
        </div>
      </div>

      <!--评价详情-->
      <div class="pj-record-box">
        <v-record-list
          :pjTabList="pjTabList"
          :recordList="list"
          @getRewardType="getRewardType"
        ></v-record-list>
      </div>
    </div>
    

    <!--选择器-->
    <mt-popup v-model="popupVisible" v-roll:visible=[popupVisible,show_medal_modal] position="bottom" class="mint-popup">
      <mt-picker :slots="dataList"  :visible-item-count="5" :show-toolbar="true"  ref="picker" value-key="name" :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm">完成</div>
        </div>
      </mt-picker>
    </mt-popup>

    <!-- 勋章展示弹窗 -->
    <transition name="fade">
      <div class="medal-modal-box" v-show="show_medal_modal" v-roll:visible=[popupVisible,show_medal_modal]>
        <div class="rotate-box"></div>
        <div class="content">
          <div class="content-top">
            <div class="img-box">
              <img :src="medalInfo.icon" alt="">
            </div>
            <p>{{medalInfo.name}}</p>
          </div>
          <div class="content-footer" @click="show_medal_modal = false">×</div>
        </div>
      </div>
    </transition>

    <!--底部判断是加载图标还是提示“全部加载”-->
    <div class="wait-list-loading" v-if="list.length > 10" v-show="queryLoading">
      <span v-show="moreLoading&&!allLoaded">加载中...</span>
      <span v-show="allLoaded">已全部加载</span>
    </div>
  </div>
</template>

<script>
  import RecordList from '@/components/pjRecord/RecordList.vue'
  import Confirm from "@/components/confirm/confirm.vue"
  import LineChart from '@/components/echarts/Line.vue'
  import MedalWall from '@/components/MedalWall.vue'
  import Time from '@/components/time/Time.vue'

  import { PjApi,CountApi,MedalApi,RWDJApi } from '@/utils/api'

  export default {
    name: "StudentHome",
    components: {
      'v-line': LineChart,
      'v-time': Time,
      'v-medal-wall': MedalWall,
      'v-record-list': RecordList
    },
    data() {
      return {
        classCode: this.$route.query.classCode,// 班级代码
        studentName: this.$route.query.studentName,// 学生姓名
        studentCode: this.$route.query.studentCode,// 学生代码
        weekId: this.$route.query.weekId,// 学生代码
        xxdm: this.$cookie.get('xxdm'),

        queryLoading: true,
        moreLoading: false,
        allLoaded: false,
        popupVisible: false,
        show_medal_modal: false, // 勋章展示弹窗显隐
        isbool: true, // 滚动到底部加载数据并且防止触发多次
        page: 1, // 当前页码
        limit: 10, // 每页显示记录条数
        evaluationObject: 1, // 1,学生，2，班级
        rewardType: 0,
        pjTabList: [
          {type: 0,name: '全部'},
          {type: 3,name: '加分'},
          {type: 4,name: '减分'},
          {type: 5,name: '奖励勋章'},
          {type: 6,name: '扣除勋章'}
        ],
        userLevel: '',
        searchTime: '按周',
        date: '',
        startTime: '',
        endTime: '',
        type: this.$route.query.type || 1, //（1:按周，2:按月）
        timeList: [
          {type: 1,name: '按周'},
          {type: 2,name: '按月'}
        ],
        list: [],
        medalList: [],// 勋章墙
        medalInfo: {}, // 当前点击的勋章详情
        reportCard: null, // 分数和勋章
        totalMedalNum: 0, // 总勋章数
      }
    },
    computed: {
      dataList () {
        let dateSlots = [
          {
            flex: 1,
            values: this.timeList,
            className: 'slot1',
            textAlign: 'center'
          }
        ];
        return  dateSlots
      },
    },
    activated() {
      Promise.all([
        this.getQuery(),
        this.initData(),
        this.getRWDJ(),
        this.getMedalList(),
        this.getStuEvaluationData(),
        this.getMedalTotalStatistics(),
        this.getRecordList(),
      ]).then(() => {}).catch((error) => {
        console.log(error);      // 失败了，打出 '失败'
      });
    },
    mounted() {
      this.loadMore();
      this.initWeek();
    },
    methods: {
      /*
      * 获取人物等级信息
      * */
      async getRWDJ () {
        const res = await this.$req.get_special(RWDJApi.getUserDJ, this.studentCode)
        if (res.resultCode == 1) {
          this.userLevel = res.value ? res.value.icon : null
        }
      },
      /*
      * 获取分数和勋章的展示
      * */
      async getStuEvaluationData() {
        this.totalMedalNum = 0;
        const res = await this.$req.get_special(CountApi.getStuEvaluationData, this.studentCode);
        if(res.resultCode == 1) {
          let { reportCardMedalVOS } = res.value;
          this.reportCard = res.value;
          // 总勋章数
          reportCardMedalVOS && reportCardMedalVOS.forEach((c) => {
            this.totalMedalNum = parseInt(this.totalMedalNum - 0) + parseInt(c.medalNum - 0);
          })
        }
      },
      /*
      * 获取勋章墙
      * */
      async getMedalList () {
        const res = await this.$req.get_special(MedalApi.studentMedal, this.studentCode)
        if (res.resultCode == 1) {
          this.medalList = res.value;
        }
      },
      /*
      * 获取统计信息
      * */
      async getMedalTotalStatistics() {
        if (!this.date) return;
        let data = {
          userId: this.studentCode,
          type: this.type,
          date: this.date
        };
        const res = await this.$req.get(CountApi.studentMedalTotalStatistics, data);
        let {resultCode,value} = res;
        if (resultCode == 1) {
          let xAxisData = [], seriesData = [];
          value.forEach((c) => {
            xAxisData.push(c.tag);
            seriesData.push(c.count);
          })
          this.$refs.lineChart.lineOptions.xAxis.data = xAxisData;
          this.$refs.lineChart.lineOptions.series[0].data = seriesData;
          this.$refs.lineChart.clear();
          setTimeout(() => {
            this.$refs.lineChart.initChart()
          })
        }
      },
      /*
      * 获取记录列表
      * */
      async getRecordList() {
        if (!this.startTime) return;
        this.$indicator.open('加载中...');
        let data = {
          type: '1,2,5,7', // 1.录入型 2.任务型 3.学生上传 5.班级荣誉
          status: this.$cookie.get('userType') <= 3 ? null : 1, // 0.待审核 1.审核通过 -1.审核不通过 2.撤销
          page: this.page,
          limit: this.limit,
          evaluationObject: 1,
          rewardType: this.rewardType,
          userId: this.studentCode,
          startTime: this.startTime.replace(/-/g, "/"),
          endTime: this.endTime.replace(/-/g, "/")
        };
        this.isbool = false;
        const res = await this.$req.get(PjApi.getRecordList, data);
        let {resultCode,value} = res;
        if (resultCode == 1) {
          if (value.dataList.length >= this.limit) {
            this.page++;
          } else {
            this.allLoaded = true;
          }
          let arr = value.dataList.filter((c) => {
            return c.score || c.medal
          })
          this.list = [...this.list,...arr];
          this.isbool = true;
        }
      },

      /*
      * 勋章展示
      * */
      showMedalModal(key) {
        this.medalInfo = this.medalList[key];
        this.show_medal_modal = true;
      },
      /*
      * 初始化周次信息
      * */
      initWeek() {
        this.type = 1;
        this.$refs.time.type = 1;
        this.searchTime = '按周';
      },
      getQuery() {
        this.classCode = this.$route.query.classCode;
        this.studentName = this.$route.query.studentName;
        this.studentCode = this.$route.query.studentCode;
        this.weekId = this.$route.query.weekId;
      },
      /*
      * 切换奖惩项
      * */
      getRewardType(key) {
        this.rewardType = this.pjTabList[key].type;
        this.initData();
        this.getRecordList()
      },
      initData() {
        this.page = 1;
        this.allLoaded = false;
        this.popupVisible = false;
        this.show_medal_modal = false;
        this.list = [];
      },
      onConfirm() {
        let subjectSelected = this.$refs.picker.getValues()[0];
        this.searchTime = subjectSelected.name;
        this.$refs.time.type = subjectSelected.type;
        this.type = subjectSelected.type;
        this.popupVisible = false
      },
      getTimeWB(data) {
        console.log(data)
        this.date = data.startTime.replace(/-/g,'/');
        this.startTime = data.startTime;
        this.endTime = data.endTime;

        Promise.all([
          this.initData(),
          this.getMedalTotalStatistics(),
          this.getRecordList()
        ]).then(() => {}).catch((error) => {
            console.log(error);      // 失败了，打出 '失败'
        });
      },
      loadMore() {
        this.$refs.viewBox.addEventListener('scroll', () => {
          let scrollTop = this.$refs.viewBox.scrollTop;
          this.scrollTop = scrollTop;
          let windowHeight = this.$refs.viewBox.clientHeight;
          let scrollHeight = this.$refs.viewBox.scrollHeight;
          if (scrollTop + windowHeight >= scrollHeight && this.isbool) {
            if (this.allLoaded) {
              this.moreLoading = true;
              return
            }
            this.moreLoading = true;
            this.isbool = false;
            this.getRecordList()
          }
        })
      },
    }
  }
</script>

<style lang="less" scoped>
  .student-home-page {
    position: relative;
    height: 100%;
    padding: 0 32px;
    background-image: url(./img/head_bg@2x.png);
    background-color: #F8F0E0;
    background-repeat: no-repeat;
    background-size: 100% 387px;

    .header {
      margin-top: 40px;
      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background-image: url(/static/img/avatar@2x.png);
        background-color: #F8F0E0;
        background-repeat: no-repeat;
        background-size: 100px auto;
      }
      .name {
        color: #ffffff;
        font-size: 48px;
        font-weight: 600;
        margin: 0 16px;
      }
      .userLevel {
        width: 48px;
        height: 48px;
        margin-left: 20px;
        background-size: 48px auto;
        background-repeat: no-repeat;
        background-position: center;
      }
    }
    section {
      position: relative;
      width: 100%;
      height: 220px;
      margin: 40px auto 42px;
      background-color: #FFFFFF;
      box-shadow: 0 8px 40px rgba(255,123,18,0.15);
      border-radius: 16px;
      &:before {
        content: '';
        position: absolute;
        top: 20px;
        left: 20px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        transform: scale(.5);
        background-color: #FFCD50;
      }
      &:after {
        content: '';
        position: absolute;
        top: 20px;
        right: 20px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        transform: scale(.5);
        background-color: #FFCD50;
      }

      .flex_item {
        text-align: center;
      }
      .num {
        color: #262727;
        margin-bottom: 10px;
        font-size: 66px;
        font-weight: 600;
      }
      .title {
        color: #BFBFBF;
        font-size: 26px;
      }
    }
    .medal-title {
      height: 136px;
      .title {
        color: #262626;
        font-size: 40px;
        font-weight: 600;
      }
      .right {
        color: #B6B8B8;
        .mintui-back { 
          transform: rotate(-180deg);
        }
      }
    }
    .medal-box {
      padding: 32px 0;
    }
    .medal-list {
      padding: 30px;
      .medal-item {
        width: 120px;
        text-align: center;
        margin-right: 26px;
        margin-bottom: 28px;
        &.marginRight0 {
          margin-right: 0;
        }
        .img-box {
          position: relative;
        }
        img {
          display: inline-block;
          width: 90px;
          height: 90px;
          &.opacity {
            opacity: 0.6;
          }
        }
        .noHave {
          position: absolute;
          width: 90px;
          height: 50px;
          top: 50%;
          left: 50%;
          margin-top: -25px;
          margin-left: -45px;
        }
      }
    }
    .no-medal {
      height: 100%;
      font-size: 36px;
      color: #B6B8B8;
    }
    .pj-box {
      position: relative;
      border-top: 2px solid #FFB600;
      .pj-top {
        position: absolute;
        width: 157px;
        height: 60px;
        line-height: 60px;
        top: -30px;
        left: 50%;
        margin-left: -78.5px;
        color: #ffffff;
        font-size: 32px;
        font-weight: 600;
        text-align: center;
        background-image: url(./img/pj-bg@2x.png);
        background-repeat: no-repeat;
        background-size: 100% 60px;
      }
      .search-box {
        width: 120px;
        height: 56px;
        padding-left: 20px;
        margin: 20px 0;
        color: #262727;
        font-size: 28px;
        background-image: url(/static/img/icon_down@2x.png);
        background-repeat: no-repeat;
        background-size: 33px auto;
        background-position: 88px center;
        background-color: #ffffff;
        border-radius: 28px;
      }
      .record-echarts {
        padding-bottom: 20px;
        background-color: #ffffff;
        box-shadow: 0 6px 18px rgba(86,104,119,0.15);
        .echarts-box {
          margin-top: 25px;
          height: 359px;
        }
      }
    }
    .wait-list-loading {
      height: 80px;
      line-height: 80px;
      text-align: center;
    }

    // 勋章展示
    .medal-modal-box {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,.3);
      .rotate-box {
        position: absolute;
        top: 120px;
        z-index: 100;
        width: 100%;
        height: 1051px;
        background-image: url(./img/medal_bg.png);
        background-repeat: no-repeat;
        background-size: 1051px 100%;
        background-position: center;
        animation: spin 5s linear infinite;
      }
      .content {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 102;
        width: 70%;
        height: 710px;
        transform: translate(-50%,-50%);
        .content-top {
          width: 100%;
          height: 580px;
          text-align: center;
          background-image: url(./img/medal_head1.png);
          background-repeat: no-repeat;
          background-size: 100% 258px;
          background-position: center top;
          background-color: #ffffff;
          border-radius: 16px;
          .img-box {
            width: 100%;
            height: 350px;
            background-image: url(./img/medal_head2.png);
            background-repeat: no-repeat;
            background-size: 100% 214px;
            background-position: center top;
            img {
              display: inline-block;
              width: 260px;
              height: 260px;
              border-radius: 50%;
              margin-top: 90px;
            }
          }
          p {
            height: calc(100% - 472px);
            color: #272726;
            font-size: 40px;
            font-weight: 600;
            padding: 82px 20px 0 20px;
            margin-bottom: 20px;
            word-break: break-all;
            overflow: hidden;
          }
        }
        .content-footer {
          color: #ffffff;
          width: 70px;
          height: 70px;
          line-height: 65px;
          text-align: center;
          font-size: 60px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          margin: 60px auto 0;
        }
      }
    }
  }
</style>
