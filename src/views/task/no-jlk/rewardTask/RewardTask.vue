<template>
  <div class="rewardTask">
    <!-- 标题 -->
    <div class="headtitle">任务榜</div>
    
    <!-- 任务列表 -->
    <div class="taskbox" v-for="(task,n) in taskList" :key="n">
      <div class="taskName text-overflow">{{task.name}}</div>
      <div class="subTask" v-if="task.subTaskCount>0">
        <div class="number">共{{task.subTaskCount}}项任务</div>
        <div class="receivebtn" @click="jumpTo('/RewardTask/SubTask',{taskId:task.id})">快去领取</div>
      </div>
      <div class="timeRange">
        时间:{{task.startTime}}-{{task.endTime}}
      </div>
    </div>
    
  </div>
</template>

<script>
  import {RewardTaskApi as API} from '@/utils/api'
  export default {
    name: "StudentRewardTask",
    mounted(){
      this.init();
    },
    data(){
      return {
        classCode: this.$cookie.get('classCode'),
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),
        taskList: [],
      }
    },
    methods:{
      init(){
        this.getRewardTaskList();
      },
      async getRewardTaskList(){
        this.$indicator.open('加载中....')
        var res = await this.$req.get(API.getAvaliableList,{studentId:this.userId,classCode:this.classCode});
        console.log(res,41);
        this.taskList = res.value;
        if(res.value.length==0){
          // 没任务就返回
          this.$router.go(-1);
        }
      },
      jumpTo(path,query){
        this.$router.push({
          path,
          query
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .rewardTask{
    background:rgba(255,200,64,1);
    background-image: url(../../img/taskbg.png);
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: 0 0;
    padding: 40px 32px;
    height: 100%;
    overflow: auto;
    .headtitle{
      font-size:72px;
      font-weight:800;
      color:rgba(255,255,255,1);
      text-indent: 8px;
      margin-bottom: 40px;
    }
    .taskbox{
      background:rgba(255,255,255,1);
      box-shadow:0px 12px 40px rgba(174,87,0,0.3);
      border-radius:16px;
      margin-bottom: 60px;
      padding: 40px;
      .taskName{
        font-size:48px;
        font-weight:800;
        color:rgba(41,45,51,1);
      }
      .timeRange{
        font-size:28px;
        color:rgba(174,182,193,1);
        margin-top: 20px;
      }
      .subTask{
        font-size:28px;
        color:rgba(41,45,51,1);
        position: relative;
        padding-top: 20px;
        .number{
          display: inline-block;
          &::before{
            content: '';
            background-image: url(../../img/icon_right_double.png);
            background-repeat: no-repeat;
            background-size:100% auto;
            height: 25.8px;
            width: 35.9px;
            display: inline-block;
            position: relative;
            top: 2px;
            margin-right: 20px;
          }
        }
        .receivebtn{
          display: inline-block;
          font-size:32px;
          background:rgba(255,123,18,1);
          color:rgba(255,255,255,1);
          padding: 22px 40px;
          border-radius:44px;
          position: absolute;
          top: -8px;
          right: 0;
        }
      }
    }
  }
</style>
