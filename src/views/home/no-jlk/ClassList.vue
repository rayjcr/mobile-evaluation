<template>
  <ul>
    <li class="li_item" v-for="(item,index) in list" :key="index">
      <div class="li_top flex" @click="jump(item,'/studentlist')">
        <div class="class-img"></div>
        <div class="class_name flex_1">
          <div>
            <p class="name text-overflow"
               :class="{'width': (notifyClassTeacher && item.allClassEvaluationNum > 0) || (notifyCourseTeacher && item.allClassEvaluationNum > 0)}"
            >{{item.className}}</p>
            <span class="rs">共{{item.studentNum}}人</span>
          </div>
        </div>

        <div v-if="item.role > 1 && item.role < 12 || item.role > 13">
          <div
            class="class_pj text-overflow"
            v-if="notifyClassTeacher && item.allClassEvaluationNum > 0"
          >
            <p>{{item.period == 1 ? '本周评价' : '本月评价'}}</p>
            <p>{{item.myClassEvaluationNum}}/{{item.allClassEvaluationNum}}</p>
          </div>
        </div>
        <div v-else-if="item.role >= 12">
          <div
            class="class_pj text-overflow"
            v-if="notifyCourseTeacher && item.allClassEvaluationNum > 0"
          >
            <p>{{item.period == 1 ? '本周评价' : '本月评价'}}</p>
            <p>{{item.myClassEvaluationNum}}/{{item.allClassEvaluationNum}}</p>
          </div>
        </div>
      </div>
      <div class="li_mid border-bottom" v-if="item.evaluationMedalNumberVo || item.evaluationScoreNumberVo">
        <div class="flex alignCenter">
            <div class="class-account-box flex alignCenter" @click="jumpTo('/classAccount',item)">
              <img src="../img/icon_sy_medal@2x.png" alt="">
              <div class="medal-box flex alignCenter" v-if="item.evaluationMedalNumberVo" >
                本{{item.evaluationMedalNumberVo.period == 3 ? '学期' : item.evaluationMedalNumberVo.period == 2 ? '月' : item.evaluationMedalNumberVo.period == 1 ? '周' : '天'}}剩余勋章:
                <span class="medal-num">{{item.evaluationMedalNumberVo.medalNum}}</span>
              </div>
              <div class="score-box flex alignCenter" v-if="item.evaluationScoreNumberVo" @click="jumpTo('/classAccount',item)">
                本{{item.evaluationScoreNumberVo.period == 3 ? '学期' : item.evaluationScoreNumberVo.period == 2 ? '月' : item.evaluationScoreNumberVo.period == 1 ? '周' : '天'}}剩余分数:
                <span class="medal-num">{{item.evaluationScoreNumberVo.medalNum}}</span>
              </div>
            </div>
            
            <!--<div class="bottom-pj">
              本周剩余评价:
              <span class="pj-num">60</span>
            </div>-->
          </div>
      </div>
      <div class="li_bottom flex alignCenter" v-if="is_show_task||is_show_dynamic||is_show_class">
        <div class="li_bottom_block flex alignCenter justifyCenter flex_1" v-if="is_show_task" @click="jump(item,'/publishTasks')">
          <span class="icon task"></span>
          <p class="li_bottom_txt">发布任务</p>
        </div>
        <div class="line" v-if="is_show_task"></div>
        <div class="li_bottom_block flex alignCenter justifyCenter flex_1" v-if="is_show_dynamic" @click="jump(item,'/classdt')">
          <span class="icon dt"></span>
          <p class="li_bottom_txt">班级动态</p>
        </div>
        <div class="line" v-if="is_show_class"></div>
        <div class="li_bottom_block flex alignCenter justifyCenter flex_1" v-if="is_show_class" @click="jump(item,'/pjclass')">
          <span class="icon pj"></span>
          <p class="li_bottom_txt">点评班级</p>
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
  export default {
    name: "ClassList",
    props: ['globalConfig','list','is_show_task','is_show_class','is_show_dynamic'],
    computed: {
      notifyClassTeacher() { // 是否开启班主任评价提醒
        let notifyClassTeacher = this.globalConfig && this.globalConfig.notifyClassTeacher;
        return notifyClassTeacher;
      },
      notifyCourseTeacher() { // 是否开启任课教师评价提醒
        let notifyCourseTeacher = this.globalConfig && this.globalConfig.notifyCourseTeacher;
        return notifyCourseTeacher;
      }
    },
    methods: {
      jump(a,path) {
        this.$router.push({
          path,
          query: {
            title: a.className,
            classCode: a.classCode,
            gradeCode: a.gradeCode,
            studentNum: a.studentNum,
            role: a.role
          },
        })
      },
      jumpTo(path,a) {
        this.$router.push({
          path,
          query: {
            classCode: a.classCode,
            role: a.role,
            periodMedal: a.evaluationMedalNumberVo && a.evaluationMedalNumberVo.period,
            periodScore: a.evaluationScoreNumberVo && a.evaluationScoreNumberVo.period
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  ul {
    margin: 0 32px;
    border-radius: 20px;
    background-color: #ffffff;
    li.li_item {
      width: 100%;
      margin-bottom: 40px;
      border-radius: 20px;
      box-shadow: 0 6px 18px rgba(86, 104, 119, 0.15);

      .li_top {
        padding-top: 32px;
        margin: 0 20px;
        padding-bottom: 34px;

        .class-img {
          width: 100px;
          height: 100px;
          margin-right: 20px;
          background: url('../img/class_bg@2x.png') no-repeat center;
          background-size: 100px auto;
        }
        .name {
          width: 500px;
          font-size: 36px;
          color: #262727;
          font-weight: 600;
          &.width {
            width: 300px;
          }
        }
        .rs {
          display: inline-block;
          padding: 6px 16px;
          margin-top: 20px;
          color: #86B6DC;
          font-size: 24px;
          border-radius: 24px;
          background-color: #E4F1FE;
        }
        .class_pj {
          width: 96px;
          height: 64px;
          padding: 8px 20px;
          color: #ffffff;
          font-size: 24px;
          background: linear-gradient(90deg,rgba(255,211,91,1) 0%,rgba(255,149,62,1) 100%);
          border-radius: 20px 0 0 20px;
        }
      }
      .li_mid {
        padding: 0 0 30px 20px;
        color: #B6B8B8;
        font-size: 28px;
        border-bottom-color: #EFF1F3;
        .class-account-box {
          padding-right: 22px;
          background-image: url('../img/icon_right@2x.png');
          background-position: right center;
          background-repeat: no-repeat;
          background-size: 12px auto;
        }
        img {
          width: 32px;
          height: 32px;
          margin-right: 12px;
        }
      }
      .li_bottom {
        height: 94px;
        cursor: pointer;
        .icon {
          display: inline-block;
          width: 32px;
          height: 32px;
        }
        .task {
          background: url('/static/img/task@2x.png') no-repeat center;
          background-size: 32px auto;
        }
        .dt {
          background: url('/static/img/class_dt@2x.png') no-repeat center;
          background-size: 32px auto;
        }
        .pj {
          background: url('/static/img/class_dp@2x.png') no-repeat center;
          background-size: 32px auto;
        }
        .li_bottom_txt {
          color: #B6B8B8;
          font-size: 28px;
          margin-left: 20px;
        }
        .line {
          width: 2px;
          height: 28px;
          background-color: #EFF1F3;
        }
      }
    }
  }
</style>
