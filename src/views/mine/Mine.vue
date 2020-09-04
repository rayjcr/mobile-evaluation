<template>
    <div class="mine-wrapper">
      <div class="mine-head flex" @click="_editHead">
        <div class="head-left" :style="{backgroundImage:  'url(' + userHeadImg + ')'}"  v-if="userHeadImg"></div>
        <div class="head-left" :class="{'boy': sex == 1,'girl': sex != 1}" v-else></div>

        <div class="flex_1">
          <div class="top flex alignCenter">
            <div class="name text-overflow">{{name}}</div>
            <div class="type" :class="{'tea': userType <= 3,'stu': userType > 3}"></div>
          </div>
          <div class="bottom">{{userType <= 3 ? schoolName : className}}</div>
        </div>
      </div>
      <div class="mine-content">
        <ul v-if="xxdm == '133'">
          <li class="flex alignCenter li_item border-bottom" @click="_jump('/pjrecord')">
            <div class="icon icon_record"></div>
            <div class="title flex_1">评价记录</div>
            <div class="icon_right"></div>
          </li>
          <li class="flex alignCenter li_item border-bottom" v-if="userType <= 3" @click="_selectClass">
            <div class="icon icon_report"></div>
            <div class="title flex_1">综合素质报告单</div>
            <div class="icon_right"></div>
          </li>
        </ul>
        <ul v-else>
          <li class="flex alignCenter li_item border-bottom" @click="_jump('/pjrecord')">
            <div class="icon icon_record"></div>
            <div class="title flex_1">评价记录</div>
            <div class="icon_right"></div>
          </li>
          <li class="flex alignCenter li_item border-bottom" @click="_jump('/shop')" v-if="is_show_shop">
            <div class="icon icon_shop"></div>
            <div class="title flex_1">商城</div>
            <div class="icon_right"></div>
          </li>
          <li class="flex alignCenter li_item border-bottom" v-if="userType > 3" @click="_jump('/eventRegistration')">
            <div class="icon icon_activity"></div>
            <div class="title flex_1">活动报名</div>
            <div class="icon_right"></div>
          </li>
          <li class="flex alignCenter li_item border-bottom" v-if="is_show_team" @click="_jump('/teamEvaluation')">
            <div class="icon icon_team"></div>
            <div class="title flex_1">团队评价</div>
            <div class="icon_right"></div>
          </li>
          <li class="flex alignCenter li_item border-bottom" v-if="is_show_task" @click="_jump('/taskPublishCheck')">
            <div class="icon icon_task"></div>
            <div class="title flex_1">任务发布审核</div>
            <mt-badge class="mybadge" size="small" type="error" v-if="taskCount">{{taskCount}}</mt-badge>
            <div class="icon_right"></div>
          </li>
          <li class="flex alignCenter li_item border-bottom" v-if="userType > 3" @click="_jump('/exchange')">
            <div class="icon icon_exchange"></div>
            <div class="title flex_1">兑换扫码</div>
            <div class="icon_right"></div>
          </li>
          <li class="flex alignCenter li_item border-bottom" v-if="is_show_report" @click="jumptoReport">
            <div class="icon icon_report"></div>
            <div class="title flex_1">综合素质报告单</div>
            <div class="icon_right"></div>
          </li>
        </ul>
      </div>
      <div class="mine-bottom" @click="_showConfirm">退出</div>

      <!--退出登录？-->
      <v-confirm-quit ref="quit"></v-confirm-quit>
      <!-- 综合素质报告单（武义）选择班级 -->
      <v-select-class ref="selectClass" @sure="sure"></v-select-class>
    </div>
</template>

<script>
  import { userInfoAPi, teacherCheckTask } from "@/utils/api";

  import ConfirmQuit from './messageBox/Confirm_quit'
  import SelectClass from './selectClass/selectClass'

  export default {
    name: 'Mine',
    components: {
      'v-confirm-quit': ConfirmQuit,
      'v-select-class': SelectClass
    },
    data() {
      return {
        userHeadImg: this.$cookie.get('userHeadImg') || '',
        xxdm: this.$cookie.get('xxdm'),

        name: '',
        userType: '', // 教师或者学生
        className: '',
        classCode: '',
        schoolName: '',
        sex: '',
        is_show_shop: false, // 根据后台权限判断是否显示商城ps:(学生端不需要判断，直接显示)
        is_show_team: false, // 根据后台权限判断是否显示团队评价ps:(学生端不需要判断，直接不显示)
        is_show_report: false, // 根据后台权限判断是否显示综合素质报告单ps:(教师端不需要判断，直接不显示)
        is_show_task: false, // 根据后台权限判断是否显示有发布审核任务的权限
        taskCount: 0,           //任务审核发布的数量
      }
    },
    mounted() {
      Promise.all([
        this.getUserInfo(),
        this.getUserPermission()
      ]).then(() => {}).catch((error) => {
        console.log(error)
      })
    },
    activated() {
      this.userHeadImg = this.$cookie.get('userHeadImg');
    },
    methods: {
      /*
      * 存储当前登录用户权限信息
      * */
      async getUserPermission() {
        const res = await this.$req.get(userInfoAPi.getUserPermission, {});
        if(res.resultCode == 1) {
          sessionStorage.setItem("userPermission", JSON.stringify(res.value));

          this.hasShopPermission(res.value)
          this.hasTeamPermission(res.value)
          this.hasReportPermission(res.value)
          this.hasTaskPermission(res.value)
        }
      },
      /*
      * 判断是否有显示商城的权限
      * */
      hasShopPermission(info) {
        if(this.userType > 3) {
          this.is_show_shop = true;
          return
        }
        this.is_show_shop = false;
        if(info && info.options) {
          let options = info.options;
          options.forEach((c) => {
            if(c.code == 'N000002') { // 商城
              if(c.isPermitted) {
                this.is_show_shop = true;
              }
            }
          })
        }
      },
      /*
      * 获取当前用户是否有发布任务的权限
      * */
      hasTaskPermission(info) {
        this.is_show_task = false;
        if(info && info.options) {
          let options = info.options;
          options.forEach((c) => {
            if(c.code == 'N000001') { // 发布任务
              if(c.isPermitted) {
                this.is_show_task = true;
                this.getTaskCount();
              }
            }
          })
        }
      },
      /*
      * 判断是否有显示团队评价的权限
      * */
      hasTeamPermission(info) {
        this.is_show_team = false;
        if(this.userType > 3) return;

        if(info && info.groups) {
          this.is_show_team = true;
        }
      },
      /*
      * 判断是否有显示综合素质报告单的权限
      * */
      hasReportPermission(info) {
        this.is_show_report = false;
        if(this.userType <= 3) return;

        if(info && info.reportCard) {
          this.is_show_report = true;
        }
      },
      getUserInfo() {
        this.name = this.$cookie.get('name') || ''
        this.userType = this.$cookie.get('userType')
        this.className = this.$cookie.get('className') || ''
        this.schoolName = this.$cookie.get('xxmc') || ''
        this.sex = this.$cookie.get('sex') || 1
      },
      //跳转到报告单
      jumptoReport() {
        var authToken = this.$cookie.get('authToken');
        window.location.href = 'http://oa.91118.com:8101/#/index?token='+authToken;
        // window.location.href = 'http://192.168.0.211:8080/#/index?token='+authToken;
      },
      // 武义综合素质报告单选择班级
      _selectClass() {
        let classList = JSON.parse(sessionStorage.getItem('allClassList')); // 获取班级列表数据
        if (!classList || classList.length == 0){
          this.$toast('未获取到班级');
          return;
        }
        if(classList.length == 1) {
          this.classCode = classList[0].classCode;
          this._jump('/wuyi/studentList');
          return;
        }
        this.$refs.selectClass.classCode = '';
        this.$refs.selectClass._show();
      },
      // 获取武义综合素质报告单选择的班级信息
      sure(a) {
        this.classCode = a.classCode;
        this._jump('/wuyi/studentList');
      },
      _showConfirm() {
        this.$refs.quit._show()
      },
      _editHead() { // 学生端可编辑个人头像
        if(this.userType > 3) {
          this._jump('/myinfo')
        }
      },
      _jump(path) {
        let query = path == '/wuyi/studentList' ? {classCode : this.classCode} : {};
        this.$router.push({
          path,
          query
        })
      },
      //获取任务发布审核的数量
      async getTaskCount(){
        let data = {
            schoolCode: this.xxdm,
            teacherId: this.$cookie.get('userId')
        }
        let res = await this.$req.get(teacherCheckTask.taskPendingList, data)
        if(res.resultCode == 1){
            if(res.value && res.value.length){
                this.taskCount = res.value.length
            }else{
                this.taskCount = 0
            }
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .mine-wrapper {
    position: relative;
    height: 100%;
    background-color: #EFF1F3;
    .mine-head {
      padding: 40px 32px;
      background-color: #ffffff;
      box-shadow: 0 6px 18px rgba(86,104,119,0.1);
      border-radius: 0 0 20px 20px;
      .head-left {
        width: 90px;
        height: 90px;
        margin-right: 20px;
        border-radius: 50%;
        background-repeat: repeat;
        background-size: 90px auto;
        background-position: center;
      }
      .boy {
        background-image: url('/static/img/boy@2x.png');
        background-size: 90px auto;
      }
      .girl {
        background-image: url('/static/img/girl@2x.png');
        background-size: 90px auto;
      }
      .top {
        .name {
          max-width: 400px;
          color: #262727;
          font-size: 36px;
          font-weight: 600;
          margin-right: 20px;
        }
        .type {
          width: 80px;
          height: 40px;
        }
        .tea {
          background: url('./img/teacher@2x.png') no-repeat center;
          background-size: 80px auto;
        }
        .stu {
          background: url('./img/student@2x.png') no-repeat center;
          background-size: 80px auto;
        }
      }
      .bottom {
        color: #B6B8B8;
        font-size: 28px;
        margin-top: 4px;
      }
    }
    .mine-content {
      margin: 40px 32px 0;
      background-color: #ffffff;
      box-shadow: 0 6px 18px rgba(86,104,119,0.1);
      border-radius: 20px;

      ul {
        padding: 0 30px 0 32px;
      }
      .li_item {
        height: 100px;
        border-color: #EFF1F3;
        &:last-child{
          border-bottom: 0!important;
        }
        .icon {
          width: 52px;
          height: 52px;
        }
        .icon_record {
          background: url('./img/icon_record@2x.png') no-repeat center;
          background-size: 52px auto;
        }
        .icon_shop {
          background: url('./img/icon_shop@2x.png') no-repeat center;
          background-size: 52px auto;
        }
        .icon_activity {
          background: url('./img/icon_activity@2x.png') no-repeat center;
          background-size: 52px auto;
        }
        .icon_team {
          background: url('./img/icon_team@2x.png') no-repeat center;
          background-size: 52px auto;
        }
        .icon_task {
          background: url('./img/icon-task@2x.png') no-repeat center;
          background-size: 52px auto;
        }
        .icon_exchange {
          background: url('./img/icon_exchange@2x.png') no-repeat center;
          background-size: 52px auto;
        }
        .icon_report {
          background: url('./img/icon_report@2x.png') no-repeat center;
          background-size: 52px auto;
        }
        .title {
          color: #262626;
          font-size: 28px;
          font-weight: 600;
          margin-left: 20px;
        }
        .icon_right {
          width: 16px;
          height: 26px;
          background: url('./img/icon_right@2x.png') no-repeat center;
          background-size: 16px auto;
        }
        .mybadge{
            margin-right: 20px;
            border-radius: 50%;
            font-size: 20px;
            min-width: 24px;
            padding: 6px;
        }
      }
    }
    .mine-bottom {
      position: absolute;
      left: 50%;
      margin-left: -50%;
      bottom: 40px;
      width: 100%;
      height: 88px;
      line-height: 88px;
      color: #FF7B12;
      font-size: 30px;
      text-align: center;
      background-color: #ffffff;
      border-radius: 44px;
      cursor: pointer;
    }
  }
</style>
