<template>
  <div class="task">
    <div class="navbar flex">
      <mt-navbar v-model="selected" class="mtnavbar">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="1"><span class="selectbar">未开始</span></mt-tab-item>
        <mt-tab-item id="2"><span class="selectbar">进行中</span></mt-tab-item>
        <mt-tab-item id="3"><span class="selectbar">已截止</span></mt-tab-item>
      </mt-navbar>
    </div>

    <div class="list-box scrollY">
      <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="list.length > 0">
        <ul class="tasklist">
          <li class="taskbox" v-for="(item,index) in list" :key="index" @click="jump(item.id,item.assignmentStatus,item.taskType,item)">
            <div class="li_top border-bottom flex justifySpaceBetween alignCenter" v-if="item.taskType == 1">
              <div class="badge"  :class="{'yellow-badge' : item.staffNo == userId,'green-badge': item.staffNo != userId}">{{item.staffNo == userId ? '我发布的' : '我参与的'}}</div>  
              <div class="status" :class="{'ongoing': item.assignmentStatus == 2,'end': item.assignmentStatus == 3 || item.assignmentStatus == 1}">{{item.assignmentStatus == 1 ? '未开始' : item.assignmentStatus == 2 ? '进行中' : '已截止'}}</div>
            </div>
            <div class="li_top border-bottom flex justifySpaceBetween alignCenter" v-else>
              <div class="badge blue-badge" v-if="item.taskType == 2">考勤打卡</div>
              <div class="badge orange-badge withfile" v-else>悬赏</div>
              <div class="status" :class="{'ongoing': item.assignmentStatus == 2,'end': item.assignmentStatus == 3 || item.assignmentStatus == 1}">{{item.assignmentStatus == 1 ? '未开始' : item.assignmentStatus == 2 ? '进行中' : '已截止'}}</div>
            </div>
            <div class="li_content">
              <div class="name text-overflow">{{item.name}}</div>
              <div class="time" v-if="item.taskType == 2">日期：长期</div>
              <div class="time" v-else>日期：{{item.startTime}}至{{item.endTime}}</div>
            </div>
          </li>
        </ul>
      </v-load-more>

      <div class="empty" v-else>
        <v-empty-list :text="'无数据'"></v-empty-list>
      </div>
    </div>

    <div class="plusbtn" @click="_jumpTo('/publishTasks_jlk')" v-if="is_show_task"></div>
  </div>
</template>

<script>
  import LoadMore from '@/components/LoadMore.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import {TaskApi as API} from '@/utils/api'

  export default {
    name: 'Task_jlk',
    components: {
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList
    },
    data () {
      return {
        nowTime: new Date().getTime(),//当前时间
        userId: this.$cookie.get('userId'),
        classList: JSON.parse(sessionStorage.getItem('classList')),
        selected: '',//已选项--1全部2进行中3已截止
        list: [],//列表
        classTeacher: true,//是否老师
        is_show_task: false,
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        page: 1,
        limit: 10, // 每页显示记录条数
      }
    },
    watch: {
      selected () {
        this.initData()
        this.getList()
      },
      $route (to, from) {
        if(to.path == '/zhsz/task') {
          if (from.path == '/publishTasks_jlk' || from.path == '/TaskDetail') {
            Promise.all([this.initData(),this.getList()]).then((result) => {
              // console.log("result---",result)
            }).catch((error) => {
              console.log(error)      // 失败了，打出 '失败'
            })
          }
        }
      }
    },
    mounted () {
      Promise.all([this.initData(),this.getList(),this.hasPermission()]).then((result) => {
        // console.log("result---",result)
      }).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    activated() {
      this.hasPermission()
    },
    methods: {
      //获取列表
      async getList (page, type) {
        this.$indicator.open('加载中....')
        this.page = page || this.page
        let url = API.getTaskList
        let data = {
          page: this.page,
          limit: this.limit,
          scope: '1,3', //1.个人评价项 2.班级评价项 3.教师布置
          type: 2,//1录入型 2任务型
          relevantUserNo: this.userId,
          assignmentStatus: this.selected || null,
          invokeType: 3
        }
        const res = await this.$req.get(url, data)
        if (res.resultCode == 1) {
          this.list = [...this.list, ...res.value.dataList]
          if (res.value.dataList.length >= this.limit) {
            this.page++
            this.allLoaded = true
          } else {
            this.allLoaded = false
          }
          // 控制上拉刷新下拉加载回弹效果
          if (type == 'loadTop') {
            setTimeout(() => {
              this.$refs.loadMore.onTopLoaded()
            }, 300)
          } else if (type == 'loadBottom') {
            this.$refs.loadMore.onBottomLoaded()
          }
          this.$indicator.close()
        }
      },

      /*
      * 判断是否有发布任务的权限
      * */
      hasPermission() {
        let userPermission = JSON.parse(sessionStorage.getItem("userPermission"));
        // let classList = JSON.parse(sessionStorage.getItem('classList'));
        this.is_show_task = false;
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
      //上拉刷新下拉加载
      loaded (page) {
        this.allLoaded = page ? true : this.allLoaded
        this.list = page ? [] : this.list
        let type = page ? 'loadTop' : 'loadBottom'
        this.getList(page, type)
      },
      initData () {
        this.allLoaded = true
        this.list = []
        this.page = 1
      },
      //跳转页面
      jump (id, assignmentStatus,taskType,item) {
        if(taskType==3){
          // 激励卡          
          this.$router.push({
            path: '/teacherTask/SubTask',
            query: {
              id:item.categoryId,
              title: item.name
            }
          })
          return;
        }
        this.$router.push({
          path: taskType == 1 ? '/TaskDetail': '/clock',
          query: {
            id,
            assignmentStatus
          }
        })
      },
       _jumpTo(path) {
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
      width: 100%;
      height: 88px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 1);
      border-top: 1px solid rgba(239, 241, 243, 1);
      opacity: 1;
      align-items: center;
      .mtnavbar {
        width: 750px;
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
            top: -16px;
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
    .list-box {
      height: calc(100% - 128px);
    }
    .empty {
      position: relative;
      height: 100%;
    }
    .tasklist {
      padding: 0 32px;
      min-height: calc(100vh - 300px);
      .taskbox {
        background-color: #ffffff;
        border-radius: 16px;
        margin-top: 40px;
        .li_top {
          height: 64px;
          padding: 0 32px;
          border-bottom-color: #EFF1F3;
          .badge {
            width: 120px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            font-size: 20px;
            border-radius: 24px 24px 24px 4px;
          }
          .yellow-badge {
            background-color: #FFF2D1;
            color: #FFB600;
          }
          .green-badge {
            background-color: #E9FFF8;
            color: #00CD86;
          }
          .orange-badge{          
            background-color: #FFE8D5;
            color: #FF7B12;
          }
          .blue-badge {
            background-color: #EBF5FF;
            color: #33A5FF;
          }
          .withfile::before{
            content: '';
            height: 26px;
            width: 20.89px;
            display: inline-block;
            background-image: url(../img/fileicon@2x.png);
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-position: 0 0;
            margin-right: 10px;
            position: relative;
            top: 5px;
          }
          .status {
            font-weight: 600;
            font-size: 28px;
          }
          .ongoing {
            color: #FFB600;
          }
          .end {
            color: #B6B8B8;
          }
        }
        .li_content {
          padding: 0 32px 32px;
          .name {
            color: #262727;
            font-size: 36px;
            font-weight: 600;
            margin-top: 30px;
          }
          .time {
            color: #B6B8B8;
            font-size: 28px;
            margin-top: 20px;
          }
        }
      }
      .wait-list-loading {
        height: 80px;
        line-height: 80px;
        text-align: center;
      }
    }
    .plusbtn {
      position: fixed;
      z-index: 3000;
      right: 20px;
      bottom: 170px;
      width: 100px;
      height: 100px;
      background: url('../img/plusbtn@2x.png') no-repeat center;
      background-size: 100px auto;
    }
  }
</style>
