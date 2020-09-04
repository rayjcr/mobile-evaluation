<template>
  <div class="subTask">
    <div class="headerTitle">
      {{mainTaskName}}
    </div>
    <div class="subTaskList">
      <!-- 子任务 -->
      <div class="subTaskBox" v-for="(task,index) in subTaskList" @click="jumpTo('/SubTaskDetail',{componentName:'stuUncollected',subTaskId:task.id})">
        <div class="subTaskName text-overflow-clamp2">
          <div class="hashIcon"></div><div class="label">{{task.name}}</div>
        </div>
        <div class="subTaskInfo">
          <div class="infoItem" v-if="task.totalTaskCount">
            <span class="label">领取人数:</span>
            <div class="progress">
              <span class="bar" :style="{'width': (task.joinPercent||0) + '%'}"></span>
            </div>
            <span class="last">共{{task.totalTaskCount}}名，还剩{{task.lastCount||task.totalTaskCount}}名</span>             
          </div>
          <div class="infoItem">
            <span class="label">维度:</span>
            <span class="value">{{task.dimensionName}}</span>            
          </div>
          <div class="infoItem">
            <span class="label">奖励:</span>
            <span class="value">{{task.rewardType=='1'?'分数':'勋章'}}</span>   
            <span class="plus">+{{task.evaluationRuleScore.score}}</span>         
          </div>
          <div class="infoItem">
            <span class="label">频次:</span>
            <span class="value">
              {{frequency[task.evaluationRuleFrequency.type]}}<span v-if="task.evaluationRuleFrequency.type!=1">{{task.evaluationRuleFrequency.count}}次</span> {{task.weekdayOnly?'(限工作日)':''}}
            </span>            
          </div>
          <div class="limitPeople" v-if="task.totalContributorCount">
            <div class="text">最多{{task.totalContributorCount}}人协作</div>
          </div>
        </div>
        <div class="time">
          时间:  {{task.startTime.split(' ')[0]}}-{{task.endTime.split(' ')[0]}}
        </div>
      </div>
      <!-- 子任务 -->
<!--      <div class="subTaskBox">
        <div class="subTaskName">
          <div class="hashIcon"></div><div class="label">迎接春天 校园阳光运动一小时</div>
        </div>
        <div class="subTaskInfo">
          <div class="infoItem">
            <span class="label">领取人数:</span>
            <div class="progress">
              <span class="bar" :style="{'width': 90 + '%'}"></span>
            </div>
            <span class="last">共50名，还剩5名</span>             
          </div>
          <div class="infoItem">
            <span class="label">维度:</span>
            <span class="value">礼仪</span>            
          </div>
          <div class="infoItem">
            <span class="label">奖励:</span>
            <span class="value">分数</span>   
            <span class="plus">+5</span>         
          </div>
          <div class="infoItem">
            <span class="label">频次:</span>
            <span class="value">每周2次 (限上学日)</span>            
          </div>
        </div>
        <div class="time">
          时间:  2020/04/01-2020/04/30
        </div>
      </div>
    -->
    </div>
  </div>
</template>

<script>
  import {RewardTaskApi as API} from '@/utils/api'
  export default {
    name: "RewardSubTask",
    data(){
      return{
        userType: 'stu',
        categoryId: '',
        classCode: this.$cookie.get('classCode'),
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),
        subTaskList: [],
        mainTaskName: '',
        frequency: {
          '1':'仅一次',
          '2':'每天',
          '3':'每周',
          '4':'每月',
        }
      }
    },
    mounted(){
      this.categoryId = this.$route.query.taskId;
      this.getAvaliableSubTasks();
    },
    methods:{
      async getAvaliableSubTasks(){
        this.$indicator.open('加载中....')
        var res = await this.$req.get(API.getAvaliableSubList,{studentId:this.userId,classCode:this.classCode,categoryId:this.categoryId});
        this.mainTaskName = res.value.name;
        document.title = this.mainTaskName
        this.subTaskList = res.value.subTaskList;
        if(this.subTaskList.length==0){
          this.$router.go(-1)
        }
        this.getSubTasksAvaliable();
      },
      async getSubTasksAvaliable(){
        var res = await this.$req.get(API.getJoinTimesByCategoryId,{schoolCode:this.xxdm,evaluationCategoryId:this.categoryId});
        for(var key in res.value){
          console.log("属性：" + key + ",值："+ res.value[key]);
          var sub = this.subTaskList.find(s=>s.id==key);
          if(sub){
            var last = (sub.totalTaskCount-res.value[key]);
            this.$set(sub,'lastCount',last);
            this.$set(sub,'joinPercent',Math.round(res.value[key]/sub.totalTaskCount*100));            
          }
        }
      },
      jumpTo(path,query){
        this.$router.push({
          path,query
        })
      }
    }
    
  }
</script>

<style scoped lang="less">
  .subTask{
    height: 100%;
    overflow: auto;
    background-color: #fff;
    .headerTitle{
      font-size:72px;
      font-weight:800;
      color:rgba(255,255,255,1);
      background-image: url(../../img/subtaskbg.png);
      background-repeat: no-repeat;
      background-size: 100% 100%;
      background-position: 0 0;
      // height: 100px;
      padding: 40px;
    }
    .subTaskList{
      background: #fff;
      padding: 40px 32px;
      .subTaskBox{
        box-shadow:0px 12px 40px rgba(174,87,0,0.1);
        border-radius:16px;
        padding: 32px;
        position: relative;
        margin-bottom: 40px;
        .subTaskName{
          max-height: initial;
          // align-items:;
          .hashIcon{
            background-image: url(../../img/hash.png);
            background-repeat: no-repeat;
            background-size: auto 100%;
            background-position: 0 0;
            height: 80px;
            width: 80px;
            margin-right: 20px;     
            position: absolute;
          }
          .label{
            color:rgba(41,45,51,1);
            font-size:48px;
            font-weight:800;
            line-height: 80px;
            margin-left: 100px;
          }
        }
      }
      .subTaskInfo{
        margin: 32px 0;
      }
      .time{
        font-size:28px;
        color:rgba(182,184,184,1);
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
