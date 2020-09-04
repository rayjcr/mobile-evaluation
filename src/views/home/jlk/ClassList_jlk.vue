<template>
  <ul>
    <li class="li_item" v-for="(item,index) in list" :key="index">
      <div class="li_top flex" @click="jump(item,'/studentlist')">
        <div class="class-img"></div>
        <div class="class_name flex_1">
          <p class="name text-overflow"
             :class="{'width': (notifyClassTeacher && item.allClassEvaluationNum > 0) || (notifyCourseTeacher && item.allClassEvaluationNum > 0)}">{{item.className}}</p>
          <p class="rs">共{{item.studentNum}}人</p>
        </div>
        <div v-if="item.role > 1 && item.role < 12 || item.role > 13">
          <div class="class_pj flex alignCenter justifyCenter text-overflow" v-if="notifyClassTeacher && item.allClassEvaluationNum > 0">{{item.period == 1 ? '本周发卡' : '本月发卡'}} &nbsp;{{item.myClassEvaluationNum}}/{{item.allClassEvaluationNum}}</div>
        </div>
        <div v-else-if="item.role >= 12">
          <div class="class_pj flex alignCenter justifyCenter text-overflow" v-if="notifyCourseTeacher && item.allClassEvaluationNum > 0">{{item.period == 1 ? '本周发卡' : '本月发卡'}} &nbsp;{{item.myClassEvaluationNum}}/{{item.allClassEvaluationNum}}</div>
        </div>
      </div>
      <div class="li_tip">本月共提醒<span class="yellow-text">{{item.remindStuNum || 0}}</span>人，共<span class="yellow-text">{{item.remindTimes || 0}}</span>次</div>
      <div class="li_jlk clear" v-if="item.cardVOList">
        <div class="fl" v-for="(n,i) in item.cardVOList" :key="i">
          <span class="card_bg" :class="[cardClassArr[i%4]]">
            <span class="card_name">{{n.cardName.slice(0,1)}}</span>
          </span>
          <span class="jlk_number">{{n.cardNum}}</span>
        </div>
      </div>
      <div class="pj-class flex alignCenter">
        <div class="flex alignCenter justifyCenter flex_1" @click="jump(item,'/pjclass')" v-if="is_show_class">
          <span class="icon-bg pj-bg"></span>
          <p class="li_bottom_txt color_black">评价班级</p>
        </div>
        <div class="flex alignCenter justifyCenter flex_1" @click="jump(item,'/classAccount')">
          <span class="icon-bg class-account-bg"></span>
          <p class="li_bottom_txt color_black">班级账户</p>
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
  export default {
    name: "ClassList_jlk",
    props: ['globalConfig','list','is_show_class'],
    data() {
      return {
        cardClassArr: ['card0','card1','card2','card3']
      }
    },
    computed: {
      notifyClassTeacher() {
        let notifyClassTeacher = this.globalConfig && this.globalConfig.notifyClassTeacher;
        return notifyClassTeacher;
      },
      notifyCourseTeacher() {
        let notifyCourseTeacher = this.globalConfig && this.globalConfig.notifyCourseTeacher;
        return notifyCourseTeacher;
      }
    },
    methods: {
      jump(a,path) {
        let query = {
          classCode: a.classCode,
          gradeCode: a.gradeCode,
          title: a.className,
          role: a.role
        };
        if(path == '/pjclass') {
          query['studentNum'] = a.studentNum;
        }
        this.$router.push({
          path,
          query
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
        padding-bottom: 40px;

        .class-img {
          width: 100px;
          height: 100px;
          margin-right: 20px;
          background: url('../img/class_bg@2x.png') no-repeat center;
          background-size: 100px auto;
        }
        .name {
          width: 500px;
          font-size: 34px;
          color: #262727;
          font-weight: 600;
          &.width {
            width: 300px;
          }
        }
        .rs {
          color: #B6B8B8;
          font-size: 28px;
          margin-top: 15px;
        }
        .class_pj {
          width: 238px;
          height: 60px;
          margin-top: 8px;
          color: #ffffff;
          font-size: 28px;
          margin-right: -20px;
          background: linear-gradient(90deg, rgba(255, 211, 91, 1) 0%, rgba(255, 149, 62, 1) 100%);
          border-radius: 30px 0 0 30px;
        }
      }
      .li_tip {
        color: #262727;
        font-size: 28px;
        margin-left: 20px;
        padding-bottom: 32px;
        .yellow-text {
          color: #FFB600;
          margin: 0 10px;
        }
      }
      .li_jlk {
        margin-left: 20px;
        padding-bottom: 30px;
        .fl {
          margin-right: 40px;
          margin-bottom: 10px;
        }
        img {
          display: inline-block;
          vertical-align: middle;
          width: 68px;
          height: 48px;
          margin-right: 10px;
        }
        .card_bg {
          box-sizing: border-box;
          position: relative;
          display: inline-block;
          vertical-align: middle;
          width: 68px;
          height: 48px;
          padding-top: 8px;
          padding-right: 8px;
          text-align: center;
          line-height: 40px;
          color: #fff;
          margin-right: 20px;
          background-repeat: no-repeat;
          background-size: 100%;
          float: left;
        }
        .card0 {
          background-image: url(../img/icon_ka1@2x.png);
        }
        .card1 {
          background-image: url(../img/icon_ka2@2x.png);
        }
        .card2 {
          background-image: url(../img/icon_ka3@2x.png);
        }
        .card3 {
          background-image: url(../img/icon_ka4@2x.png);
        }
        .jlk_number {
          display: inline-block;
          color: #262727;
          font-size: 28px;
          line-height: 40px;
          font-weight: 600;
          padding-top: 8px;
          box-sizing: border-box;
        }
      }
      .pj-class {
        height: 94px;
        border-top: 2px solid #EFF1F3;
        .icon-bg {
          display: inline-block;
          width: 32px;
          height: 32px;
        }
        .pj-bg {
          background: url('/static/img/class_dp@2x.png') no-repeat center;
          background-size: 32px auto;
        }
        .class-account-bg {
          background: url('../img/icon_class_account@2x.png') no-repeat center;
          background-size: 32px auto;
        }
        .li_bottom_txt {
          margin-left: 20px;
          color: #B6B8B8;
          font-size: 28px;
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
