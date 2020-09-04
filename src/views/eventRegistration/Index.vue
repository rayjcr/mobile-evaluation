<template>
  <div class="task">
    <div class="navbar">
      <mt-navbar v-model="assignmentStatus" class="mtnavbar2">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="1"><span class="selectbar">未开始</span></mt-tab-item>
        <mt-tab-item id="0"><span class="selectbar">进行中</span></mt-tab-item>
        <mt-tab-item id="2"><span class="selectbar">已结束</span></mt-tab-item>
      </mt-navbar>
    </div>
    <ul class="eventList flex">
      <li v-for="(item,index) in activList" :key="index" @click="_jump('/EventDetail',item)" class="eventbox">
        <div class="eventdetail flex">
          <div class="eventimg"><img src="./img/eventdefalutImg.png" alt=""></div>
          <div class="eventtitle">{{item.activityName}}</div>
          <div class="eventStatus unstart" :style="{'color':item.activityStatus ==0?'##FFB600':(item.activityStatus ==1?'#33A5FF':'#969899')}">{{statusStr[item.activityStatus]}}</div>
        </div>
        <div class="eventtime flex">
          <div class="timeicon"><img src="./img/time.png" alt=""></div>
          <div class="time">报名时间: {{item.startTime + '~' + item.endTime}}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Axios from 'axios'
import { activityApi } from '@/utils/api'
export default {
  name: 'eventRegistration',
  data(){
    return {
      statusStr: ['进行中','未开始','已结束'],
      assignmentStatus: '', //任务型评价项状态：1.未开始 2.进行中 3.已截止
      activList: [],
    }
  },
  watch: {
    assignmentStatus(newVal,oldVal) {
      this.getActivityDate(newVal ? newVal: '')
    }
  },
  mounted() {

  },
  activated() {
    this.assignmentStatus = ''
    this.getActivityDate('')
  },
  methods:{
    getActivityDate(status) {
      this.activList = []
      Axios.get(activityApi.getActivityList+'?activityStatus='+status,).then(res => {
        if(res.resultCode === 1) {
          this.activList = res.value
        }
      })
    },
    _jump(path,item) {
      sessionStorage.setItem('currActiv',JSON.stringify(item))
      this.$router.push({
        path
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .task {
    height: 100%;
    background-color: #EFF1F3;
    overflow-y: scroll;
    overflow-x: hidden;
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      width: 100%;
      height: 88px;
      margin: 0 auto;
      background-color: #FFFFFF;
      &.height{
        height: 176px;
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
    }
    .eventList{
      margin-top: 88px;
      flex-direction: column;
      .eventbox {
        width: 100%;
        height: 150px;
        background-color: #fff;
        padding: 32px;
        margin-top: 20px;
        .eventdetail{
          .eventimg{
            width: 108px;
            height: 96px;
            img{
              width: inherit;
              height:inherit;
            }
          }
          .eventtitle{
            font-size:30px;
            font-weight:800;
            color:rgba(38,38,38,1);
            margin-left: 20px;
            width: 360px;
          }
          .eventStatus{
            font-size:30px;
            font-weight:400;
            margin-left: 108px;
          }
        }
        .eventtime{
          margin-top: 20px;
          align-items: center;
          .timeicon{
            height: 28px;
            width: 28px;
            margin-right: 12px;
            img{
              width: inherit;
              height:inherit;
            }
          }
          .time{
            font-size:24px;
            font-weight:400;
            color:rgba(182,184,184,1);
          }
        }
      }
    }

  }
  .flex {
    display: flex;
  }
  .inProgress{
    color: #33A5FF;
  }
  .stop{
    color: #969899;
  }
  .unstart{
    color: #FFB600;
  }
</style>
