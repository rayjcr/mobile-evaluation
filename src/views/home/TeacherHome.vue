<template>
  <div class="teacher-home scrollY" ref="viewBox">
    <!--首页头部-->
    <TeacherHeader
      ref="header"
      :scrollTop="scrollTop"
      :teacherName="teacherName"
      :todayEvaluationNum="todayEvaluationNum"
      :teacherGradeList="teacherGradeList"
      @getGradeCode="getGradeCode"
      v-if="is_show_dynamic"
    ></TeacherHeader>
    
    <WuYiTeacherHeader
      v-else
      ref="header"
      :scrollTop="scrollTop"
      :teacherName="teacherName"
      :todayEvaluationNum="todayEvaluationNum"
      :teacherGradeList="teacherGradeList"
      @getGradeCode="getGradeCode"
    ></WuYiTeacherHeader>

    <div class="content" :class="{'wycontent':!is_show_dynamic}">
      <!--任务-->
      <div class="task-box" v-if="taskList.length > 0">
        <Slider ref="slider" :pagination="is_show_dynamic" :len="taskList.length" @getClickedIndex="getClickedIndex">
          <div class="swiper-slide" v-for="(item,index) in taskList" :key="index">
            <div class="task-item" :data-index="index">
              <div class="task-top flex alignCenter">
                <div class="task-title flex_1 text-overflow">{{item.name}}</div>
                <div class="task_label">{{item.staffNo == userId ? "我发布的" : "我参与的"}}</div>
              </div>
              <div class="task-icon">{{index+1}}</div>
              <div class="task-bottom" v-if="jlk == 'true'">提交人数：{{item.participateCount}}</div>
              <div class="task-bottom" v-else>日期：{{item.startTime}}-{{item.endTime}}</div>
            </div>
          </div>
        </Slider>
        <div class="swiper-pagination" v-if="!is_show_dynamic"></div>
      </div>

      <div class="list-box" v-if="list.length > 0">
        <!--班级列表--激励卡-->
        <ClassList_jlk
          ref="classList"
          v-if="jlk == 'true'"
          :globalConfig="globalConfig"
          :list="list"
          :is_show_class="is_show_class"
        ></ClassList_jlk>

        <!--班级列表-->
        <ClassList
          ref="classList"
          v-else
          :globalConfig="globalConfig"
          :list="list"
          :is_show_task="is_show_task"
          :is_show_class="is_show_class"
          :is_show_dynamic="is_show_dynamic"
        ></ClassList>

      </div>
      <div class="empty" :class="{'emptyH': taskList.length > 0}" v-if="list.length == 0">
        <EmptyList :text="'无班级列表'">></EmptyList>
      </div>
    </div>
  </div>
</template>

<script>
  import { HomeApi,userInfoAPi } from "@/utils/api";

  export default {
    name: "TeacherHome",
    components: {
      TeacherHeader: () => import("./TeacherHeader"),
      WuYiTeacherHeader: () => import("./WuYiTeacherHeader"),
      ClassList: () => import("./no-jlk/ClassList"),
      ClassList_jlk: () => import("./jlk/ClassList_jlk"),
      Slider: () => import("@/components/Slider"),
      EmptyList: () => import("@/components/EmptyList")
    },
    data() {
      return {
        jlk: this.$cookie.get("jlk"), // 激励卡模块展示
        userId: this.$cookie.get("userId"), // 当前登录人id
        globalConfig: JSON.parse(this.$cookie.get("config")), // 全局配置信息

        scrollTop: 0, // 控制头部显隐
        className: "",
        teacherName: "",
        list: [], // 班级列表
        teacherGradeList: [], // 年级列表
        taskList: [], // 任务列表
        gradeCode: "",
        todayEvaluationNum: 0, // 今日评价次数
        is_show_task: false, // 是否有发布任务的权限
        is_show_class: false, // 是否有评价班级的权限
        is_show_dynamic: this.$cookie.get("xxdm")!='133', // 是否有展示班级动态
      };
    },
    watch: {
      $route(to, from) {
        if (to.path == "/zhsz/home") {
          if (from.path == "/studentlist" || from.path == "/pjclass") {
            if (this.$cookie.get("authToken")) {
              this.getList();
            }
          }
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.$cookie.delete("userHeadImg");

        Promise.all([
          this._onScroll(),
          this.getUserPermission(),
          this.getList(),
          this.getTaskList()
        ]).then(() => {}).catch((error) => {
          console.log(error);
        });
        if(this.$refs.slider){
          this.$refs.slider.swiper.pagination('.swiper-pagination')          
        }
      });
    },
    activated() {
      this.scrollTop = 0;
      Promise.all([
        this.getUserPermission(),
        this.getTaskList()
      ]).then(() => {}).catch((error) => {
        console.log(error);
      });

      // 清除缓存的选择学生列表
      sessionStorage.removeItem("isFromGroup");
      sessionStorage.removeItem("selectedxsList");
      sessionStorage.removeItem("groupInfo");

    },
    methods: {
      /*
      * 获取班级列表
      * */
      async getList() {
        this.$indicator.open("加载中...");

        let URL = this.jlk == "true" ? HomeApi.getTeacherEvaluationCardList : HomeApi.getTeacherEvaluationClassList;
        let data = {
          teacherCode: this.userId,
          gradeCode: this.gradeCode
        };
        const res = await this.$req.get(URL, data);
        if (res.resultCode == 1) {
          let classEvaluationVOList = res.value.classEvaluationVOList || [],
            teacherGradeList = res.value.teacherGradeList || [],
            todayEvaluationNum = res.value.todayEvaluationNum || 0,
            teacherName = res.value.teacherName;

          this.teacherName = teacherName; // 教师名称
          this.list = classEvaluationVOList; // 班级列表
          //this.isWeekTeacher = isWeekTeacher; // 是否值周教师0不是1是
          this.todayEvaluationNum = todayEvaluationNum; // 今日已评价次数

          if (this.gradeCode == "") {
            this.teacherGradeList = teacherGradeList; // 年级列表
            this.setGCList(classEvaluationVOList, teacherGradeList); // 存储年级班级列表
          }
        }
      },
      /*
      * 获取任务列表
      * */
      async getTaskList() {
        let data = {
          page: 1,
          limit: 5,
          type: 2,
          scope: this.jlk == "true" ? 3 : null,
          // createUserNo: this.userId
          relevantUserNo: this.userId
        };
        const res = await this.$req.get(HomeApi.getTaskList, data);
        if (res.resultCode == 1) {
          this.taskList = res.value.dataList;
        }
      },
      /*
      * 获取当前登录用户的操作权限
      * */
      async getUserPermission() {
        const res = await this.$req.get(userInfoAPi.getUserPermission, {});
        if(res.resultCode == 1) {
          sessionStorage.setItem("userPermission", JSON.stringify(res.value));// 存储当前登录用户权限信息

          this.hasTaskPermission(res.value);
          this.hasPjClassPermission(res.value)
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
              }
            }
          })
        }
      },
      /*
      * 获取当前用户是否有评价班级的权限
      * */
      hasPjClassPermission(info) {
        this.is_show_class = false;
        if(info && info.classEvaluation) {
          this.is_show_class = true;
        }
      },

      getClickedIndex(key) {
        this.jump(this.taskList[key]);
      },
      /*
      * 存储年级班级列表
      * */
      setGCList(classList, gradeList) {
        let arr = [], gradeArr = [];
        classList.forEach((c) => {
          if (c.role > 1) {
            arr.push(c);
          }
        });
        gradeList.forEach((c, i) => {
          arr.forEach((v) => {
            if (v.gradeCode == c.gradeCode) {
              gradeArr[i] = c;
            }
          });
        });
        var gArr = gradeArr.filter((c) => {
          return c;
        });
        sessionStorage.setItem("allClassList", JSON.stringify(classList));// 存储全部班级列表
        sessionStorage.setItem("allGradeList", JSON.stringify(gradeList));// 存储全部年级列表
        sessionStorage.setItem("classList", JSON.stringify(arr));// 存储非值周教师的班级列表
        sessionStorage.setItem("gradeList", JSON.stringify(gArr)); // 存储非值周教师的年级列表
      },
      getGradeCode(code) {
        this.gradeCode = code;
        this.getList();
      },
      _onScroll() {
        this.$refs.viewBox.addEventListener("scroll", () => {
          let scrollTop = this.$refs.viewBox.scrollTop;
          this.scrollTop = scrollTop;
        });
      },
      jump(a) {
        let query = {};
        let path = "";
        if (this.jlk == "true") {
          path = "/TaskDetail";
          query = {
            id: a.id,
            assignmentStatus: a.assignmentStatus
          };
        } else {
          if(a.taskType == 1) { // 常规
            path = "/CheckTasks";
          } else { // 考勤打卡
            path = "/clock";
          }
          query = {
              id: a.id,
              title: a.name
            };
        }

        this.$router.push({
          path: path,
          query: query
        });
      }
    }
  };
</script>

<style lang="less" scoped>
  .teacher-home {
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
            background-image: url(./img/icon_task@2x.png);
            background-repeat: no-repeat;
            background-size: 80px auto;
          }
          .task-bottom {
            color: #B6B8B8;
            font-size: 28px;
            margin-top: 24px;
          }
        }
      }
      .sh-tip-box {
        margin: 0 32px 40px 32px;
        height: 100px;
        background-color: #E8F3FF;
        border-radius: 8px;
        padding: 0 32px 0 20px;
        .tip {
          color: #262727;
          font-size: 28px;
          .blue-text {
            color: #33A5FF;
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
      .list-box {
        padding-bottom: 20px;
      }
      .empty {
        position: relative;
        height: 100%;
        &.emptyH {
          height: calc(100% - 230px);
        }
      }
    
      
      &.wycontent{
        top: 458px;
        .task-box{
          background-color: #fff;
          box-shadow:0px 12px 40px rgba(201,178,255,0.3);
          position: relative;
          margin-bottom: 72px;
          .task-item{
            .task-top{
              .task_label{
                border-radius: 24px 24px 24px 4px;
              }
            }
            .task-bottom{
              color: #9FBDD5;
            }
            .task-icon{
              background-image: url(img/icon_task2.png);
            }            
          }
          .swiper-pagination{
            position: absolute;
            bottom: -40px;
            left: 50%!important;
            transform: translateX(-50%);
            /deep/ .swiper-pagination-bullet{
              background: #EFF1F3;
              opacity: 0.5;
              &.swiper-pagination-bullet-active{
                background: #864AFF;
                opacity: 1;
              }
            }
          }
        }
        
        .list-box{
          /deep/ .class_name {
            & div:first-of-type{
              display: flex;
              align-items: center;
              height: 100%;
              .name{
                width: auto;
              }
              .rs{
                margin-top: 0;
                margin-left: 20px;
              }
            }
          }
          /deep/ .li_bottom{
            border-top: 1px solid #EFF1F3;
            margin: 0 20px;
            .task{
              background-image: url(img/task@2x.png);
            }
            .li_bottom_txt{
              color: #262727;
            }
          }
        }
      }
    }
  }
</style>
