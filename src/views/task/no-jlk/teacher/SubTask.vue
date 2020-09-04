<template>
  <div class="subTask">
    <div class="curMainTask">
      <div class="taskTit">{{curTask.name}}</div>
      <div class="taskStatus" :class="{'ongoing': curTask.assignmentStatus == 2,'end': curTask.assignmentStatus == 3 || curTask.assignmentStatus == 1}">{{curTask.assignmentStatus == 1 ? '未开始' : curTask.assignmentStatus == 2 ? '进行中' : '已截止'}}</div>
      <div class="taskTime">日期：{{curTask.startTime}}至{{curTask.endTime}}</div>
    </div>

    <div class="tastStatistics">
      <div class="statisTit">任务完成情况</div>
      <div class="statisMain">
        <van-loading color="#a2a2a2" size="30px" class="loading" type="spinner" vertical v-show="!isLoad_TaskStatis"></van-loading>

        <div class="halfStatis" v-show="isLoad_TaskStatis">
          <div class="tit">参与情况</div>
          <div class="charts">
              <van-circle v-model="taskStatisInfo.percentParticipate" stroke-width="100" layer-color="#FFF7E2" color="#FFB600" />
              <div class="chartInfo">
                已参加<span>{{taskStatisInfo.percentParticipate}}%</span>
              </div>
          </div>
          <div class="infoNum">{{taskStatisInfo.actualParticipants}}人参与</div>
        </div>
        <div class="halfStatis" v-show="isLoad_TaskStatis">
          <div class="tit">完成情况</div>
          <div class="charts">
            <van-circle v-model="taskStatisInfo.percentComplete" stroke-width="100" layer-color="#EFE9FF" color="#6332EE" />
            <div class="chartInfo">
                已完成<span>{{taskStatisInfo.percentComplete}}%</span>
            </div>
          </div>
          <div class="infoNum">{{taskStatisInfo.totalComplete}}人完成</div>
        </div>
      </div>
    </div>


    <div class="subTaskList" v-if="subTaskDetail">
      <div class="tit">任务列表</div>

      

      <div class="subTaskTab" v-if="isManager">
        <div class="tab" :class="{'active':!byTask}" @click="changeType(false)"><span>按班级</span></div>
        <div class="tab" :class="{'active':byTask}" @click="changeType(true)"><span>按任务</span></div>
      </div>

      <!-- 子任务 -->
      <div v-show="!byTask">
        <div class="subClassBox">
          <div class="selectGrade" @click="changeGrade">{{gradeList[gradeIndex]}}</div>
          <table cellspacing="0" cellpadding="0" class="taskClassTable">
            <tr><th>班级</th><th>参与度</th><th>完成度</th><th>操作</th></tr>
            <tr v-for="(item,index) in subTaskCurClass"><td :class="{'master':checkMaster(item)}">{{item.className}}</td><td>{{item.percentParticipate}}%</td><td>{{item.percentComplete}}%</td><td><span class="opt" @click="jumpTo(item)">查看</span></td></tr>
          </table>
          
        </div>
      </div>
      
      <div v-show="byTask">
        <div class="subTaskBox" v-for="task in subTaskDetail">
          <div class="subTaskName text-overflow-clamp2">
            <div class="hashIcon"></div><div class="label">{{task.name}}</div>
          </div>
          <div class="subTaskInfo">
            <div class="infoItem">
              <span class="label">维度:</span>
              <span class="value">{{task.dimensionName}}</span>            
            </div>
            <div class="infoItem">
              <span class="label">奖励:</span>
              <span class="value">{{task.rewardType==1?'分数':'勋章'}}</span>   
              <span class="plus">+{{task.evaluationRuleScore.score}}</span>         
            </div>
            <div class="infoItem">
              <span class="label">频次:</span>
              <span class="value">{{frequency[task.evaluationRuleFrequency.type]}}<span v-if="task.evaluationRuleFrequency.type!=1">{{task.evaluationRuleFrequency.count}}次</span> {{task.weekdayOnly?'(限工作日)':''}}</span>
            </div>
            <div class="infoItem">
              <span class="label">时间:</span>
              <span class="value">{{task.startTime.split(' ')[0]}}-{{task.endTime.split(' ')[0]}}</span>            
            </div>
          </div>
          <div class="submitStudent"  v-if="task.joinCount!=0">
            <div class="text">
              已有<span class="stucount">{{task.submitCount||0}}人</span>提交
            </div>
          </div>
          <div class="noTask" v-if="task.joinCount==0">暂无同学领取</div>
          <div class="footer">
            <!-- <div class="btn" @click="jumpTo2('/SubTaskDetail',{componentName:'teacherDetail',subTaskId:task.id})">审核/查看</div> -->
            <div class="btn" @click="jumpTo(task)">审核/查看</div>
          </div>
        </div>
      </div>

      <van-loading color="#a2a2a2" size="30px" class="loading" type="spinner" vertical v-show="!isLoad_TaskList"></van-loading>
    </div>
    <!-- <div class="empty" v-if="!subTaskDetail||subTaskDetail.length==0">
      <v-empty-list :text="'无数据'"></v-empty-list>
    </div> -->
    <van-popup v-model="showPicker" round position="bottom">
      <van-picker  title="选择年级" class="gradePicker"  show-toolbar  :columns="gradeList"  @confirm="onConfirm"  @cancel="onCancel"   />
    </van-popup>
  </div>
</template>

<script>
  import { Circle } from 'vant';
  import _ from 'lodash';
  import {RewardTaskApi as API} from '@/utils/api'
  import EmptyList from '@/components/EmptyList.vue'
  export default {
    name: "teacherSubTask",
    components:{      
      'v-empty-list': EmptyList
    },
    data(){
      return{
        taskStatisInfo:{          // 主任务统计的对象
          actualParticipants:0,
          participants:0,
          percentComplete:0,
          percentParticipate:0,
          totalComplete:0
        },
        showPicker:false,
        gradeList:['全部年级'],
        gradeIndex:0,
        isManager:false,            //是否是N0000004的管理员 悬赏任务的管理员
        isLoad_TaskStatis:false,
        isLoad_TaskList:false,
        byTask:false,
        userId: this.$cookie.get('userId'),
        userType: 'stu',
        curTask:{},
        subTaskDetail: [],
        subTaskClass:[],
        subTaskCurClass:[],
        subTaskId: '',
        frequency: {
          '1':'仅一次',
          '2':'每天',
          '3':'每周',
          '4':'每月',
        },
        classMasterList:[],
      }
    },
    // computed: {
    // rateText() {
    //     console.log(this.rateJoin,"this.rateJoin")
    //     return this.rateJoin.toFixed(0) + '%';
    //   },
    // },
    mounted() {
      this.init();
      
    },
    methods:{
      async init(){
        // 获取主任务中传递过来的详细任务信息
        this.curTask = JSON.parse(window.sessionStorage.getItem("curTask"));
        let permission = JSON.parse(window.sessionStorage.getItem('userPermission')).options;

        let permissionObj = _.find(permission,{'code':'N000004'})
        if(permissionObj && permissionObj.isPermitted){
          // console.log("我有权限")      
          this.isManager = true;
          await this.getClassMasterList();
        }else{
          // console.log("我没有权限")
          this.isManager = false;
          // 无权限直接显示按任务
          this.byTask = true;
        }
        
        // 获取主任务统计
        this.getPrimaryStatis();

        this.getTaskList();
      },
      /**
       * 获取班主任列表
       */
      async getClassMasterList(){
        let params = {};
        params.schoolCode = this.$cookie.get('xxdm');
        params.teacherCode = this.$cookie.get('userId');
        /// 老OA接口没有 resultCode 状态码所以用try catch获取下返回值
        try{
          let res = await this.$req.get(API.getClassTeacherClassList,params)
          console.log(res,"fdfsdfdsfdsfdsfs")
          this.classMasterList = res;
        }catch(data){
          this.classMasterList = data;
        }
      },
      /**
       * 获取主任务的统计信息
       */
      async getPrimaryStatis(){
        this.isLoad_TaskStatis = false;
        let params = {};
        params.id = this.curTask.categoryId;
        if(!this.isManager){
          params.teacherId = this.userId
        }
        let res = await this.$req.get(API.primaryStatistics,params)
        if(res.resultCode==1){
          this.taskStatisInfo = res.value;
          this.isLoad_TaskStatis = true;
          console.log(this.taskStatisInfo,"this.taskStatisInfo")
        }
        
      },
      /**
       * 获取任务列表 根据byTask false:按班级  true:按任务
       * 权限：老师只有按任务
       */
      async getTaskList(){
        
        this.isLoad_TaskList = false;
        // 按任务 和 按班级分别接口去访问
        if(this.byTask){
          this.subTaskDetail = [];
          var res = await this.$req.get(API.auditlist,{categoryId:this.curTask.categoryId,teacherId: this.userId});
          if(res.resultCode==1){
            this.subTaskDetail = res.value||[];
          }
        }else{
          this.subTaskClass = [];
          var res = await this.$req.get(API.classStatistics,{id:this.curTask.categoryId});
          if(res.resultCode==1){
            this.subTaskClass = res.value;
            this.subTaskCurClass = _.cloneDeep(this.subTaskClass)
          }
          this.taskClassOrderByMaster(this.subTaskCurClass);
          //获取班级任务里的所有年级
          this.getTaskGradeList();
        }
        this.isLoad_TaskList = true;
      },
      changeType(isTask){
        if(this.byTask!=isTask){
          this.byTask=isTask
          this.getTaskList()
        }
      },
      getTaskGradeList(){
        let tempGrade = _.uniqBy(this.subTaskClass,'gradeId');
        for(let i=0;i<tempGrade.length;i++){
          this.gradeList.push(tempGrade[i].gradeName)
        }
      },
      taskClassCheck(val){
        if(val=='全部年级'){
          this.subTaskCurClass = _.cloneDeep(this.subTaskClass);
        }else{
          this.subTaskCurClass = _.filter(this.subTaskClass,{"gradeName":val})
        }
        this.taskClassOrderByMaster(this.subTaskCurClass);
      },
      
      changeGrade(){
        this.showPicker = true;
      },
      onConfirm(value, index){
        this.gradeIndex = index;
        this.taskClassCheck(value);
        this.showPicker = false;
      },
      /**
       * 重组子任务班级列表 按照班主任优先排列
       */
      taskClassOrderByMaster(list){
        console.log(list,"排序List")
        let TempArr = [];
        for(let i=0;i<list.length;i++){
          if(this.checkMaster(list[i])){
            TempArr.unshift(list[i]);
          }else{
            TempArr.push(list[i]);
          }
        }
        this.subTaskCurClass = TempArr;
      },
      /**
       * 判断是否是班主任
       */
      checkMaster(item){
        return _.find(this.classMasterList,{"classId":item.classId}) ? true : false
      },
      onCancel(){
        this.showPicker = false;
      },
      jumpTo(item){
        window.sessionStorage.setItem('curClassTask',JSON.stringify(item))
        if(this.isManager){
          if(this.byTask){
            this.$router.push({"path":"/byTaskDetail"})
          }else{
            this.$router.push({"path":"/taskClassDetail"})
          }
        }else{
          this.$router.push({'path':'/SubTaskDetail', query: {subTaskId:item.id,componentName:'teacherDetail'}})
        }
      }
    }
    
  }
</script>

<style scoped lang="less">
  .curMainTask{
    width: 100%;
    padding: 32px;
    position: relative;
    box-sizing: border-box;
    .taskTit{
      font-size: 36px;
      line-height: 50px;
      font-weight: 700;
    }
    .taskTime{
      font-size: 28px;
      margin-top: 20px;
      color: #AEB6C1;
    }
    .taskStatus {
      font-weight: 600;
      font-size: 28px;
      position: absolute;
      top: 32px;
      right: 32px;
      line-height: 50px;
    }
    .ongoing {
      color: #FFB600;
    }
    .end {
      color: #B6B8B8;
    }
  }

  .tastStatistics{
    width: 680px;
    margin: 0 35px;
    .statisTit{
      font-size: 36px;
      color: #292D33;
      line-height: 50px;
      padding:10px 0 20px;
      font-weight: 700;
    }
    .statisMain{
      width: 100%;
      height: 420px;
      border-radius: 20px;
      box-shadow: 0 0 30px rgba(174, 182, 193, .3);
      position: relative;
      .loading{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
      }
      .halfStatis{
        width: 50%;
        height: 100%;
        float: left;
        .tit{
          font-size: 32px;
          padding: 40px 0 20px;
          width: 100%;
          text-align: center;
        }
        .charts{
          text-align: center;
          position: relative;
          .chartInfo{
            font-size: 28px;
            color: #AEB6C1;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            span{
              display: block;
              font-size: 48px;
              color: #292D33;
            }
          }
        }
        .infoNum{
          text-align: center;
          font-size: 28px;
          color: #AEB6C1;
          padding-top: 30px;
        }
      }
    }
  }


  .subTask{
    height: 100%;
    overflow: auto;
    background-color: #FFF;
    .headerTitle{
      font-size:72px;
      font-weight:800;
      color:rgba(255,255,255,1);
      background-image: url(../../img/subtaskbg.png);
      background-repeat: no-repeat;
      background-size: 100% 100%;
      background-position: 0 0;
      height: 100px;
      padding: 40px;
    }
    .subTaskList{
      padding: 20px 32px;
      .loading{
        margin-top: 50px;
      }
      .tit{
        font-size: 36px;
        color: #292D33;
        line-height: 50px;
        padding:30px 0 20px;
        font-weight: 700;
      }
      .subTaskTab{
        height: 88px;
        border-bottom: 1px solid #EFF1F3;
        .tab{
          line-height: 88px;
          width: 50%;
          float: left;
          text-align: center;
          font-size: 30px;
          color: #AEB6C1;
          &.active{
            color: #292D33;
            span{
              position: relative;
              display: inline-block;
            }
            span:after{
              content: '\20';
              position: absolute;
              width: 50%;
              left: 20%;
              background: #168DFF;
              height: 4px;
              border-radius: 2px;
              bottom: -2px;
            }
          }
        }
      }

      .subTaskBox{
        float: left;
        width: 100%;
        margin: 20px 0;
        box-sizing: border-box;
        background-color: #fff;
        border-radius: 20px;
        box-shadow: 0 0 30px rgba(174, 182, 193, .3);
        padding: 32px;
        position: relative;
        .subTaskName{
          max-height: initial;
          // align-items:;
          .hashIcon{
            background-image: url(../../img/hash.png);
            background-repeat: no-repeat;
            background-size: auto 100%;
            background-position: 0 0;
            height: 70px;
            width: 70px;
            margin-right: 20px;     
            position: absolute;
          }
          .label{
            color:rgba(41,45,51,1);
            font-size:42px;
            font-weight:700;
            line-height: 70px;
            margin-left: 100px;
          }
        }
      }

      .selectGrade{
        border: 1px solid #DADFE6;
        width: 200px;
        height: 56px;
        margin-top: 20px;
        line-height: 52px;
        font-size: 28px;
        border-radius: 28px;
        padding-right: 50px;
        text-align: center;
        background: url("../../../../assets/img/dot_select.png") no-repeat 150px center;
        background-size: auto 50%;
        box-sizing: border-box;
        color: #292D33;
      }

      .taskClassTable{
        width: 100%;
        margin-top: 20px;
        th,td{
          border: none;
          border-collapse: collapse;
          font-size: 28px;
        }
        th{
          background: #EFF1F3;
          height: 60px;
          line-height: 60px;
          color: #262727;
          text-align: left;
          padding-left: 15px;
        }
        td{
          line-height: 40px;
          padding: 40px 0;
          padding-left: 15px;
          border-bottom: 1px solid #EFF1F3;
          position: relative;
        }
        .master:after{
          content: '班主任';
          font-size: 24px;
          color: #FFF;
          line-height: 44px;
          text-align: center;
          width: 116px;
          height: 44px;
          background: url(../../img/masterbg.png) no-repeat center center;
          background-size: 100% 100%;
          position: absolute;
          z-index: 1;
          right: 0;
        }
        .opt{
          color: #168DFF;
        }
      }



      .subTaskInfo{
        margin: 24px 0;
      }
      .time{
        font-size:28px;
        color:rgba(182,184,184,1);
      }
      .noTask{
        font-size: 30px;
        color: #AEB6C1;
        font-weight:bold;
        position: relative;
        display: inline-block;
      }
      .submitStudent{
        font-size:28px;
        color:rgba(41,45,51,1);
        font-weight:bold;
        position: relative;
        display: inline-block;
        &::before{
          content: '';
          background-color: #FFF1CF;
          height: 12px;
          width: 100%;
          position: absolute;
          top: 20px;
        }
        
        .text{
          position: relative;
          z-index: 1;
          line-height: 40px;
        }
        .stucount{
          color: #FF9E1E;
          margin: 0 10px;
        }
      }
      .footer{
        height: 64px;
        margin-top: 32px;
        .btn{
          float: right;
          height: 64px;
          font-size:28px;
          font-weight:400;
          color:rgba(255,255,255,1);
          border-radius:44px;
          line-height: 64px;
          background:#168DFF;
          padding: 0 24px;
        }
      }
    }
  }
  .subTaskInfo{
    .infoItem{
      font-size:28px;
      color:rgba(41,45,51,1);
      margin-bottom: 20px;
      .label{  
        margin-right: 20px;
      }
      .last{
        color: #FF7B12;
      }
      .plus{
        color: #FFB600;
      }
      .progress{
        position: relative;
        display: inline-block;
        height: 20px;
        width: 200px;
        background:rgba(239,241,243,1);
        border-radius:10px;
        .bar{  
          display: inline-block;
          height: 20px;
          background-color: #FF7B12;
          position: absolute;
          border-radius:10px;
        }
      }
    }
    .limitPeople{
      position: absolute;
      height: 120px;
      width: 120px;
      background-image: url(../../img/peoplelimit.png);
      background-repeat: no-repeat;
      background-position: 0 0;
      background-size: 100% auto;
      right: 32px;
      bottom: 32px;
      .text{
        font-size:24px;
        font-family:Source Han Sans CN;
        font-weight:bold;
        color:rgba(0,205,134,1);
        transform: rotate(45deg) translate(-150%,-25%);
        margin-left: 50%;
        margin-top: 50%;
        word-break: keep-all;
        transform-origin: left bottom;
      }
    }
  }
</style>
