<template>
  <div class="warp">
   <div class="xueqi" @click='openTimeChoice'>{{xn.split('-')[xq == '02'?0:1]}} {{xq=='02' ? '春学期' :'秋学期'}}</div>
   <time-choice :isShowTab="false" :isWuyi="true" ref='timeChoice' @sure="sure"></time-choice>
   <div class="flex justifySpaceBetween alignCenter tab">
     <div class="tab-p">
       <p>{{name}}</p>
       <p>总分：{{score}}&#8195;附加分：{{taskScore}}</p>
     </div>
     <div>
       <img src="../img/d1.png" />
     </div>
   </div>
    <div v-if="scoreInfo.length == 0">
      <img src="../img/empty.png" class="empty"/>
      <p class="emptyText">暂无考试数据</p>
    </div>
    <div v-else>
      <div class="class-list flex">
        <div class="class-item" v-for="(item,index) in scoreInfo" :key="index" :class="{'activeP':index == current,'borderRight':index%3 != 2 && index != scoreInfo.length-1 && pjList.length != 0}" @click="getScore(index)">{{item.courseName}}</div>

        <div v-for="(s,i) in pjList" :key="i+'1'" class="class-item" :class="{'borderRight':i%3 != 2 && i != pjList.length-1}" @click="renderPj(s)">{{s.name}}</div>
      </div>

      <div class="content">
        <div class="content-top">
          <div class="top1 flex justifySpaceBetween">
            <p v-if="scoreInfo[current] != undefined">{{scoreInfo[current].courseName}}</p>
            <div class="flex top1-right" @click="show=true">
              <img src="../img/d2.png"/>
              <p>评分标准</p>
            </div>
          </div>
          <div class="top2 flex justifySpaceBetween">
              <p v-if="scoreInfo[current] != undefined">我的综合分：{{scoreInfo[current].complexScore}}</p>
          </div>
          <div class="progressWarp">
            <van-progress 
              v-if="scoreInfo[current] != undefined"
              :percentage="scoreInfo[current].zhAverage"
              stroke-width="10"
              :show-pivot="false"
              color="linear-gradient(to left, #FFB600, #FF8800)"
            />
            <img v-if="scoreInfo[current] != undefined" :style="{left:scoreInfo[current].progressLeft+'rem'}" src="../img/line.png">
          </div>
            

            <p class="class-score" v-if="scoreInfo[current] != undefined">班级平均分{{scoreInfo[current].classComplexAverageScore}}</p>
        </div>
        <div class="content-bottom" v-if="scoreInfo[current] != undefined">
          <div class="bottom-item" v-for="(item,index) in scoreInfo[current].examList" :key="index">
            <div class="flex justifySpaceBetween item-name">
              <p>
                {{item.examName}}
              </p>
              <p v-if="item.scoreStatus == 1">{{item.score}}分</p>
              <p v-else>Q</p>
            </div>
            <van-progress
              v-if="item.scoreStatus == 1"
              :percentage="item.score/item.fullScore*100"
              stroke-width="10"
              :show-pivot="false"
              color="linear-gradient(to left, #33A5FF, #6821E5)"
            />
            <van-progress
              v-else
              :percentage="0"
              stroke-width="10"
              :show-pivot="false"
              color="linear-gradient(to left, #33A5FF, #6821E5)"
            />
          </div>

         
        </div>
      </div>
    </div>
    <van-popup position="bottom" :round="true" :closeable="true" v-model="show">
      <p class="pop-title">内容</p>
      <p class="pop-p1">综合分=平均分-缺考扣分</p>
      <p class="pop-p2">平均分=所有参加的考试的总分除以参加的次数</p>
      <p class="pop-p2">缺考扣分=（应考次数-实考次数）x10</p>
    </van-popup>
  </div>
</template>
<script>
  import TimeChoice from "@/components/timeChoice/timeChoice.vue";
  import {wuyiApi,PjApi} from '@/utils/api'
export default {
  components:{
    TimeChoice
  },
  data(){
    return{
      show: false,
      xn:this.$cookie.get("schoolYear"),
      xq:this.$cookie.get("term"),
      scoreInfo:[],//科目及成绩数组
      current:'0',//当前科目的下标
      name:'',
      score: this.$route.query.score,
      pjList:[],//评价项数组
      taskScore: 0,
    }
  },
  mounted() {
  },
  activated() {
    this.xn = this.$cookie.get("schoolYear");
    this.xq = this.$cookie.get("term");
    document.title = this.$route.query.name
    this.name = this.$route.query.name;
    this.score = this.$route.query.score;
    this.taskScore = this.$route.query.taskScore;
    this.current = '0';
    this.show = false;
    this.pjList = [];
    this.getKemu();
    this.getPj();
    
  },
  methods: {
    showPopup() {
      this.show = true;
    },
    openTimeChoice() {
      this.$refs.timeChoice._show();
    },
    sure(a) {
      this.xn = a.xn;
      this.xq = a.xq;
      this.current = '0';
      this.scoreInfo = [];
      this.getKemu();
    },
    /* 获取科目及成绩 */
    getKemu(){
      let data ={
        schoolYear:this.xn,
        term:this.xq,
      }
      if(this.$cookie.get("userType")<= 3){//老师
        data['userId'] = this.$route.query.studentCode
      }
      let that = this;
      that.scoreInfo = [];
      that.$req.get(wuyiApi.getScoreInfo, data).then(res=>{
        if(res.resultCode == 1){
          if(res.value == null){
            return;
          }
          res.value.courseScoreList.forEach(item=>{
            if(item.courseTypeName == this.name){
              item.zhAverage = (item.complexScore/item.examCourseTotalAverageScore)*100;
              item.progressLeft = (item.classComplexAverageScore/item.examCourseTotalAverageScore)*600/75
              that.scoreInfo.push(item)
            }
          })
        }
      })
    },
    /* 获取响应的分数 */
    getScore(index){
      this.current = index
    },
    /* 获取评价项列表 */
    getPj(){
      let data ={
        type:'2',
        dimensionId:this.$route.query.id,
        taskType:1
      }
      let that = this;
      that.scoreInfo = [];
      that.$req.get(PjApi.list, data).then(res=>{
        if(res.resultCode == 1){
          if(res.value == null){
            return;
          }
          that.pjList = res.value
        }
      })
    },
    /* 跳转到自主任务 */
    renderPj(item){
      if(this.$cookie.get("userType")<= 3){//老师
        return;
      }
      this.$router.push({path:"/stu/taskDetail",query:{id:item.id,title:item.name}})
    }
  }
}
</script>
<style lang="less" scoped>
  .warp{
    width: 100%;
    height: 100%;
    background:linear-gradient(180deg,rgba(162,81,255,1) 0%,rgba(49,44,209,1) 100%);
    display: block;
    position: relative;
    overflow-x: hidden;
    overflow-y: scroll;
    .xueqi{
      width: 240px;
      margin:30px auto;
      font-size: 24px;
      color:#fff;
      position: relative;
    }
    .xueqi::after{
      content: "";
      position: absolute;
      top: -40px;
      right: -36px;
      margin: 40px;
      border-right:1px solid #fff;
      border-bottom: 1px solid #fff;
      width: 20px;
      height: 20px;
      transform: rotate(45deg);
      -webkit-transform: rotate(45deg);
    }
    .tab{
      padding: 32px;
      .tab-p{
        font-weight: 500;
        color:#fff;
        p:nth-child(1){
          font-size: 48px;
          position: relative;
        }
        p:nth-child(2){
          margin-top: 20px;
          font-size: 40px;
        }
      }
    }
    .class-list{
      flex-wrap: wrap;
      .class-item{
        width: 33%;
        color:rgba(255,255,255,0.3);
        text-align: center;
        margin-bottom:40px;
        font-size: 36px;
      }
      .activeP{
        color:rgba(255,255,255,1);
      }
      .borderRight{
        border-right:1px solid rgba(255,255,255,0.3);
      }
    }
    .content{
      width: 90%;
      padding:3%;
      background:rgba(255,255,255,1);
      border-radius:20px;
      margin:0 auto;
      margin-bottom: 120px;
      .content-top{
        width:646px;
        height:300px;
        background:rgba(255,255,255,1);
        box-shadow:0px 8px 30px rgba(86,104,119,0.26);
        border-radius:20px;
        margin:0 auto;
        .top1{
          p:nth-child(1){
            color:#262626;
            font-size: 36px;
            font-weight: 800;
            padding: 20px;
          }
          .top1-right{
            padding: 20px;
            img{
              width: 32px;
              height: 32px;
            }
            p{
              font-size:28px;
              color:rgba(150,152,153,1);
              margin-left: 10px;
            }
          }
        }
        .top2{
          p{
            font-size:34px;
            font-weight:600;
            line-height:64px;
            color:rgba(38,39,39,1);
            padding:0 20px;
          }
        }
       
        .class-score{
          width:240px;
          height:44px;
          background:rgba(239,241,243,1);
          border-radius:22px;
          margin:40px auto;
          color:rgba(38,39,39,1);
          font-size: 24px;
          text-align: center;
          line-height: 44px;
        }
      }
      .content-bottom{
        margin:40px;
        .bottom-item{
          margin-bottom:40px;
          p:nth-child(1){
            font-size:28px;
            line-height:80px;
            color:rgba(38,39,39,1);
          }
          p:nth-child(2){
            font-size:28px;
            line-height:80px;
            color:rgba(51,165,255,1);
          }
        }
      }
    }
    .pop-title{
      font-size:36px;
      font-weight:800;
      line-height:64px;
      color:rgba(38,38,39,1);
      text-align: center;
    }
    .pop-p1{
      font-size:36px;
      font-weight:800;
      line-height:90px;
      color:rgba(38,38,38,1);
      margin-left: 40px;
    }
    .pop-p2{
      font-size:28px;
      font-weight:400;
      margin-bottom:40px;
      color:rgba(150,152,153,1);
      margin-left: 40px;
    }
    .progressWarp{
      position: relative;
      width: 600px;
      margin-left: 20px;
      img{
        position: absolute;
        top: -8px;
        left: 0px;
        width: 4px;
        height: 40px;
      }
    }
  }
  .empty{
    width: 100%;
    margin-top:50px;
  }
  .emptyText{
    font-size: 36px;
    text-align: center;
    color: #fff;
  }
 
  /deep/ .van-grogress{
    border-radius: 10px;
  }
</style> 