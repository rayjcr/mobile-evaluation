<template>
  <div class="student-home scrollY">
    <!--首页头部-->
    <v-stu-header-jlk ref="header" :medalList="medalList" :userLevelIcon="userLevelIcon" @getLabelH="getLabelH"></v-stu-header-jlk>
    <div class="content" :style="{'top': top}">
      <!-- 获卡统计 -->
      <section class="first-block">
        <div class="flex alignCenter" style="height: 100%;">
          <div class="flex_1 flex_item">
            <div class="num">{{homePageInfo.currentTermTotal || 0}}</div>
            <p class="title">本学期获卡</p>
          </div>
          <div class="flex_1 flex_item">
            <div class="num">{{homePageInfo.currentMonthTotal || 0}}</div>
            <p class="title">本月获卡</p>
          </div>
          <div class="flex_1 flex_item">
            <div class="num">{{homePageInfo.reduceStatus || 0}}</div>
            <p class="title">比上月获卡</p>
          </div>
        </div>
      </section>

      <!--任务-->
      <div class="task-box" v-if="taskList.length > 0">
        <v-slider ref="slider" :pagination="true" :len="taskList.length" @getClickedIndex="getClickedIndex">
          <div class="swiper-slide" v-for="(item,index) in taskList" :key="index">
            <div class="task-item" :data-index="index">
              <div class="task-top flex">
                <div class="task-top-left text-overflow">{{item.name}}</div>
                <div class="task-top-right">
                  <span class="zkme">争卡名额</span>
                  <span class="number">{{item.totalRewardCount}}</span>
                </div>
              </div>
              <div class="task-bottom">时间：{{item.startTime}}-{{item.endTime}}</div>
              <div class="task-icon">{{index+1}}</div>
            </div>
          </div>
        </v-slider>
      </div>

      <!--审核提示-->
      <!--<div class="sh-tip-box flex alignCenter">
        <div class="flex_1 tip">
          您有未完成的任务
          <span class="yellow-text">&nbsp;前去查看</span>
          <img class="icon-right" src="./img/icon_right_student.png">
        </div>
        <div class="icon-del">
          <img src="./img/icon_del_student.png">
        </div>
      </div>-->

      <!--排行榜-->
      <div class="ranking-top flex justifySpaceBetween alignCenter">
        <div class="left">排行榜</div>
        <div class="right" @click="jump('/ranklist')">查看更多</div>
      </div>
      <div class="rank-box">
        <div class="rank-top">本周排行榜</div>
        <ul class="rank-list" v-if="rankList.length > 0">
          <li class="rank-item" v-for="(item,index) in rankList" :key="index">
            <p>{{item.starType == 1 ? '进步之星' : item.starType == 2 ? '获卡之星' : '争卡之星'}}</p>
            <div class="item flex alignCenter">
              <div class="li_left flex alignCenter flex_1">
                <div class="ranking" v-if="item.rankingNum == 1">
                  <img src="../img/icon_guanjun@2x.png">
                </div>
                <div class="ranking" v-else-if="item.rankingNum == 2">
                  <img src="../img/icon_yajun@2x.png">
                </div>
                <div class="ranking" v-else-if="item.rankingNum == 3">
                  <img src="../img/icon_jijun@2x.png">
                </div>
                <div class="ranking-num" v-else>
                  <span>{{item.rankingNum}}</span>
                </div>
                <div class="avatar">
                  <img src="/static/img/avatar@2x.png">
                </div>
                <div class="name">{{className}}-{{item.studentName}}</div>
              </div>
              <div class="li_right">
                <span>{{item.medalCardNum}}</span>
              </div>
            </div>
          </li>
        </ul>
        <div class="empty" v-if="rankList.length == 0">
          <v-empty-list :text="'无数据'"></v-empty-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import StuHeader_jlk from './StuHeader_jlk.vue'
  import Slider from '@/components/Slider.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import {HomeApi, CountApi, MedalApi, RWDJApi} from '@/utils/api'

  export default {
    name: "Student_jlk",
    components: {
      'v-stu-header-jlk': StuHeader_jlk,
      'v-empty-list': EmptyList,
      'v-slider': Slider
    },
    data() {
      return {
        userId: this.$cookie.get('userId'),
        classCode: this.$cookie.get('classCode'),
        className: this.$cookie.get('className'),
        gradeCode: this.$cookie.get('gradeId'),
        jlk: this.$cookie.get('jlk'),
        userLevelIcon: null, // 人物等级图标
        top: 0,
        medalList: [], // 勋章列表
        list: [],
        taskList: [], // 任务列表
        homePageInfo: {},
        rankList: [], // 排行榜
      }
    },
    mounted() {
      this.getRWDJ()
      this.getMedalList()
      this.getTaskList();
      this.getStudentHomePageInfo();
      this.getTOPStarRankInfo()
    },
    activated() {
      this.getTOPStarRankInfo()
    },
    methods: {
      /*
        获取人物等级
      */
      async getRWDJ () {
        const res = await this.$req.get_special(RWDJApi.getUserDJ, this.userId)
        if (res.resultCode == 1) {
          this.userLevelIcon = res.value ? res.value.icon : null
        }
      },
      /*
        获取学生获卡统计
      */
      async getStudentHomePageInfo() {
        let data = {
          studentCode: this.userId
        };
        const res = await this.$req.get(CountApi.getStudentHomePageInfo, data);
        if (res.resultCode == 1) {
          this.homePageInfo = res.value;
        }
      },
      /*
        勋章等级大于1并且已获得
      */
      async getMedalList () {
        const res = await this.$req.get_special(MedalApi.studentMedal, this.userId)
        if (res.resultCode == 1) {
          this.medalList = res.value.filter((c) => c.level > 1 && c.have);
        }
      },
      async getTaskList() {
        let data = {
          page: 1,
          limit: 5,
          scope: 3,
          type: 2,
          classCode: this.classCode
        };
        const res = await this.$req.get(HomeApi.getTaskList, data);
        if (res.resultCode == 1) {
          this.taskList = res.value.dataList
        }
      },
      /*
        排行榜
      */
      async getTOPStarRankInfo() {
        const res = await this.$req.get(CountApi.getTOPStarRankInfo, {classCode: this.classCode,userId: this.userId});
        if (res.resultCode == 1) {
          this.rankList = res.value
        }
      },
      getLabelH(h) {
        this.top = h
      },
      getClickedIndex(key) {
        this.jump('/stu/taskDetail_jlk',this.taskList[key]);
      },
      jump(path,a) {
        let query = {};

        if(path == '/stu/taskDetail_jlk') {
          query = {id: a.id}
        } else {
          query = {
            type: 'stu',
            gradeCode: this.gradeCode
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
      top: 342px;
      left: 0;
      bottom: 0;
      section.first-block {
        position: relative;
        width: 686px;
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
            justify-content: space-between;
            .task-top-left {
              width: 400px;
              color: #262627;
              font-size: 36px;
              font-weight: 600;
            }
            .task-top-right {
              .zkme {
                color: #262727;
                font-size: 28px;
              }
              .number {
                color: #262727;
                font-size: 30px;
                font-weight: 600;
              }
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
            margin-top: 20px;
          }
        }
        .empty {
          position: relative;
          height: 410px;
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
      .ranking-top {
        height: 120px;
        padding: 0 32px;
        .left {
          color: #262626;
          font-size: 40px;
          font-weight: 600;
        }
        .right {
          color: #B6B8B8;
          font-size: 28px;
          padding-right: 36px;
          background-image: url(../img/icon_right@2x.png);
          background-size: 16px auto;
          background-repeat: no-repeat;
          background-position: right center;
        }
      }
      .rank-box {
        padding-bottom: 40px;
        margin: 0 32px 40px;
        border-radius: 20px;
        background-color: #ffffff;
        box-shadow: 0 8px 52px rgba(0,0,0,0.15);
        .rank-top {
          height: 80px;
          line-height: 80px;
          text-align: center;
          color: #ffffff;
          font-size: 36px;
          font-weight: 600;
          background: linear-gradient(90deg,rgba(158,46,255,1) 0%,rgba(255,95,57,1) 100%);
          border-radius: 16px 16px 0 0;
        }
        .rank-item {
          margin-top: 40px;
          padding: 0 32px 0 26px;
          p {
            color: #262727;
            font-size: 36px;
            margin-bottom: 20px;
            font-weight: 600;
            margin-left: 6px;
          }
          .item {
            height: 80px;
            .li_left {
              img {
                width: 100%;
                height: 100%;
              }
              .ranking {
                width: 46px;
                height: 64px;
              }
              .ranking_num {
                color: #262727;
                font-size: 36px;
                font-weight: 600;
              }
              .number {
                color: #262727;
                font-size: 36px;
                text-align: center;
              }
              .avatar {
                width: 80px;
                height: 80px;
                margin-left: 40px;
              }
              .name {
                color: #262727;
                font-size: 28px;
                margin-left: 20px;
                font-weight: 600;
              }
            }
            .li_right {
              span {
                color: #33A5FF;
                font-size: 36px;
                margin-right: 10px;
              }
            }
          }
        }
        .empty {
          position: relative;
          height: 500px;
        }
      }
    }
  }
</style>
