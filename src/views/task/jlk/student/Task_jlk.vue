<template>
    <div class="task">
<!--      <mt-navbar v-model="assignmentStatus" class="navbar_1">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="1"><span class="selectbar">未开始</span></mt-tab-item>
        <mt-tab-item id="2"><span class="selectbar">进行中</span></mt-tab-item>
        <mt-tab-item id="3"><span class="selectbar">已截止</span></mt-tab-item>
      </mt-navbar> -->
      <div class="taskFiltering flex alignCenter">
        <div class="selectItem flex alignCenter justifySpaceBetween" @click="showSelect('status')">
          {{assignmentStatusName}}
          <span class="icon-arrowdown"></span>
        </div>
        <div class="selectItem flex alignCenter justifySpaceBetween" @click="showSelect('type')">
          {{taskEvaluationTypeName}}
          <span class="icon-arrowdown"></span>
        </div>
      </div>
      <div class="list-box scrollY">
        <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="list.length > 0">
          <v-get-task class='tasklist' ref="cgTask" :list="list" @jump="jump"></v-get-task>
<!--          <ul class="tasklist">
            <li class="taskbox flex" v-for="(item,index) in list" :key="index">
              <div class="leftborder"></div>
              <div class="taskinfo flex">
                <div class="task-name flex">
                  <div class="taskname flex_1 text-overflow">{{item.name}}</div>
                  <div class="task-completion" v-if="item.taskType == 1" :class="item.assignmentStatus == 3 ? 'finish' : ''">{{item.assignmentStatus == 3 ? '已截止': item.assignmentStatus == 2 ? '进行中' : '未开始'}}</div>
                  <div class="task-completion" v-else>进行中</div>
                </div>
                <div class="cardCount">获卡人数: <span>{{item.acquireCount}}</span></div>
                <div class="flex">
                  <div class="task-datetime flex_1" v-if="item.taskType == 2">日期：长期</div> 
                  <div class="task-datetime flex_1" v-else>日期：{{item.startTime}}-{{item.endTime }}</div>
                  <div class="joinflg" v-if="item.taskType==3">已参与</div>
                  <div class="joinflg" v-else :class="!item.participate?'joinflg-gray':''">{{item.participate?'已提交':'未参与'}}</div>
                </div>
              </div>
            </li>
          </ul> -->
        </v-load-more>

        <div class="empty" v-else>
          <v-empty-list :text="'无数据'"></v-empty-list>
        </div>

      </div>
      
      
      <!-- 任务筛选弹层 -->
      <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
        <mt-picker :slots="dataList" :visible-item-count="5" :show-toolbar="true" ref="picker" value-key="name"
                   :itemHeight="40">
          <div class="flex">
            <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
            <div class="picker-title">{{popupConfig.title}}</div>
            <div class="picker-btn picker-sure" @click="handleSelect">完成</div>
          </div>
        </mt-picker>
      </mt-popup>
      <!--悬赏任务入口-->
      <div class="rewardTaskEntrance flex flex-column alignCenter" v-if="rewardTaskLen" @click="jumpTo('/RewardTask')">
        <div class="rewardTaskbtn"></div>
        <span class="rewardTaskNumber">{{rewardTaskLen}}项任务可领</span>
      </div>
    </div>
</template>

<script>
  import {TaskApi as API} from '@/utils/api'
  import {RewardTaskApi} from '@/utils/api'

  import LoadMore from '@/components/LoadMore.vue'
  import EmptyList from '@/components/EmptyList.vue'

  import formatDate from '@/utils/formatDate/formatDate'
  import GetTaskList from './GetTaskList.vue'

  export default {
    name: "Task_jlk",
    components:{
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList,
      'v-get-task': GetTaskList,
    },
    data(){
      return {
        nowTime: new Date().getTime(),//当前时间
        userId: this.$cookie.get('userId'),//用户id
        classCode: this.$cookie.get('classCode'),//班级代码
        page: 1,
        limit: 10, // 每页显示记录条数
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        studentselected: '',//已选项 1未开始2进行中3已截止
        list: [],//列表
        assignmentStatus:'',//任务型评价项状态：1.未开始 2.进行中 3.已截止        
        rewardTaskLen: 0,//可领悬赏任务数量
        popupVisible: false,
        popupConfig:{
          title: '',
          value: 0,
          options: []
        },
        taskStatus:[
          { type: '', name: "全部状态" },
          { type: '1', name: "未开始" },
          { type: '2', name: "进行中" },
          { type: '3', name: "已截止" },
        ],
        taskType:[
          { type: '', name: "全部类型" },
          { type: '1', name: "常规任务" },
          { type: '2', name: "考勤打卡" },
          { type: '3', name: "悬赏任务" },
        ],
        assignmentStatus: '', //任务型评价项状态：1.未开始 2.进行中 3.已截止
        assignmentStatusName: '全部状态', //任务型评价项状态：1.未开始 2.进行中 3.已截止
        taskEvaluationType: '', //任务型评价项的类型： 1.常规 2.考勤 3.悬赏
        taskEvaluationTypeName: '全部类型', //任务型评价项的类型：1.未开始 2.进行中 3.已截止
      }
    },
    computed: {
      changeData() {
        let {selected,assignmentStatus,taskEvaluationType} = this;
        return {
          selected,
          assignmentStatus,
          taskEvaluationType
        }
      },
      dataList() {
        let dateSlots = [
          {
            flex: 1,
            values: this.popupConfig.options,
            className: "slot1",
            textAlign: "center",
            defaultIndex: this.popupConfig.value
          }
        ];
        return dateSlots;
      }
    },
    watch: {
      changeData: {
        handler: function () {
          Promise.all([this.initData(),this.getList()]).then(() => {}).catch((error) => {
            console.log(error)      // 失败了，打出 '失败'
          })
        },
        deep: true
      }
    },
    mounted() {      
      this.getRewardTaskList();
      Promise.all([this.initData(),this.getList()]).then(() => {}).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    methods:{
      
      // 获取可领悬赏任务数量
      async getRewardTaskList(){
        var res = await this.$req.get(RewardTaskApi.getAvaliableCount,{studentId:this.userId,classCode:this.classCode});
       
        this.rewardTaskLen = res.value;
      },
      //获取列表
      async getList(page,type) {
        this.$indicator.open('加载中....')
        this.page = page || this.page;
        let data = {
          page: this.page,
          limit: this.limit,
          classCode: this.classCode,
          type: 2, //1.录入型 2.项目型 3.学生上传
          userId: this.userId,
          scope: '1,3',// 1.个人评价项 2.班级评价项 3.教师布置
          assignmentStatus: this.assignmentStatus,
          taskType: this.taskEvaluationType,
          invokeType: 2,
          studentId: this.userId,
        };

        const res = await this.$req.get(API.getTaskList, data);
        if (res.resultCode == 1) {
          let list = res.value.dataList;
          this.list = [...this.list,...list];

          if (list.length >= this.limit) {
            this.page ++;
            this.allLoaded = true
          } else {
            this.allLoaded = false
          }

          // 控制上拉刷新下拉加载回弹效果
          if (type == 'loadTop') {
            setTimeout(() => {
              this.$refs.loadMore.onTopLoaded()
            },300)
          } else if (type == 'loadBottom') {
            this.$refs.loadMore.onBottomLoaded()
          }
        }
      },
      //上拉刷新下拉加载
      loaded(page) {
        this.allLoaded = page ? true : this.allLoaded;
        this.list = page ? [] : this.list;
        let type = page ? 'loadTop' : 'loadBottom';
        this.getList(page,type)
      },
      initData() {
        this.allLoaded = true;
        this.list = [];
        this.page = 1;
      },   
      handleSelect(){
        if(this.popupConfig.title=='状态筛选'){
          this.statusChange();
        } else {
          this.typeChange();
        }
      },
      statusChange(){
        // console.log(this.$refs.picker.values[0].type,314)
        this.assignmentStatus = this.$refs.picker.values[0].type
        this.assignmentStatusName = this.$refs.picker.values[0].name
        this.popupVisible = false;
      },
      typeChange(){
        this.taskEvaluationType = this.$refs.picker.values[0].type
        this.taskEvaluationTypeName = this.$refs.picker.values[0].name
        this.popupVisible = false;
      },
      showSelect(type){
        if(type=='status'){
          this.popupConfig.title = '状态筛选'
          this.popupConfig.options = this.taskStatus;        
          var index = this.taskStatus.findIndex(e=>e.type==this.assignmentStatus)
          this.popupConfig.value = index;  
        } else {
          this.popupConfig.title = '类型筛选'
          this.popupConfig.options = this.taskType;         
          var index = this.taskType.findIndex(e=>e.type==this.taskEvaluationType)
          this.popupConfig.value = index;
        }
        this.popupVisible = true;
      },   
      jumpTo(path){
        this.$router.push(path)
      },
      //跳转
      jump({id,taskType}){
        let query = { id },path = '/stu/taskDetail_jlk';

        if(taskType == 2) {
          path = '/clockDetail';
          query = {
            id,
            userid: this.$cookie.get('userId'),
            username: this.$cookie.get('name'),
            schoolcode: this.$cookie.get('xxdm'),
            classcode: this.$cookie.get('classCode'),
            clockdate: formatDate(new Date().getTime(),'yyyy-MM-dd')
          }
        }
        if(taskType == 3){
          // 激励卡
          path = '/SubTaskDetail';
          query = {
            componentName:'stuReceived',
            subTaskId: id
          }
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
.task{
  background:rgba(239,241,243,1);
  height: 100%;
  overflow: scroll;
  .navbar{
    width:100%;
    height:88px;
    margin: 0 auto;
    background:rgba(255,255,255,1);
    border-top: 1px solid rgba(239,241,243,1);
    opacity:1;
    align-items:center;
    .mtnavbar{
      width:430px;
      height:68px;
      margin: 0 auto;
      background:rgba(239,241,243,1);
      border-radius: 34px;
      color: rgba(182,184,184,1);
      .selectbar{
        font-size:30px;
        font-weight:bold;
        line-height:32px;
      }
      .mint-tab-item{
        margin: 0;
        line-height:34px;
      }
      .is-selected{
        width:216px;
        color: #fff;
        background:rgba(51,165,255,1);
        opacity:1;
        border-radius:34px;
      }
    }
  }

  .list-box {
    height: calc(100% - 88px);
  }
  .empty {
    position: relative;
    height: 100%;
  }
  .tasklist{
    padding: 0 32px 32px 32px;
    min-height: calc(100vh - 300px);
    margin-top: 20px;
    .taskbox{
      background-color:#ffffff;
      flex-direction: column;
      border-radius:16px;
      padding-left: 20px;
      padding-bottom: 28px;
      background-size: 20px 100%;
      margin-top: 30px;
      position: relative;
      .leftborder{
        position: absolute;
        left: 0;
        top: 0;
        width:20px;
        height:100%;
        border-radius:16px 2px 2px 16px;
        background: linear-gradient(180deg,rgba(146,207,255,1) 0%,rgba(226,242,255,1) 100%) no-repeat;
      }
      .taskinfo{
        // width:602px;
        // height: 130px;
        padding-top: 24px;
        margin: 0 32px;
        flex-direction: column;
        .task-name{
          align-items:center;
          .badge{
            width:120px;
            height:40px;
            background:rgba(220,255,243,1);
            font-size:20px;
            font-weight:400;
            line-height:40px;
            color:rgba(0,205,134,1);
            border-radius: 20px;
            text-align: center;
            margin-right: 28px;
          }
          .taskname{
            font-size:36px;
            font-weight:800;
            // line-height:64px;
            color:rgba(38,38,39,1);
            margin-right: 36px;
          }
          .task-completion{
            font-size:36px;
            font-weight:800;
            // line-height:64px;
            color:rgba(255,182,0,1);
          }
          .finish{
            color:#B6B8B8;
          }
        }
        .cardCount{
          font-size:28px;
          font-weight:400;
          line-height:64px;
          span{
            color:rgba(51,165,255,1);
          }
        }
        .task-datetime{
          font-size:28px;
          font-weight:400;
          // line-height:48px;
          color:rgba(182,184,184,1);
          // height: 40px;
        }
        .joinflg{
          font-size:28px;
          font-weight:400;
          color:rgba(38,39,39,1);
        }
        .joinflg-gray{
          color:rgba(182,184,184,1);
        }
      }
      .taskOption{
        justify-content: space-around;
        align-items: center;
        height: 66px;
        width: 602px;
        font-size:30px;
        font-weight:400;
        line-height:64px;
        color:rgba(38,38,39,1);
        text-align: center;
        margin: 0 auto;
        .option{
          justify-content: center;
          align-items: center;
          span{
            margin-left: 16px;
          }
        }
        .line {
          width: 2px;
          height: 40px;
          background-color: #EFF1F3;
        }
      }
    }
    .wait-list-loading {
      height: 80px;
      line-height: 80px;
      text-align: center;
    }
  }
  .plusbtn{
    position: fixed;
    right: 20px;
    bottom: 170px;
  }

  .navbar_1{
    // width:750px;
    height:88px;
    margin: 0 auto;
    border-top: 1px solid rgba(239,241,243,1);
    .selectbar{
      font-size:30px;
      font-weight:400;
      line-height:64px;
      color:rgba(182,184,184,1);
    }
    .mint-tab-item{
      margin: 0;
      line-height:34px;
    }
    .is-selected{
      border: 0;
      &::after{
        content: '';
        display: inline-block;
        width:40px;
        height:4px;
        background:rgba(51,165,255,1);
        opacity:1;
        border-radius:2px;
        position: relative;
        top: -18px;
      }
      .selectbar{
        font-size:30px;
        font-weight:bold;
        line-height:64px;
        color:rgba(38,38,39,1);
      }
    }
  }
}

.rewardTaskEntrance{
  position: fixed;
  z-index: 2000;
  right: 40px;
  bottom: 170px;
  .rewardTaskbtn{
    width: 140px;
    height: 140px;
    background: url('../../img/rewardTask.gif') no-repeat center;
    background-size: 140px auto;      
  } 
  .rewardTaskNumber{
    font-size:20px;
    font-weight:400;
    color: #fff;
    background:rgba(255,123,18,1);
    padding: 6px 14px;
    border-radius: 20px;
    margin-top: 10px;
  }
}

.taskFiltering{
  background-color: #fff;
  height: 88px;
  justify-content: space-around;
  .selectItem{
    width:280px;
    height:40px;
    padding: 12px 20px;
    background:rgba(239,241,243,1);
    opacity:1;
    border-radius:32px;
    font-size:28px;
    color:rgba(41,45,51,1);
    .icon-arrowdown{
      background-image: url(../../img/arrowdown.png);
      background-repeat: no-repeat;
      background-size: 100% auto;
      background-position: 0 0;
      height: 26px;
      width: 15.58px;
      display: block;
      transform: rotate(90deg);
    }
  }
}
</style>
