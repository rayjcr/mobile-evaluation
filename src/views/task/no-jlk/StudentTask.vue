<template>
  <div class="task">
    <div class="navbar" :class="{'height':selected == '2'}">
      <mt-navbar v-model="selected" class="mtnavbar" v-if="xxdm != '133'">
        <mt-tab-item id="1"><span class="selectbar">我收到的</span></mt-tab-item>
        <!-- <mt-tab-item id="2" class="selectbar"><span class="selectbar">我上传的</span></mt-tab-item> -->
      </mt-navbar>
      <!-- 任务筛选 -->
      <div v-show="selected == 1" class="taskFiltering flex alignCenter">
        <div class="selectItem flex alignCenter justifySpaceBetween" @click="showSelect('status')">
          {{assignmentStatusName}}
          <span class="icon-arrowdown"></span>
        </div>
        <div class="selectItem flex alignCenter justifySpaceBetween" @click="showSelect('type')">
          {{taskEvaluationTypeName}}
          <span class="icon-arrowdown"></span>
        </div>
      </div>
<!--      <mt-navbar v-show="selected == 1" v-model="assignmentStatus" class="mtnavbar2">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="1"><span class="selectbar">未开始</span></mt-tab-item>
        <mt-tab-item id="2"><span class="selectbar">进行中</span></mt-tab-item>
        <mt-tab-item id="3"><span class="selectbar">已截止</span></mt-tab-item>
      </mt-navbar> -->
      <mt-navbar v-show="selected == 2" v-model="selected2" class="mtnavbar2">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="0"><span class="selectbar">待审核</span></mt-tab-item>
        <mt-tab-item id="1"><span class="selectbar">已通过</span></mt-tab-item>
        <mt-tab-item id="-1"><span class="selectbar">未通过</span></mt-tab-item>
      </mt-navbar>
    </div>
    <div class="list-box scrollY" :class="{'wuyi': xxdm == '133'}">
      <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="(selected == '1' && get_list.length > 0) || (selected == '2' && my_list.length > 0)">

        <!--我收到的-->
        <v-get-task ref="cgTask" v-show="selected == 1" :list="get_list"></v-get-task>

        <!--我上传的-->
        <v-my-upload ref="stuTask" v-show="selected == 2" :list="my_list" @getDetail="getTaskInfo"></v-my-upload>

      </v-load-more>
      <div v-else class="empty">
        <v-empty-list :text="'无数据'"></v-empty-list>
      </div>
    </div>

    <!--新增任务按钮-->
    <div class="plusbtn" v-show="selected == 2" @click="showModal"></div>
    
    <!--悬赏任务入口-->
    <div class="rewardTaskEntrance flex flex-column alignCenter" v-if="rewardTaskLen" @click="jumpTo('/RewardTask')" v-show="selected == 1">
      <div class="rewardTaskbtn"></div>
      <span class="rewardTaskNumber">{{rewardTaskLen}}项任务可领</span>
    </div>

    <!--上传任务弹窗-->
    <v-submit-task ref="submit" :type="3" @submit="submit"></v-submit-task>

    <!--详情弹窗-->
    <v-detail-modal ref="detail" :info="info"></v-detail-modal>
    
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
  </div>
</template>

<script>
  import {TaskApi as API} from '@/utils/api'
  import {RewardTaskApi} from '@/utils/api'

  import EmptyList from '@/components/EmptyList.vue'
  import LoadMore from '@/components/LoadMore.vue'
  import SubmitTask from '../modal/SubmitTask.vue'
  import Detail from '../modal/Detail.vue'
  import GetTaskList from './student/GetTaskList.vue'
  import MyUpload from './student/MyUpload.vue'


  export default {
    name: "StudentTask",
    components: {
      'v-load-more': LoadMore,
      'v-get-task': GetTaskList,
      'v-my-upload': MyUpload,
      'v-submit-task': SubmitTask,
      'v-detail-modal': Detail,
      'v-empty-list': EmptyList
    },
    data() {
      return {
        classCode: this.$cookie.get('classCode'),
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),

        page: 1,
        limit: 10, // 每页显示记录条数
        assignmentStatus: '', //任务型评价项状态：1.未开始 2.进行中 3.已截止
        assignmentStatusName: '全部状态', //任务型评价项状态：1.未开始 2.进行中 3.已截止
        taskEvaluationType: '', //任务型评价项的类型： 1.常规 2.考勤 3.悬赏
        taskEvaluationTypeName: '全部类型', //任务型评价项的类型：1.未开始 2.进行中 3.已截止
        selected: '1',
        selected2: '',
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        studentselected: '1',
        acceptflg: true, // 任务列表请求响应
        auditflg: false,
        submitflg: false,
        typeselected: false,
        number: 1,
        info: {},
        get_list: [], // 我收到的任务列表
        my_list: [], // 我上传的任务列表
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
        rewardTaskLen: 0,//可领悬赏任务数量
      }
    },
    computed: {
      changeData() {
        let {selected,selected2,assignmentStatus,taskEvaluationType} = this;
        return {
          selected,
          selected2,
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
          this.initData();
          if(this.selected == '1') {
            this.getTaskList();
          } else {
            this.getMyUploadTaskList()
          }
        },
        deep: true
      },
      $route(to,from){
        if(to.path == '/zhsz/task') {
          if(from.path == '/stu/taskDetail') {
            this.initData()
            this.getTaskList();
          }
        }
      }
    },
    created() {
      this.getTaskList();
      this.getRewardTaskList();
       console.log('aaa',41);
    },
    methods: {
      // 我收到的任务列表
      async getTaskList (page, type) {
        this.$indicator.open('加载中....')
        this.page = page || this.page
        let data = {
          page: this.page,
          limit: this.limit,
          classCode: this.classCode,
          type: 3, //1.录入型 2.项目型 3.学生上传
          userId: this.userId,
          scope: '1,3', // 1.个人评价项 2.班级评价项 3.教师布置
          type: 2, // 1.录入型，2.任务型
          assignmentStatus: this.assignmentStatus,
          taskType: this.taskEvaluationType,
          invokeType: 2,
          studentId: this.userId,
        }
        const res = await this.$req.get(API.getTaskList, data);
        // 请求成功时
        if (res.resultCode == 1) {
          let {dataList} = res.value;
          this.get_list = [...this.get_list, ...dataList];

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
      // 我上传的任务列表
      async getMyUploadTaskList (page, type) {
        this.$indicator.open('加载中....')
        this.page = page || this.page
        let data = {
          page: this.page,
          limit: this.limit,
          classCode: this.classCode,
          type: 3, //1.录入型 2.项目型 3.学生上传
          userId: this.userId,
          status: this.selected2
        }
        const res = await this.$req.post(API.getStuTaskList, data);
        // 请求成功时
        if (res.resultCode == 1) {
          let {dataList} = res.value;
          this.my_list = [...this.my_list, ...dataList];

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
      // 获取可领悬赏任务数量
      async getRewardTaskList(){
        var res = await this.$req.get(RewardTaskApi.getAvaliableCount,{studentId:this.userId,classCode:this.classCode});
       
        this.rewardTaskLen = res.value;
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
      loaded(page) {
        this.allLoaded = page ? true : this.allLoaded;
        let type = page ? 'loadTop' : 'loadBottom';
        if(this.selected == '1') {
          this.get_list = page ? [] : this.get_list;
          this.getTaskList(page, type)
        } else {
          this.my_list = page ? [] : this.my_list;
          this.getMyUploadTaskList(page, type)
        }
      },
      getTaskInfo(info) {
        this.info = info;
        this.$refs.detail.showModal();
      },
      showModal() {
        this.$refs.submit.showModal();
      },
      initData() {
        this.allLoaded = true;
        this.page = 1;
        this.get_list = [];
        this.my_list = [];
      },
      async submit(data) {
        const res = await this.$req.post(API.save, data);
        if (res.resultCode == 1) {
          this.$toast('提交成功');
          this.$refs.submit.hideModal();
          this.initData();
          this.getMyUploadTaskList()
        }
      },
      jumpTo(path){
        this.$router.push(path)
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
      }
    }
  }
</script>

<style lang="less" scoped>
  .task {
    height: 100%;
    background-color: #EFF1F3;

    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      width: 100%;
      height: 88px;
      margin: 0 auto;
      background-color: #FFFFFF;
      &.height{
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
      .mtnavbar2{
        width: 100%;
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
            background-image: url(../img/arrowdown.png);
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
    }
    .list-box {
      padding-top: 176px;
      height: calc(100% - 176px);
      &.wuyi {
        padding-top: 88px;
      }
      .empty {
        position: relative;
        height: 100%;
      }
    }
    .plusbtn {
      position: fixed;
      z-index: 2000;
      right: 20px;
      bottom: 170px;
      width: 100px;
      height: 100px;
      background: url('../img/plusbtn@2x.png') no-repeat center;
      background-size: 100px auto;
    }
    .rewardTaskEntrance{
      position: fixed;
      z-index: 2000;
      right: 40px;
      bottom: 170px;
      .rewardTaskbtn{
        width: 140px;
        height: 140px;
        background: url('../img/rewardTask.gif') no-repeat center;
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

    .popup-bg{
      width:100%;
      height: 100vh;
      background:rgba(0,0,0,0.15);
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2000;
      align-items: center;
      justify-content: center;
      .popup{
        width:686px;
        // height:692px;
        background:rgba(255,255,255,1);
        opacity:1;
        border-radius:40px;
        flex-direction: column;
        .popup-head{
          width: 100%;
          margin-top: 24px;
          border-bottom: 1px solid #EFF1F3;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          .name{
            font-size:36px;
            font-weight:800;
            line-height:64px;
            color:rgba(38,38,39,1);
          }
          .time{
            font-size:32px;
            font-weight:400;
            line-height:64px;
            color:rgba(182,184,184,1);
          }
          .close{
            position: absolute;
            right: 32px;
            top: 0;
          }
        }
        .popup-info{
          margin: 32px;
          font-size:28px;
          font-weight:400;
          line-height:40px;
          color:rgba(38,38,39,1);
          flex-direction: column;
          .imglist{
            justify-content:space-between;
            margin-top: 50px;
            .img{
              height: 200px;
              width: 200px;
              background: #EFF1F3;
              img{
                height: inherit;
                width: inherit;
              }
            }
          }
          .formitem{
            flex-direction: column;
            align-items: center;
            margin-bottom: 10px;
            .label{
              width: 686px;
              height: 68px;
              font-size:28px;
              font-weight:800;
              line-height:64px;
              color:rgba(38,38,39,1);
              justify-content: space-between;
              align-items:center;
              .count{
                font-size:28px;
                font-weight:400;
                line-height:64px;
                color:rgba(182,184,184,1);
              }
              .tip{
                font-size:24px;
                font-weight:400;
                line-height:64px;
                color:rgba(150,152,153,1);
                margin-left: 20px;
              }
            }
            .title{
              width: 686px;
              font-size:28px;
              font-weight:400;
              line-height:64px;
              color:rgba(38,38,39,1);
            }
            .inputbox{
              -webkit-appearance:none;
              outline:none;
              width:570px;
              height:88px;
              background:rgba(255,255,255,1);
              border:1px solid rgba(239,241,243,1);
              opacity:1;
              padding-left: 20px;
              padding-right: 32px;
              align-items:center;
              font-size:28px;
              font-weight:400;
              line-height:64px;
              color:rgba(182,184,184,1);
              .end{
                text-align: center;
              }
              .select-icon{
                color: #C7C7CC;
                font-size: 25px;
                width: 25px;
                transform: rotate(-90deg);
              }
            }
            .radiobox{
              font-size:28px;
              font-weight:400;
              line-height:64px;
              color:rgba(38,38,39,1);
              text-align: center;
              align-self:start;
              input[type='radio']{
                display: none;
                & + label::before{
                  content: '';
                  display: inline-block;
                  width:10px;
                  height:10px;
                  border: 14px solid rgba(239,241,243,1);
                  border-radius:50%;
                  position: relative;
                  top: 8px;
                  margin-right: 20px;
                }
                &:checked + label::before{
                  border: 14px solid rgba(51,165,255,1);
                }
              }
              label{
                margin-right: 60px;
              }

            }
            .step-box {
              span {
                display: inline-block;
              }
              .span-border {
                cursor: pointer;
                width: 60px;
                height: 60px;
                line-height: 55px;
                color: #B6B8B8;
                font-size: 40px;
                font-weight: 600;
                text-align: center;
                border-radius: 8px;
                border: 2px solid #B6B8B8;
              }
              .content {
                width: 104px;
                text-align: center;
                color: #262627;
                font-size: 28px;
              }
            }
          }
        }
        .popup-btn{
          border-top:1px solid #EFF1F3;
          height: 88px;
          align-items: center;
          .btn{
            text-align: center;
            font-size:32px;
            font-weight:bold;
            line-height:64px;
          }
          .line{
            width:1px;
            height:88px;
            background:rgba(239,241,243,1);
          }
          .gray{
            color: #B6B8B8;
          }
          .blue{
            color:#33A5FF;
          }
        }
        .popup-foot{
          border-top:1px solid #EFF1F3;
          flex-direction: column;
          padding: 30px 32px;
          .footinfo{
            font-size:36px;
            font-weight:400;
            line-height:64px;
            .status{
              color:#33A5FF;
              border: Bold;
            }
            .time{
              margin-left: 20px;
              color:#B6B8B8;
            }
          }
          .achieve{
            font-size:28px;
            font-weight:400;
            line-height:40px;
            .title{
              color:rgba(182,184,184,1);
            }
            .value{
              margin-left: 20px;
              color:rgba(38,39,39,1);
            }
          }
        }
      }
    }
  }
</style>
