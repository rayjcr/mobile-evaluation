<template>
  <div class="stuReceived">
    <div class="taskInfo">
      <div class="header flex justifySpaceBetween alignCenter">
        <div class="title">任务内容</div>
        <div class="more" @click="showTaskDetail=true">查看</div>
      </div>
      <div class="content text-overflow-clamp2">
        {{message}}
      </div>
    </div>
    <div class="taskInfo">
      <div class="header flex justifySpaceBetween alignCenter">
        <div class="title">完成情况</div>
        <div class="more" @click="jumpTo('/StuProgress',{taskId: task.id,linkUserId:linkUserId})">
          <span class="status" :class="{'orange':compitionStatus==-1,'green':compitionStatus==1}">{{compitionStatusList[compitionStatus]}}</span>
        </div>
      </div>
      <div class="content chart">
        <ringChart :chartData="compitionData"></ringChart>
      </div>
    </div>
    <div class="actionbtns flex alignCenter">
      <div class="btn":class="(compitionStatus!=1&&compitionStatus!=-1)?'orange':'orangegrey'" v-if="role=='creator'" @click="showConfirm('del')">删除</div>
      <div class="btn" :class="canSubmit&&(compitionStatus==3||compitionStatus==0)?'blue':'grey'" v-if="role=='creator'" @click="submitTask">提交任务</div>
      <div class="btn":class="(compitionStatus!=1&&compitionStatus!=-1)?'orange':'orangegrey'" v-if="role=='participant'" @click="showConfirm('quit')">退出协作</div>
    </div>
    
    <mt-popup
      v-model="showTaskDetail"
      position="bottom">
      <div class="popupContent">
        <div class="header flex alignCenter justifySpaceBetween">
          <div class="title">任务内容</div>
          <div class="arrowdown" @click="showTaskDetail=false"></div>
        </div>
        <div class="taskdetail" v-html="task.summary"></div>        
      </div>
    </mt-popup>
    
    <confirm ref="confirmDialog" :msg="confirmconfig.msg" :btnText="confirmconfig.btnText" @choose="handleConfirm"></confirm>
  </div>
</template>

<script>
  import {RewardTaskApi as API} from '@/utils/api'
  import {PjApi} from '@/utils/api'
  import ringChart from './ringChart.vue'
  import confirm from '../../modal/Confirm.vue'
  export default {
    name: "subTaskStuReceived",
    props:['task','linkUserId'],
    components:{
      ringChart,
      confirm
    },
    data(){
      return {
        classCode: this.$cookie.get('classCode'),
        gradeId: this.$cookie.get('gradeId'),
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),
        role: 'creator',
        confirmconfig: {
          msg: '',
          btnText:{
            confirm: '确认',
            cancel: '取消'
          }
        },
        showTaskDetail: false,
        confirmDelType: '',//确认退出的类型（del主动退出，quit退出协作）
        compitionInfo: null,// 完成情况信息
        compitionStatus: '',// 完成情况状态
        compitionStatusList:{
          '0': '审核中',
          '1': '审核通过',
          '-1': '审核未通过',
          '3': '进行中',
          '4': '未完成'
        }
      }
    },
    mounted(){
      this.init()
    },
    methods:{
      init(){
        this.$refs.confirmDialog.hideModal();   
        this.role=this.linkUserId?'participant':'creator'   
        this.compitionInfo = null;
        this.getSubmitInfo();
      },
      // 获取提交情况
      async getSubmitInfo(){
        var data = {
          classCode: this.classCode,
          dimensionId: this.task.dimensionId,
          evaluationId: this.task.id,
          evaluationObject: 1,
          gradeCode: this.gradeId,
          limit: 10,
          page:1,
          schoolCode: this.xxdm,
          type: '2',
          userId: this.linkUserId || this.userId
        }
        var res = await this.$req.post(API.getSubmitInfo,data);
        this.compitionInfo = res.value;
        
        var endtime = new Date(this.task.endTime.replace(/-/g, "/"));
        var curtime = new Date(res.synDate.replace(/-/g, "/"));
        this.compitionStatus = endtime.getTime()<curtime.getTime()?'4':this.compitionInfo.dataList.length==0?'3':'';
      },
      jumpTo(path,query){
        this.$router.push({path,query});
      },
      relocationTo(path,query){
        this.$router.replace({path,query});
      },
      /**
       *  @param {type} 触发的类型可选删除(del)或退出(quit)  
       */
      showConfirm(type){
        if(this.compitionStatus==1||this.compitionStatus==-1){
          return
        }
        this.confirmDelType = type;
        if(type=='del'){
          this.confirmconfig.msg = "是否确认删除该任务？"
          this.confirmconfig.btnText.confirm = "删除"      
        } else {          
          this.confirmconfig.msg = "是否确认退出该任务？"
          this.confirmconfig.btnText.confirm = "退出"
        }
        this.$refs.confirmDialog.showModal()    
      },
      async handleConfirm(choose){
        if(choose){
          if(this.confirmDelType=='del'){
            var res = await this.$req.get(API.quitJoinSubTask,{schoolCode:this.xxdm,evaluationId:this.task.id,userId:this.userId})
            if(res.resultCode==1){
              this.$toast(res.resultMessage);
              this.relocationTo('/SubTaskDetail',{componentName:'stuUncollected',subTaskId: this.task.id})
            }
          } else {
            var res = await this.$req.get(API.quitSubTask,{schoolCode:this.xxdm,evaluationId:this.task.id,userId:this.userId})
            if(res.resultCode==1){
              this.$toast(res.resultMessage);
              this.relocationTo('/SubTaskDetail',{componentName:'stuUncollected',subTaskId: this.task.id})
            }          
          }          
        }
        // quitJoinSubTask
      },
      submitTask(){
        if((this.compitionStatus==3||this.compitionStatus==0)&&this.canSubmit){
          this.jumpTo('/StuSubmitTask',{taskId: this.task.id,linkUserId:this.linkUserId})
        }        
      },
      indexGroupBy(arr,key){
        var res = [];
        arr.forEach(e=>{
          var ind = res.findIndex(r=>{
            if(key!='dayTab'){
              return r[0][key]==e[key]
            } else {
             return r[0][key].split(' ')[0] == e[key].split(' ')[0]; 
            }            
          });
          if(ind<0){
            res.push([e]);
          } else {
            res[ind].push(e);
          }
        })
        return res;
      }
    },
    watch:{
      task(val){     
        if(val&&this.role=='creator'){         
          this.getSubmitInfo();
        }
      },
      linkUserId(val){
        this.role=this.linkUserId?'participant':'creator'
        if(this.role=='participant'){
          this.getSubmitInfo();
        }        
      }
    },
    computed:{
      message(){
        if(this.task!=null){
          var description = this.task.summary;
          description = description.replace(/(\n)/g, "");  
          description = description.replace(/(\t)/g, "");  
          description = description.replace(/(\r)/g, "");  
          description = description.replace(/<\/?[^>]*>/g, "");  
          description = description.replace(/\s*/g, "");
          return description;           
        }
        return '';
      },
      compitionData(){
        var res = {
          rate: 0,
          submit: 0,
          should: 1,
        }
        res.should = this.task.stageCount*this.task.evaluationRuleFrequency.count;
        if(this.compitionInfo&&this.compitionInfo.dataList.length>0){
          // this.compitionStatus = this.compitionInfo.dataList.length==0?3:'';
          var type = this.task.evaluationRuleFrequency.type
          var maxCount = this.task.evaluationRuleFrequency.count
          var groupKeyWord = type == 2?'dayTab':type==4?'monthTab':'weekTab'          
          var arr = this.indexGroupBy(this.compitionInfo.dataList[0].itemInfoList, groupKeyWord);
          console.log(arr,208)
          arr.forEach(e=>{
            res.submit += (e.length>maxCount?maxCount:e.length);
          })          
          this.compitionStatus = this.compitionInfo.dataList[0].status==3&&this.compitionStatus!=''?this.compitionStatus:(this.compitionInfo.dataList[0].status+'');
        }
        res.should = res.should||1;
        res.rate = Math.round(res.submit/res.should)*100;
        return res;
      },
      canSubmit() {
        // 未提交过 或者 不限制提交次数
        var res = !this.compitionInfo || this.compitionInfo.dataList.length==0 || !this.task.totalSubmitCount;
        if(!res){
          // 提交后撤销了 = 未提交过
          res = this.compitionInfo.dataList[0].itemInfoList.length==0;
          if(!res){
            var originArr = this.compitionInfo.dataList[0].itemInfoList;
            var tempArr = [];
            originArr.forEach(e=>{
              // 筛选出本人当天的提交记录
              if(e.userId==this.userId&&e.dayTab.indexOf('今日')>=0){
                tempArr.push(e)
              }
            })
            // 本人当天提交次数小于最大提交数
            res = tempArr.length<this.task.totalSubmitCount;
          }
        }
        return res;
      }
    }
  }
</script>

<style scoped lang="less">
  .stuReceived{
    padding: 40px 32px;
    background-color: #fff;
    padding-bottom:100px;
    .taskInfo{
      &:nth-child(1){
        margin-bottom: 80px;        
      }
      .header{
        margin-bottom: 20px;
        .title{
          font-size:36px; 
          font-weight: 800;
          color: #292D33;
        }
        .more{
          font-size:28px;
          font-weight: 400;
          color: #AEB6C1;
          &::after{
            content: '';
            height: 26px;
            width: 15.8px;
            display: inline-block;
            position: relative;
            top: 2px;
            background-image: url(../../img/arrowdown.png);
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-position: 0 0;
            margin-left: 20px;
          }
        }
        .status{
          color: #FFB600;
          font-weight:bold;
          &.orange{
            color: #FF7B12;
          }
          &.green{
            color: #00CD86;
          }
        }
      }
      .content{
        font-size:28px;
        line-height:40px;
        font-weight:400;
        color: #AEB6C1;
        word-break: break-all;
      }
      .chart{
        margin-top: 40px;
      }
    }
    .actionbtns{
      justify-content: space-around;
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      .btn{
        width:280px;
        height:88px;
        border-radius:44px;
        font-size:30px;
        font-weight:400;
        color: #FFFFFF;
        line-height: 88px;
        text-align: center;
      }  
      .orange{
        background-color: #FF7B12;        
      }
      .blue{
        background-color: #33A5FF;        
      }
      .orangegrey{
        background:#ffdcc0;  
      }
      .grey{        
        background:rgba(192,227,255,1);     
      }
    }
  }
  .popupContent{
    padding: 40px 32px 0px;
    .header{
      margin-bottom: 40px;
      .title{
        font-size:36px;
        font-weight:800;
        color:rgba(38,38,39,1);
      }
      .arrowdown{
        background-image: url(../../img/arrowdown.png);
        background-repeat: no-repeat;
        background-size: 100% auto;
        background-position: 0 0;
        height: 26px;
        width: 15.59px;
        position: relative;
        display: inline-block;
        transform: rotate(90deg);
        margin-right: 10px;
      }
    }
    .taskdetail{
      font-size: 28px;
      max-height: 870px;
      overflow-y: auto;
      margin-bottom: 20px;
      word-break: break-all;
      /deep/ img{
        max-width: 100%;
        height: auto;
        margin: 40px 0;
      }
      /deep/ video{
        width: 100%;
        height: auto;
      }
    }
  }

</style>
