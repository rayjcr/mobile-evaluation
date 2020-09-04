<template>
  <div class="subTaskDetail">
    <div class="header">
      <div class="title">{{subTaskDetail.name}}</div>
      <div class="subTaskInfo">
        <div class="infoItem" v-if="subTaskDetail.totalTaskCount&&componentName!='stuReceived'">
          <span class="label">领取人数:</span>
          <div class="progress">
            <span class="bar" :style="{'width': (subTaskDetail.lastPercent||0) + '%'}"></span>
          </div>
          <span class="last">共{{subTaskDetail.totalTaskCount}}名，还剩{{subTaskDetail.lastCount}}名</span>             
        </div>
        <div class="infoItem">
          <span class="label withIcon dimension">维度:</span>
          <span class="value">{{subTaskDetail.dimensionName}}</span>            
        </div>
        <div class="infoItem">
          <span class="label withIcon reward">奖励:</span>
          <span class="value">{{subTaskDetail.rewardType=='1'?'分数':'勋章'}}</span>   
          <span class="plus">+{{subTaskDetail.evaluationRuleScore.score}}</span>         
        </div>
        <div class="infoItem">
          <span class="label withIcon frequency">频次:</span>
          <span class="value">
            {{frequency[subTaskDetail.evaluationRuleFrequency.type]}}<span v-if="subTaskDetail.evaluationRuleFrequency.type!=1">{{subTaskDetail.evaluationRuleFrequency.count}}次</span> {{subTaskDetail.weekdayOnly?'(限工作日)':''}}
          </span>            
        </div>
        <div class="limitPeople" v-if="subTaskDetail.totalContributorCount">
          <div class="text">最多{{subTaskDetail.totalContributorCount}}人协作</div>
        </div>
      </div>
      <div class="time" v-if="subTaskDetail.startTime!=''">
        时间:  {{subTaskDetail.startTime.split(' ')[0]}}-{{subTaskDetail.endTime.split(' ')[0]}}
      </div>
      <div class="time addInfo" v-if="componentName=='stuReceived'&&linkUserInfo">
        <span v-if="linkUserInfo.linkUserCode!=userId">被{{linkUserInfo.linkUserName}}添加</span>
      </div>
    </div>
    <div class="taskDeatail">
      <component ref="component" :task="subTaskDetail" :classId="classId" :linkUserId="linkUserInfo?linkUserInfo.linkUserCode:null" v-if="componentName" :is="componentName"></component>
    </div>
  </div>
</template>

<script>
  import {RewardTaskApi as API} from '@/utils/api'
  import stuUncollected from './StuUncollected.vue'
  import stuReceived from './StuReceived.vue'
  import teacherDetail from './teacherDetail.vue'
  export default {
    name: "SubTaskDetail",
    components:{
      stuUncollected,
      stuReceived,
      teacherDetail
    },
    data(){
      return {
        classCode: this.$cookie.get('classCode'),
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),
        componentName: null,
        subTaskId: '',
        subTaskDetail: {
          categoryId:"",
          id:"",
          name:"",
          dimensionId:"",
          dimensionName:"",
          summary:"",
          rewardType:'',
          startTime:"",
          endTime:"",
          totalTaskCount:null,
          totalContributorCount: null,
          totalSubmitCount:null,
          weekdayOnly:null,
          evaluationRuleFrequency:{"id":"","type":'',"count":''},
          evaluationRuleScore:{"id":"","score":''},
          evaluationScopeList:[],
        },
        frequency: {
          '1':'仅一次',
          '2':'每天',
          '3':'每周',
          '4':'每月',
        },
        loading: true,
        linkUserInfo: null,
        classId:"",
      }
    },
    async mounted(){  
      this.init()
      // this.getTaskDetail();
    },
    methods:{
      init(){
        this.componentName = this.$route.query.componentName   
        this.subTaskId = this.$route.query.subTaskId;
        this.classId = this.$route.query.classId;
        this.getTaskDetail();
      },
      async getTaskDetail(){
        this.$indicator.open('加载中....')
        var res = await this.$req.get(API.getSubTaskDetail+this.subTaskId,{});
        // console.log(res.value,96)
        this.subTaskDetail = res.value;  
        document.title = this.subTaskDetail.name
        this.linkUserInfo = null
        if(this.componentName == 'stuReceived'){
          this.getJoinDetail();
        } else if(this.subTaskDetail.totalTaskCount){
          // 有限制领取人数
          this.getTaskAvaliable();
        }
        // this.loading = false;
      },
      async getJoinDetail(){
        var res = await this.$req.get(API.joinSubTaskDetail,{schoolCode: this.xxdm,evaluationId: this.subTaskDetail.id,studentId: this.userId});
        console.log(res.value,96)
        this.linkUserInfo = res.value.linkUserCode!=this.userId?res.value:null;
      },
      async getTaskAvaliable(){
        var res = await this.$req.get(API.getJoinTimes,{schoolCode: this.xxdm,evaluationId: this.subTaskDetail.id})
        res.value = res.value||0;
        this.$set(this.subTaskDetail,'lastCount',this.subTaskDetail.totalTaskCount-res.value);
        this.$set(this.subTaskDetail,'lastPercent',Math.round(res.value/this.subTaskDetail.totalTaskCount*100));
      },
      checkMenu(event){
        if(this.componentName=='teacherDetail'&&this.$refs.component){
          this.$refs.component.checkMenu(event)
        }        
      }
    },
    watch:{
      componentName(val){
        if(this.componentName=='teacherDetail'){
          window.addEventListener('scroll', this.checkMenu,true)
        } else {
          window.removeEventListener('scroll', this.checkMenu)
        }
      },      
      $route(to,from){
        this.init();
      }
    }
  }
</script>

<style scoped lang="less">
  .subTaskDetail{
    height: 100%;
    overflow: auto;
    .header{
      background-color: #fff;
      padding: 40px 32px;
      position: relative;
      .title{
        font-size:36px;
        font-weight:800;
        color: #292D33;
        margin-right: 110px;
      }
      .subTaskInfo{
        margin-top: 40px;
        margin-bottom: 20px;
      }
      .time{
        font-size:28px;
        color:rgba(182,184,184,1);
      }
      .addInfo{
        margin-top: 22px;
      }
    }
    .taskDeatail{
      margin-top: 20px;
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
      .withIcon{
        &::before{
          content: '';
          position: relative;
          top: 3px;
          display: inline-block;
          height: 28px;
          width: 28px;
          margin-right: 12px;
          background-repeat: no-repeat;
          background-size: 100% auto;
          background-position: 0 0;
        }
      }
      .dimension::before{
        background-image: url(../../img/dimensionicon.png);
      }
      .reward::before{
        background-image: url(../../img/rewardicon.png);
      }
      .frequency::before{
        background-image: url(../../img/frequencyicon.png);
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
      top: 40px;
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
