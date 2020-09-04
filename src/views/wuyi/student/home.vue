<template>
  <div class="warp scrollY" ref="viewBox">  
    <div class="top">
      <!--页面滚动时显示的头部-->
      <div class="header-fixed" v-if="!(opacity==0)" :style="{'opacity': opacity >= 1 ? 1 : opacity}">
        <div class="flex alignCenter">
          <div class="name flex_1 text-overflow">武义县职业技术学校<br>欢迎您，{{username}}同学</div>
          <div class="icon-box">
            <span class="schoolNews" @click="jumpOut"></span>
            <span class="wyrank" @click="renderRank"></span>
          </div>        
        </div>
      </div>      
      <!--页面未发生滚动时显示的头部-->
      <div class="top-info flex" :style="{'opacity': scrollTop == 0 ? 1 : (1 - opacity) <= 0 ? 0 : (1 - opacity)}">
        <div class="top-name">
          <p>武义县职业技术学校<br>欢迎您，{{username}}同学</p>
        </div>
        <div class="top-ph flex flex-column alignCenter" @click="jumpOut">
          <img src="../img/i3.png" />
          <p>学校新闻</p>
        </div>
        <div class="top-ph flex flex-column alignCenter" @click="renderRank">
          <img src="../img/i1.png" />
          <p>排行榜</p>
        </div>        
      </div>
      <div class="top-select flex alignCenter justifySpaceBetween">      
        <p>今天是{{now}} {{week}}</p>
        <p class="arrowdown" @click='openTimeChoice'><span class="bgBlack"></span><span class="text">{{xn.split('-')[xq == '02'?1:0]}} {{xq == '02' ? '春学期' : '秋学期'}}</span></p>
        <time-choice :isShowTab="false" :isWuyi="true" ref='timeChoice' @sure="sure"></time-choice>
      </div>
      <div class="top-score">
        <div class="totle flex alignCenter">
          <div class="totle-item">
            <p class="score">{{infoList.length!=0?homeInfo.myTotalScore:'--'}}</p>
            <p class="item-name">我的总分</p>
          </div>
          <div class="totle-item">
            <p class="score">{{infoList.length!=0?homeInfo.classAverageScore:'--'}}</p>
            <p class="item-name">班级平均分</p>
          </div>
          <div class="totle-item">
            <p class="score">{{infoList.length!=0?homeInfo.classHighestScore:'--'}}</p>
            <p class="item-name">班级最高分</p>
          </div>
        </div>
      </div>
    </div>
    <div class="content" :class="{'oth-content':userType<= 3}">
      <!-- <div class="dot"></div> -->
<!--      <div class="content-title flex">
        <p>学生成长综合素质报告单</p>
        <p @click='openTimeChoice'>{{xn}} {{xq == '02' ? '秋学期' : '春学期'}}</p>
        <time-choice :isShowTab="false" ref='timeChoice' @sure="sure"></time-choice>
      </div> -->
      <div v-if="infoList.length != 0">
<!--        <div class="totle flex alignCenter justifyCenter">
          <div class="totle-item">
            <p class="score">{{homeInfo.myTotalScore}}</p>
            <p class="item-name">我的总分</p>
          </div>
          <div class="totle-item">
            <p class="score">{{homeInfo.classAverageScore}}</p>
            <p class="item-name">班级平均分</p>
          </div>
          <div class="totle-item">
            <p class="score">{{homeInfo.classHighestScore }}</p>
            <p class="item-name">班级最高分</p>
          </div>
        </div> -->
        <div class="title">
          维度统计图
        </div>
        <div class="chart">
          <lineChart :chartData="infoList"></lineChart>
        </div>
        <div class="title">
          我的报告单<br>
          <span class="tip">提示：风采相片得分为附加分，不计入维度总分</span>
        </div>
        <div class="class-warp" >
          <div v-for="(item,index) in infoList" :key="index">
            <div class="class-item" :class="`class-item${index+1}`" @click="renderTo(item)">
              <div class="item-top">
                <p>{{item.dimensionName}}（{{item.dimensionTotalScore}}分{{item.dimensionName.indexOf('个性评价')>=0?',不记入总分':''}}）</p>
                <img  :src="require('../img/q'+(index+1)+'.png')"/>
                
              </div>
              <div class="progress">
                <span class="progress-bar">
                  <span
                    class="progress-line" 
                    :style="{'width':item.dimensionMaxScore!=0?((item.dimensionTotalScore/item.dimensionMaxScore)*100+'%'):0}"
                    >
                  </span>
                </span>
                <span>{{item.dimensionMaxScore!=0?item.dimensionTotalScore:0}}/{{item.dimensionMaxScore}}</span>
              </div>
              <div class="flex item-child-warp">
                <div class="item-child-comm" :class="'item-child'+(index+1)+(i.evaluationName.indexOf('自主任务')>=0?' item-child-special':'')" v-for="(i,s) in item.evaluationStatisticsVos" :key="s">
                  {{i.evaluationName.indexOf('自主任务')>=0?'风采相片':i.evaluationName}}<br>（{{i.evaluationTotalScore}}分）
                </div>
              </div>
            </div>

          
          </div>
          <div class="class-item9 class-item">
            <div class="item-top">
              <p>班主任评语</p>
              <img src="../img/i11.png"/>
            </div>
            <p class="item8-p">{{homeInfo.classTeacherRemark == null || homeInfo.classTeacherRemark == '' ? '无' : homeInfo.classTeacherRemark}}</p>
          </div>
        </div>
      </div>

      <div v-else>
        <img src="../img/empty.png" class="empty"/>
        <p class="emptyText">报告单暂无内容</p>
      </div>

    </div>
  </div>
  
</template>
<script>
  import TimeChoice from "@/components/timeChoice/timeChoice.vue";
  import {wuyiApi} from '@/utils/api'
  import lineChart from './lineChart'
export default {
  data(){
    return{
      username:'',
      now:'',
      week:'',
      xn:this.$cookie.get("schoolYear"),
      xq:this.$cookie.get("term"),
      homeInfo:'',
      infoList:[],
      tempMap:new Map(),
      userType:this.$cookie.get("userType"),
      studentCode:'',
      scrollTop: 0,
    }
  },
  components: {
    TimeChoice,
    lineChart
  },
  activated() {
    this.scrollTop = 0;
    if(this.userType<= 3){//老师
      this.infoList = [];
      this.username = this.$route.query.studentName;
      this.studentCode = this.$route.query.studentCode;
      this.getHomePageStatistics();
      this.getNow();
    }
  },
  watch:{
    $route (to, from) {
      if(to.path == '/zhsz/home') {
      this.scrollTop = 0;
      this.getHomePageStatistics();        
      }
    }
  },
  mounted() {
    
    if(this.userType > 3){ //学生
      
      this.username=this.$cookie.get("name");
      this.studentCode = this.$cookie.get("userId");
      this.getHomePageStatistics();
      this.getNow();      
    } 
    this._onScroll();
  },
  methods: {
    
    _onScroll() {
      this.$refs.viewBox.addEventListener("scroll", () => {
        let scrollTop = this.$refs.viewBox.scrollTop;
        this.scrollTop = scrollTop;
      });
    },
    renderTo(item){
      var taskScore = 0;
      var task = item.evaluationStatisticsVos.find((e)=>{return e.evaluationName.indexOf('自主任务')>=0});
      if(task){
        taskScore = task.evaluationTotalScore
      }      
      if(item.dimensionName == '文' || item.dimensionName == '技'){
        this.$router.push({path:"/wuyi/wenDetail",query:{name:item.dimensionName,score:item.dimensionTotalScore,taskScore,id:item.dimensionCode,studentCode:this.studentCode}})
      }else{
        this.$router.push({path:"/wuyi/liDetail",query:{name:item.dimensionName,score:item.dimensionTotalScore,taskScore,id:item.dimensionCode,studentCode:this.studentCode}})
      }
    },
    
    renderRank(){
      this.$router.push({path:"/wuyi/ranking",query:{studentCode:this.studentCode}})
    },
    // 跳转到学校新闻链接
    jumpOut(){
      window.location.href = 'https://mp.weixin.qq.com/mp/homepage?__biz=MzU2NzYzMDE0OQ%3D%3D&hid=1&sn=3075ae5fdc89fc3c976e3e1636ebf419&scene=18'
    },
    //获取当前月和日和周
    getNow(){
      let a = ["日", "一", "二", "三", "四", "五", "六"];
      let date = new Date();
      this.now = (date.getMonth()+1) + '月' + date.getDate() + '日';
      let tempweek = date.getDay();  
      this.week = "星期"+ a[tempweek];
    },
    openTimeChoice() {
      this.$refs.timeChoice._show();
    },
    sure(a) {
      this.xn = a.xn;
      this.xq = a.xq;
      this.infoList = [];
      this.tempMap = new Map();
      this.getHomePageStatistics();
    },
    getHomePageStatistics(){
      this.$indicator.open("加载中...");
      let data ={
        schoolYear:this.xn,
        term:this.xq,
        userId:this.studentCode
      }
      this.$req.get(wuyiApi.getHomePageStatistics, data).then(res=>{
        if(res.resultCode == 1){
          this.homeInfo = res.value;
          // 根据sortNumber来排序
          this.homeInfo.dimensionStatisticsVoList.sort((a,b)=>{
            return Number(a.sortNumber)-Number(b.sortNumber);
          })
          this.infoList = this.homeInfo.dimensionStatisticsVoList
          // this.homeInfo.dimensionStatisticsVoList.forEach((e,i) => {
          //   this.tempMap.set(e.dimensionName, i)
          // });
          // let temparr = this.homeInfo.dimensionStatisticsVoList;
          // this.infoList.push(temparr[this.tempMap.get('德')],temparr[this.tempMap.get('文')],temparr[this.tempMap.get('技')],temparr[this.tempMap.get('习')],temparr[this.tempMap.get('艺')],temparr[this.tempMap.get('活动')],temparr[this.tempMap.get('奖')])
        }
      })
    }
  },
  computed: {    
    opacity() {
      let new_opacity = 0;
      new_opacity = ((this.scrollTop > 40 ? this.scrollTop - 40 : 0) / 100).toFixed(2);
      return new_opacity;
    },
  },
}
</script>
<style lang="less" scoped>
  
  .warp{
    width: 100%;
    background-color: #fff;
    .top{
      width: 100%;
      height: 482px;
      background: url('../img/bg1_1.png') no-repeat;
      background-size: 100% auto;
      padding: 32px;
      box-sizing: border-box;
      position: relative;
      background-color: #fff;      
      .header-fixed {
        position: fixed;
        z-index: 1005;
        top: 0;
        left: 0;
        width: 100%;
        // height: 286px;
        background-color: #ffffff;
        .flex{
          height: 178px;
        }
        .icon-box {
          padding-top: 0;
          margin-right: 32px;
          .schoolNews {
            height: 58px;
            width: 58px;
            color: #262727;
            background: url('../img/school_news2.png') no-repeat center top;
            background-size: 58px auto;
            display: inline-block;
          }
          .wyrank {
            height: 58px;
            width: 58px;
            color: #262727;
            background: url('../img/wy_rank2.png') no-repeat center top;
            background-size: 58px auto;
            display: inline-block;
            margin-left: 32px;
          }
        }
        .name{
          color: #262727;
          font-size: 40px;
          font-weight: 600;
          margin-left: 32px;
        }
      }
      .top-name{
        flex: 4;
        // width: 70%;
        p:nth-child(1){
          font-size:42px;
          font-weight:800;
          line-height:62px;
          color:rgba(255,255,255,1);
        }
        p:nth-child(2){
          font-size:28px;
          color:rgba(255,255,255,1);
          margin-top:40px;
        }
      }
      .top-ph{
        flex: 1;
        p{
          font-size:28px;
          color:rgba(255,255,255,1);
        }
        img{
          height: 58px;
          width: 58px;
          // margin-left:12px; 
        }
      }
      .top-select{
        font-size:28px;
        color:rgba(255,255,255,1);
        margin-top:40px;
        margin-right: 46px;
        p:nth-child(2){
          font-size:24px;
          position: relative;
        }
        .arrowdown::after{
          content: '';
          height: 15.59px;
          width: 26px;
          background: url(../img/d.png) no-repeat;
          background-size: 100% auto;
          position: absolute;
          top: 10px;
          right: -40px;
        }
        .bgBlack{
          // content: '';
          height:56px;
          width: calc(100% + 30px + 80px);
          background:rgba(183,111,19,0.3);
          border-radius:28px 0px 0px 28px;
          position: absolute;
          top: -32%;
          right: -80px;
          &+.text{
            position: relative;
          }
        }
      }
      .top-score{
        .totle{
          background: url('../img/bg4.png') no-repeat;
          width: 100%;
          height: 214px;
          background-size: 100%;
          position: absolute;
          bottom: -2px;
          left: 0px;
          justify-content: space-around;
          padding: 0 32px;
          box-sizing: border-box;
          .totle-item{
            width: 22%;
            position: relative;
            height: 132px;
            margin-left: 16px;
            margin-top: 20px;
            text-align: center;
            .score{
              font-size:46px;
              font-family:ALIBABA Font;
              font-weight:bold;
              color:#FFB600;
            }
            .item-name{
              font-size:30px;
              font-family:Microsoft YaHei;
              font-weight:400;
              color:#262727;
              margin-top: 18px;
            }
          }
          
        }        
      }
    }
    .content{
      width: 100%;
      background-color: #fff;
      // border-radius:40px 40px 0px 0px;
      // margin-top:-40px;
      height:calc(100vh - 520px - 116px);
      // padding-bottom: 500px;
      // overflow-y:scroll;
      .title{
        font-size:36px;
        font-weight:800;
        color:rgba(38,38,38,1);
        margin-left: 32px;
        .tip{
          font-size:28px;
          font-weight: 400;
          margin-top: 20px;
          display: inline-block;
          color:rgba(128,128,128,1);
        }
        &+.chart{
          height: 412px;
          width: 686px;
          background:rgba(255,247,242,1);
          border-radius:10px;
          margin: 0 auto;
          margin-top: 20px;
          margin-bottom: 40px;
        }
      }
      .dot{
        width: 42px;
        height: 8px;
        background-color: #E2E4E6;
        border-radius: 2px;
        margin:8px auto;
      }
      .content-title{
        p:nth-child(1){
          font-size:32px;
          font-weight:800;
          color:rgba(38,38,38,1);
          margin-top:20px;
          margin-right:50px;
          margin-left: 26px;
        }
        p:nth-child(2){
          font-size:30px;
          font-weight:800;
          color:#33A5FF;
          margin-top:10px;
          position: relative;
          margin-top:20px;
        }
        p:nth-child(2)::after{
          content: "";
          position: absolute;
          top: -30px;
          right: -68px;
          margin: 40px;
          border-right:1px solid #757575;
          border-bottom: 1px solid #757575;
          width: 16px;
          height: 16px;
          transform: rotate(-45deg);
          -webkit-transform: rotate(-45deg);
        }
      }
      .totle{
        background: url('../img/bg2.png');
        width: 100%;
        height: 340px;
        background-size: 100%;
        .totle-item{
          width: 22%;
          position: relative;
          height: 150px;
          margin-left: 16px;
          text-align: center;
          .score{
            font-size:46px;
            font-family:ALIBABA Font;
            font-weight:bold;
            color:rgba(255,255,255,1);
          }
          .item-name{
            font-size:30px;
            font-family:Microsoft YaHei;
            font-weight:400;
            color:rgba(255,255,255,1);
          }
        }
        
      }
      .class-warp{
        // padding-bottom: 160px;
      }
      .class-item1{
        background:rgba(255,243,243,1);
        .progress-line{
          background: #FF5656!important;
        }
      }
      .class-item2{
        background:rgba(255,240,223,1);
        .progress-line{
          background: #FF9A27!important;
        }
      }
      .class-item3{
        background:rgba(255,253,242,1);
        .progress-line{
          background: #FFD91C!important;
        }
      }
      .class-item4{
        background:rgba(235,248,237,1);
        .progress-line{
          background: #3CD854!important;
        }
      }
      .class-item5{
        background:rgba(235,248,243,1);
        .progress-line{
          background: #3AD298!important;
        }
      }
      .class-item6{
        background:rgba(235,246,255,1);
        .progress-line{
          background: #40A3F5!important;
        }
      }
      .class-item7{
        background:rgba(242,235,255,1);
        .progress-line{
          background: #9668EB!important;
        }
      }
      .class-item8{
        background:rgba(235,239,245,1);
        .progress-line{
          background: #8096B7!important;
        }
      }
      .class-item9{
        background:rgba(255,247,242,1);
        .progress-line{
          background-color: #FF5656;
        }
        
      }
      .class-item{
        width: 86%;
        padding:3%;
        border-radius:20px;
        margin:27px auto;
        position: relative;
        .item-top{
          p{
            font-size: 40px;
            font-weight: 600;
            line-height: 100px;
            z-index: 2;
            position: relative;
          }
          img{
            position: absolute;
            top:10px;
            right:20px;
            
          }
        }
        .progress{
          font-size:28px;
          font-weight:400;
          color:rgba(41,45,51,1);
          .progress-bar{
            display: inline-block;
            background:rgba(255,255,255,1);
            border-radius:8px;
            width:360px;
            height:16px;
            position: relative;
            top: -3px;
            left: 6px;
            margin-right: 20px;
            overflow: hidden;
            .progress-line{
              content: '';
              position: absolute;
              left: 0;
              width: 80%;
              height: 100%;
              background:linear-gradient(270deg,rgba(255,182,0,1) 0%,rgba(255,207,88,1) 100%);
              border-radius:8px;
            }
          }
        }
      }
      .item-child-warp{
        flex-wrap: wrap;
        .item-child-comm{
          width:200px;
          height:84px;
          border-radius:20px;
          font-size:28px;
          font-family:PingFang SC;
          font-weight:400;
          margin-right: 6px;
          margin-left:8px;
          z-index: 3;
          text-align: center;
          padding-top:16px;
          margin-bottom:10px;
          margin-top:10px;
        }
        .item-child1{
          background:rgba(255,203,203,1);
          color:rgba(255,83,83,1);
          &.item-child-special{
            color: #fff;
            background: url(../img/fc1.png) no-repeat;
            background-size: 100% 100%;
          }
        }
        .item-child2{
          background:rgba(255,215,168,1);
          color:#EE8000;
          &.item-child-special{
            color: #fff;
            background: url(../img/fc2.png) no-repeat;
            background-size: 100% 100%;
          }
        }
        .item-child3{
          background:rgba(255,242,177,1);
          color:#CEAB00;
          &.item-child-special{
            color: #fff;
            background: url(../img/fc3.png) no-repeat;
            background-size: 100% 100%;
          }
        }
        .item-child4{
          background:rgba(192,243,190,1);
          color:#00CD1B;
          &.item-child-special{
            color: #fff;
            background: url(../img/fc4.png) no-repeat;
            background-size: 100% 100%;
          }
        }
        .item-child5{
          background:rgba(190,243,225,1);
          color:#00CD86;
          &.item-child-special{
            color: #fff;
            background: url(../img/fc5.png) no-repeat;
            background-size: 100% 100%;
          }
        }
        .item-child6{
          background:rgba(186,224,255,1);
          color:#33A5FF;
          &.item-child-special{
            color: #fff;
            background: url(../img/fc6.png) no-repeat;
            background-size: 100% 100%;
          }
        }
        .item-child7{
          background:rgba(231,200,255,1);
          color:#8800FF;
          &.item-child-special{
            color: #fff;
            background: url(../img/fc7.png) no-repeat;
            background-size: 100% 100%;
          }
        }
        .item-child8{
          background:rgba(191,203,219,1);
          color:#292D33;
          &.item-child-special{
            color: #fff;
            background: url(../img/fc8.png) no-repeat;
            background-size: 100% 100%;
          }
        }
        .item-child9{
          background:rgba(255,247,242,1);
          color:#000;
        }
        
      }
    }
    .oth-content{
      height: calc(100vh - 520px);
    }
  }
  .warp::-webkit-scrollbar{
    display:none
  }
  .item8-p{
    font-size: 32px;
    margin-right: 140px;
  }
  .empty{
    width: 90%;
    margin-top:100px;
    margin-left:40px;
  }
  .emptyText{
    font-size: 36px;
    text-align: center;
    color: #BDBEBF;
  }
</style>