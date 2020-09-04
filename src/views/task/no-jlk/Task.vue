<template>
  <div class="task">
    <div class="navbar" v-if="xxdm == '133'">
      <mt-navbar v-show="selected == 1" v-model="assignmentStatus" class="mtnavbar2">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="1"><span class="selectbar">未开始</span></mt-tab-item>
        <mt-tab-item id="2"><span class="selectbar">进行中</span></mt-tab-item>
        <mt-tab-item id="3"><span class="selectbar">已截止</span></mt-tab-item>
      </mt-navbar>
    </div>
    <div class="navbar" :class="{'height':selected == '2'}" v-else >
      <mt-navbar v-model="selected" class="mtnavbar">
        <mt-tab-item id="1"><span class="selectbar">常规任务</span></mt-tab-item>
        <mt-tab-item id="2" class="selectbar"><span class="selectbar">学生上传</span></mt-tab-item>
      </mt-navbar>
      <mt-navbar v-show="selected == 2" v-model="selected2" class="mtnavbar2">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="0"><span class="selectbar">待审核</span></mt-tab-item>
        <mt-tab-item id="1"><span class="selectbar">已通过</span></mt-tab-item>
        <mt-tab-item id="-1"><span class="selectbar">未通过</span></mt-tab-item>
      </mt-navbar>
    </div>

    <div class="list-box scrollY" :class="{'height':selected == '2'}">
      <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="(selected == '1' && cg_list.length > 0) || (selected == '2' && stu_list.length > 0)">

        <!--常规任务-->
        <v-cg-task ref="cgTask" v-show="selected == 1" :list="cg_list"></v-cg-task>

        <!--学生上传-->
        <v-stu-task ref="stuTask" v-show="selected == 2" :list="stu_list" @examine="getExamine"></v-stu-task>

      </v-load-more>

      <div class="empty" v-else>
        <v-empty-list :text="'无数据'"></v-empty-list>
      </div>
    </div>

    <!--新增任务按钮-->
    <div class="plusbtn" v-if="selected == 1 && is_show_task" @click="jump('/publishTasks')"></div>

    <!-- 审核弹框 -->
    <v-audit ref="audit" :info="info" :dimensionName="dimensionName" :dimensionId="dimensionId" @audit="audit"
             @showWd="showWd"></v-audit>

    <!--维度选择器-->
    <v-wd-select ref="wd" @getWdInfo="getWdInfo" @getWdName="getWdName"></v-wd-select>
  </div>
</template>

<script>
  import { TaskApi } from '@/utils/api'

  import WdSelect from '@/components/wdSelect/WdSelect.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import LoadMore from '@/components/LoadMore.vue'
  import CGTask from './teacher/CGTask.vue' // 常规任务
  import StuTaskList from './teacher/StuTaskList.vue' // 学生上传
  import Audit from '../modal/Audit.vue'

  export default {
    name: 'Task',
    components: {
      'v-wd-select': WdSelect,
      'v-load-more': LoadMore,
      'v-cg-task': CGTask,
      'v-stu-task': StuTaskList,
      'v-audit': Audit,
      'v-empty-list': EmptyList
    },
    data () {
      return {
        userId: this.$cookie.get('userId'), // 当前登录人id
        xxdm: this.$cookie.get('xxdm'),

        page: 1,
        limit: 10, // 每页显示记录条数
        selected: '1',
        selected2: '',
        assignmentStatus: '', //任务型评价项状态：1.未开始 2.进行中 3.已截止
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        acceptflg: true, // 任务列表请求响应
        auditflg: false,
        submitflg: false,
        typeselected: false,
        is_show_task: false,
        dimensionName: '', // 维度名称
        dimensionId: '', // 维度主键
        type: '',
        cg_list: [], // 常规任务列表
        stu_list: [], // 学生上传任务列表
        info: {}, // 详情信息
        timer: null,
      }
    },
    computed: {
      changeData () {
        let {selected, selected2, assignmentStatus} = this
        return {
          selected,
          selected2,
          assignmentStatus
        }
      }
    },
    watch: {
      changeData: {
        handler: function () {
          this.initData();
          if(this.selected == '1') {
            this.getCGTaskList();
          } else {
            this.getStuTaskList()
          }
        },
        deep: true
      },
      $route (to, from) {
        if(to.path == '/zhsz/task') {
          if (from.path == '/publishTasks' || from.path == '/editTasks' || from.path == '/CheckTasks') {
            Promise.all([this.initData(),this.getCGTaskList()]).then(() => {}).catch((error) => {
              console.log(error)
            })
          }
        }
      }
    },
    created() {
      Promise.all([this.initData(),this.getCGTaskList(),this.hasPermission()]).then(() => {}).catch((error) => {
        console.log(error)
      })
    },
    mounted () {
      this.$nextTick(() => {
        this.$refs.wd.getWDAll();
      })
    },
    methods: {
      /*
      * 获取常规任务列表
      * @param page 当前页码
      * @param type 上拉刷新(loadTop)下拉加载(loadBottom)
      * */
      async getCGTaskList (page, type) {
        this.$indicator.open('加载中....')
        this.page = page || this.page
        let data = {
          page: this.page,
          limit: this.limit,
          relevantUserNo: this.userId,
          //type: 3, //1.录入型 2.项目型 3.学生上传
          scope: '1,3', // 1.个人评价项 2.班级评价项 3.教师布置
          type: 2, // 1.录入型，2.任务型
          assignmentStatus: this.assignmentStatus,
          invokeType: 3,
        }
        const res = await this.$req.get(TaskApi.getTaskList, data);
        // 请求成功时
        if (res.resultCode == 1) {
          let {dataList} = res.value;
          this.cg_list = [...this.cg_list, ...dataList];

          if (dataList.length >= this.limit) {
            this.page++
            this.allLoaded = true
          } else {
            this.allLoaded = false
          }

          // 控制上拉刷新下拉加载回弹效果
          this.onLoaded(type);
        }
      },
      /*
      * 获取学生任务列表
      * @param page 当前页码
      * @param type 上拉刷新(loadTop)下拉加载(loadBottom)
      * */
      async getStuTaskList (page, type) {
        this.$indicator.open('加载中....')
        this.page = page || this.page
        let data = {
          page: this.page,
          limit: this.limit,
          relevantUserNo: this.userId,
          type: 3, //1.录入型 2.项目型 3.学生上传
          status: this.selected2
        }
        const res = await this.$req.post(TaskApi.getStuTaskList, data)
        // 请求成功时
        if (res.resultCode == 1) {
          let {dataList} = res.value;
          this.stu_list = [...this.stu_list, ...dataList];

          if (dataList.length >= this.limit) {
            this.page++
            this.allLoaded = true
          } else {
            this.allLoaded = false
          }

          // 控制上拉刷新下拉加载回弹效果
          this.onLoaded(type);
        }
      },
      // 控制上拉刷新下拉加载回弹效果
      onLoaded(type) {
        if (type == 'loadTop') {
          !!this.timer && clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.$refs.loadMore.onTopLoaded()
          }, 300)
        } else if (type == 'loadBottom') {
          this.$refs.loadMore.onBottomLoaded()
        }
      },
      /*
      * 审核任务
      * */
      async audit (data) {
        const res = await this.$req.get(TaskApi.audit, data)
        if (res.resultCode == 1) {
          this.$toast('审核成功')
          this.$refs.audit.hideModal()
          this.stu_list = []
          this.getStuTaskList(1)
        }
      },

      /*
      * 判断是否有发布任务的权限
      * */
      hasPermission() {
        let userPermission = JSON.parse(sessionStorage.getItem("userPermission"));
        if(userPermission && userPermission.options) {
          let options = userPermission.options;
          options.forEach((c) => {
            if(c.code == 'N000001') { // 发布任务
              if(c.isPermitted) {
                this.is_show_task = true;
              }
            }
          })
        }
      },
      initData () {
        this.allLoaded = true
        this.cg_list = []
        this.stu_list = []
        this.page = 1
      },
      /*
      * 上拉刷新下拉加载
      * @param page 当前页码
      * */
      loaded (page) {
        this.allLoaded = page ? true : this.allLoaded
        let type = page ? 'loadTop' : 'loadBottom'
        if(this.selected == '1') {
          this.cg_list = page ? [] : this.cg_list;
          this.getCGTaskList(page, type)
        } else {
          this.stu_list = page ? [] : this.stu_list;
          this.getStuTaskList(page, type)
        }
      },
      /*
      * 获取当前审核的任务信息
      * */
      getExamine (key, type) {
        this.type = type
        this.info = this.stu_list[key]
        this.$refs.audit.showModal()
      },
      /*
      * 显示维度下拉窗
      * */
      showWd () {
        this.$refs.wd.show()
      },
      /*
      * 获取选择的维度名称
      * */
      getWdName (data) {
        this.dimensionName = ''
        data.forEach((c) => {
          this.dimensionName += c.name + '-'
        })
        this.dimensionName = this.dimensionName.substring(0, this.dimensionName.length - 1)
      },
      /*
      * 获取选择的维度信息
      * */
      getWdInfo (info) {
        this.dimensionId = info.id
      },
      jump (path) {
        this.$router.push({
          path
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .task {
    background-color: #EFF1F3;
    height: 100%;
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      width: 100%;
      height: 88px;
      margin: 0 auto;
      background-color: #FFFFFF;
      &.height {
        height: 176px;
      }
      .mtnavbar {
        width: 430px;
        height: 68px;
        margin: 10px auto;
        background: rgba(239, 241, 243, 1);
        border-radius: 34px;
        color: rgba(182, 184, 184, 1);
        .selectbar {
          font-size: 30px;
          font-weight: bold;
          line-height: 32px;
        }
        .mint-tab-item {
          margin: 0;
          line-height: 34px;
        }
        .is-selected {
          width: 216px;
          color: #fff;
          background: rgba(51, 165, 255, 1);
          opacity: 1;
          border-radius: 34px;
        }
      }
      .mtnavbar2 {
        width: 100%;
        height: 88px;
        margin: 0 auto;
        border-top: 1px solid rgba(239, 241, 243, 1);
        .selectbar {
          font-size: 30px;
          font-weight: 400;
          line-height: 64px;
          color: rgba(182, 184, 184, 1);
        }
        .mint-tab-item {
          margin: 0;
          line-height: 34px;
        }
        .is-selected {
          border: 0;
          &::after {
            content: '';
            display: inline-block;
            width: 40px;
            height: 4px;
            background: rgba(51, 165, 255, 1);
            opacity: 1;
            border-radius: 2px;
            position: relative;
            top: -18px;
          }
          .selectbar {
            font-size: 30px;
            font-weight: bold;
            line-height: 64px;
            color: rgba(38, 38, 39, 1);
          }
        }
      }
    }
    .empty {
      position: relative;
      height: 100%;
    }
    .list-box {
      padding-top: 88px;
      height: calc(100% - 88px);
      &.height {
        padding-top: 176px;
        height: calc(100% - 176px);
      }
    }
    .plusbtn {
      position: fixed;
      z-index: 3000;
      right: 20px;
      bottom: 170px;
      width: 100px;
      height: 100px;
      background: url('/static/img/plusbtn.png') no-repeat center;
      background-size: 100px auto;
    }

  }
</style>
