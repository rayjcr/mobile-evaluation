<template>
  <div class="student-home scrollY" ref="viewBox">
    <!--首页头部-->
    <v-student-header ref="header" :scrollTop="scrollTop" :userLevelIcon="userLevelIcon"></v-student-header>
    <div class="content">
      <!--分数和勋章展示-->
      <section class="first-block" v-if="reportCard">
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

      <!--任务-->
      <div class="task-box" v-if="taskList.length > 0">
        <v-slider ref="slider" :pagination="true" :len="taskList.length" @getClickedIndex="getClickedIndex">
          <div class="swiper-slide" v-for="(item,index) in taskList" :key="index">
            <div class="task-item" :data-index="index">
              <div class="task-top flex alignCenter">
                <div class="task-title flex_1 text-overflow">{{item.name}}</div>
              </div>
              <div class="task-icon">{{index+1}}</div>
              <div class="task-bottom">时间：{{item.startTime}}-{{item.endTime}}</div>
            </div>
          </div>
        </v-slider>
      </div>

      <!--审核提示-->
      <!--<div class="sh-tip-box flex alignCenter">
          <div class="flex_1 tip">
          您的任务已经评价
          <span class="yellow-text">&nbsp;前去查看</span>
          <img class="icon-right" src="./img/icon_right_student.png">
          </div>
          <div class="icon-del">
          <img src="./img/icon_del_student.png">
          </div>
      </div>-->

      <!--勋章墙-->
      <div class="medal-box">
        <div class="medal-title">勋章墙</div>
        <v-medal-wall>
          <div class="medal-list clear" v-if="medalList.length > 0">
            <div class="medal-item fl" :class="{'marginRight0': (index+1) % 4 == 0}" v-for="(item,index) in medalList"
                 :key="index">
              <div class="img-box">
                <img :src="item.icon" :class="{'opacity' : !item.have}">
                <img src="/static/img/noHave@2x.png" class="noHave" v-if="!item.have">
              </div>
              <p class="text-overflow">{{item.name}}</p>
            </div>
          </div>
          <div class="no-medal flex alignCenter justifyCenter" v-else>后台暂未配置勋章</div>
        </v-medal-wall>
      </div>

      <!--排行榜-->
      <div class="ranking-title">排行榜</div>
      <div class="ranking-list">
        <!--时间本周本月-->
       <div class="week-box">
          <v-time ref="time" 
            :iconStyle="{'color': '#FFFFFF'}" 
            :timeStyle="{'color': '#FFFFFF'}"
            @getTimeWB="getTimeWB"
            ></v-time>
       </div>

        <div class="rankBox" v-if="rankList.length > 0">
          <div class="ranking-me flex alignCenter" v-if="myRankInfo">
            <div class="li_left flex alignCenter flex_1">
              <div class="ranking number">{{myRankInfo.rankingNum}}</div>
              <div class="avatar"></div>
              <div class="name">我</div>
            </div>
            <div class="li_right"><span>{{myRankInfo.medalCardNum}}</span></div>
          </div>
          <ul class="list" v-for="(item,index) in rankList" :key="index">
            <li class="flex alignCenter" @click="_jump('/studenthome',item)">
              <div class="li_left flex alignCenter flex_1">
                <div class="ranking guanjun" v-if="index == 0">1</div>
                <div class="ranking yajun" v-else-if="index == 1">2</div>
                <div class="ranking jijun" v-else-if="index == 2">3</div>
                <div class="ranking number" v-else>{{index+1}}</div>
                <div class="avatar"></div>
                <div class="name">{{item.studentName}}</div>
              </div>
              <div class="li_right">
                <span>{{item.medalCardNum}}</span>
                <i class="mintui mintui-back back-icon"></i>
              </div>
            </li>
          </ul>
          <div class="look" @click="_jump('/ranklist')" v-if="rankList.length >= 5">查看班级全部同学</div>
        </div>

        <div class="noRank" v-if="rankList.length == 0">
          暂无排名数据
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import StudentHeader from './StudentHeader.vue'
  import Slider from '@/components/Slider.vue'
  import MedalWall from '@/components/MedalWall.vue'
  import Time from '@/components/time/Time.vue'
  import {HomeApi, CountApi, MedalApi, RWDJApi} from '@/utils/api'
  import formatDate from '@/utils/formatDate/formatDate'

  export default {
    name: 'Student_cg',
    components: {
      'v-student-header': StudentHeader,
      'v-medal-wall': MedalWall,
      'v-slider': Slider,
      'v-time': Time
    },
    data () {
      return {
        userId: this.$cookie.get('userId'),
        classCode: this.$cookie.get('classCode'),
        xxdm: this.$cookie.get('xxdm'),

        scrollTop: 0, // 控制头部显隐
        rankTimeType: 1,
        userLevelIcon: null,
        list: [],
        taskList: [],
        medalList: [],
        rankList: [], // 排行榜
        weekId: '',
        timeText: '',
        myRankInfo: null, // 我的排行榜信息
        reportCard: null, // 分数和勋章
        totalMedalNum: 0, // 总勋章数
      }
    },
    activated() {
      this.scrollTop = 0;

      Promise.all([
        this.getMedalList(),
        this.getTaskList()
      ]).then(() => {}).catch((error) => {
        console.log(error);
      });
    },
    mounted () {
      this.$refs.time.type = 1; // 触发周次列表获取

      Promise.all([
        this._onScroll(),
        this.getRWDJ(),
        this.getMedalList(),
        this.getTaskList(),
        this.getStuEvaluationData()
      ]).then(() => {}).catch((error) => {
        console.log(error);
      });
    },
    methods: {
      /*
      * 获取人物等级信息
      * */
      async getRWDJ () {
        const res = await this.$req.get_special(RWDJApi.getUserDJ, this.userId);
        if (res.resultCode == 1) {
          this.userLevelIcon = res.value ? res.value.icon : null
        }
      },
      /*
      * 获取分数和勋章的展示
      * */
      async getStuEvaluationData() {
        this.totalMedalNum = 0;
        const res = await this.$req.get_special(CountApi.getStuEvaluationData, this.userId);
        if(res.resultCode == 1) {
          let { reportCardMedalVOS } = res.value
          this.reportCard = res.value;
          // 总勋章数
          (reportCardMedalVOS || []).forEach((c) => {
            this.totalMedalNum = parseInt(this.totalMedalNum - 0) + parseInt(c.medalNum - 0);
          })
        }
      },
      /*
      * 获取排行榜
      * */
      async getStudentRankInfo () {
        let data = {
          studentCode: this.userId,
          rankTimeType: 1, // 1按周
          rankScope: 'class',
          weekId: this.weekId
        }
        this.$indicator.open("加载中...");
        const res = await this.$req.get(CountApi.getStudentRankInfo, data)
        if (res.resultCode == 1) {
          this.myRankInfo = res.value.myRankInfo
          sessionStorage.setItem('rankList',JSON.stringify(res.value.studentRankVOList)) // 存储排行榜
          this.rankList = (res.value.studentRankVOList && res.value.studentRankVOList.length >= 5) ? res.value.studentRankVOList.splice(0,5) : res.value.studentRankVOList || []
        }
      },
      /*
      * 获取勋章墙数据
      * */
      async getMedalList () {
        const res = await this.$req.get_special(MedalApi.studentMedal, this.userId)
        if (res.resultCode == 1) {
          this.medalList = res.value
        }
      },
      /*
      * 获取任务列表
      * */
      async getTaskList () {
        let data = {
          page: 1,
          limit: 5,
          type: 2,
          scope: '1,3',
          classCode: this.classCode
        }
        const res = await this.$req.get(HomeApi.getTaskList, data)
        if (res.resultCode == 1) {
          this.taskList = res.value.dataList
        }
      },
      getClickedIndex(key) {
        if(this.taskList[key].taskType == 1) { // 常规任务
          this._jump('/stu/taskDetail',this.taskList[key]);
        } else { // 考勤打卡
          this._jump('/clockDetail',{id: this.taskList[key].id});
        }
      },
      getTimeWB (data) {
        this.weekId = data.weekId;
        this.timeText = data.weekTime;
        this.getStudentRankInfo()
      },
      _onScroll () {
        this.$refs.viewBox.addEventListener('scroll', () => {
          var scrollTop = this.$refs.viewBox.scrollTop
          this.scrollTop = scrollTop
        })
      },
      _jump (path, a) {
        let query = {};

        if(path == '/stu/taskDetail') {
          query = {
            id: a.id,
            title: a.name
          }
        }else if(path == '/clockDetail') {
          query = {
            id: a.id,
            userid: this.$cookie.get('userId'),
            username: this.$cookie.get('name'),
            schoolcode: this.$cookie.get('xxdm'),
            classcode: this.$cookie.get('classCode'),
            clockdate: formatDate(new Date().getTime(),'yyyy-MM-dd')
          }
        }else if(path == '/ranklist') {
          query = {
            // title: this.timeText
            weekId: this.weekId
          }
        } else {
          query = {
            studentName: a.studentName,
            studentCode: a.studentCode
          }
        }

        this.$router.push({
          path,
          query,
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .student-home {
    position: relative;
    height: 100%;
    background-color: #ffffff;

    .content {
      position: absolute;
      width: 100%;
      z-index: 1000;
      top: 214px;
      left: 0;
      bottom: 0;
      section.first-block {
        position: relative;
        width: 90%;
        height: 220px;
        margin: 0 auto 42px;
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
      .task-box {
        margin: 0 32px 40px 32px;
        border-radius: 16px;
        background-color: #E5F5FF;
        .task-item {
          position: relative;
          padding: 32px 20px 34px 100px;
          .task-top {
            height: 50px;
            .task-title {
              color: #262627;
              font-size: 36px;
              font-weight: 600;
            }
            .task_label {
              width: 132px;
              height: 48px;
              line-height: 48px;
              color: #33A5FF;
              font-size: 24px;
              text-align: center;
              background-color: #E8F3FF;
              border-radius: 24px;
            }
          }
          .task-icon {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 80px;
            height: 108px;
            line-height: 108px;
            color: #ffffff;
            font-size: 32px;
            text-align: center;
            background-image: url(../img/icon_task@2x.png);
            background-repeat: no-repeat;
            background-size: 80px auto;
          }
          .task-bottom {
            color: #9FBDD5;
            font-size: 28px;
            margin-top: 24px;
          }
        }
      }
      .sh-tip-box {
        margin: 0 32px 40px 32px;
        height: 100px;
        background-color: #FFF7E8;
        border-radius: 8px;
        padding: 0 32px 0 20px;
        .tip {
          color: #262727;
          font-size: 28px;
          .yellow-text {
            color: #FF7B12;
          }
          .icon-right {
            width: 25px;
            height: 17px;
          }
          .icon-del {
            width: 15px;
            height: 15px;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
      .medal-box {
        padding: 32px;
        .medal-title {
          color: #262626;
          font-size: 40px;
          font-weight: 600;
          margin-bottom: 60px;
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
            p {
              width: 120px;
              color: #262727;
              font-size: 24px;
              margin-top: 8px;
            }
          }
        }
      }
      .no-medal {
        height: 100%;
        font-size: 36px;
        color: #B6B8B8;
      }
      .ranking-title {
        color: #262626;
        font-size: 40px;
        font-weight: 600;
        margin-bottom: 32px;
        padding-left: 32px;
      }
      .ranking-list {
        border-radius: 20px;
        margin: 0 32px;
        margin-bottom: 50px;
        box-shadow: 0 6px 18px rgba(86, 104, 119, 0.15);
        min-height: 400px;
        
        .noRank {
          line-height: 300px;
          text-align: center;
          font-size: 30px;
          color: #999;
        }
        .week-box {
          background: linear-gradient(90deg,rgba(158,46,255,1) 0%,rgba(255,95,57,1) 100%);
          border-radius: 16px 16px 0 0;
        }
        .ranking {
          width: 60px;
          height: 60px;
          line-height: 60px;
          font-size: 36px;
          text-align: center;
          background-size: 60px auto;
          background-repeat: no-repeat;
          background-position: center;
        }
        .guanjun {
          color: #ffffff;
          background-image: url('../img/icon_guanjun@2x.png');
        }
        .yajun {
          color: #ffffff;
          background-image: url('../img/icon_yajun@2x.png');
        }
        .jijun {
          color: #ffffff;
          background-image: url('../img/icon_jijun@2x.png');
        }
        .number {
          color: #262727;
          text-align: center;
        }
        .avatar {
          width: 80px;
          height: 80px;
          margin-left: 40px;
          background-image: url(/static/img/avatar@2x.png);
          background-repeat: no-repeat;
          background-size: 80px auto;
          background-position: center;
        }
        .name {
          color: #262727;
          font-size: 28px;
          margin-left: 20px;
        }
        .li_right {
          span {
            color: #33A5FF;
            font-size: 36px;
            margin-right: 10px;
          }
          .back-icon {
            display: inline-block;
            vertical-align: top;
            margin-top: 10px;
            color: #C7C7CC;
            transform: rotate(-180deg);
          }
        }
        .ranking-me {
          height: 150px;
          padding: 0 32px;
          background-image: url(../img/my_ranking@2x.png);
          background-repeat: no-repeat;
          background-size: 750px auto;
          background-position: center;
          img {
            width: 100%;
            height: 100%;
          }
          .number {
            color: #FFFFFF;
            font-size: 36px;
          }
          .name {
            color: #ffffff;
            font-size: 28px;
          }
          .li_right {
            span {
              color: #ffffff;
            }
          }
        }
        .list {
          padding-left: 26px;
          padding-right: 32px;
          li {
            height: 120px;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
        .look {
          margin: 0 32px;
          color: #B6B8B8;
          font-size: 28px;
          height: 78px;
          line-height: 78px;
          text-align: center;
          border-top: 1px solid #EFF1F3;
        }
      }
    }
  }
</style>
