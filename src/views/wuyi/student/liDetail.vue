<template>
  <div class="warp">
    <div class="top">
      <div class="xueqi" @click='openTimeChoice'>{{title}}</div>
      <time-choice ref='timeChoice' :isWuyi="true" @sure="sure"></time-choice>
        <div class="flex justifySpaceBetween tab">
          <p>时光相册{{'-'+$route.query.name}}</p>
          <img src="../img/d3.png"/>
        </div> 
    </div>
    <div class="content">
      <div class="dot"></div>
      <div class="content-title flex" @click="showChoice">
        <p class="type">{{typeName}}</p>
        <img src="../img/icon1.png"/>
        <div class="scores">
          总分：<span class="border yellow">{{score}}</span>&#8195;&#8195;
          附加分：<span class="border">{{taskScore}}</span>
        </div>
      </div>


      <div class="item-warp" ref="viewBox">
        <div class="item flex" v-for="(item,index) in dataList" :key="index">
          <div class="left">
            <p class="day">{{item.day}}</p>
            <p class="month">{{item.month}}月</p>
            <div :style="{height: item.height+'px'}" v-if="index != dataList.length -1" class="line"></div>
          </div>
          <div class="right">
            <div class="flex justifySpaceBetween">
              <div class="flex right-top">
                <div class="tag flex">
                  <div class="commTagLine" :class="{'greenBg':item.type == 1,'yellowBg':item.type == 2}"></div>
                  <div class="commTagContent" :class="{'green':item.type == 1,'yellow':item.type == 2}">{{item.type == 1 ?'教师评价':'学生任务'}}</div>
                </div>
                <div class="tag flex" v-if="">
                  <div 
                    class="commTagLine purpleBg"
                    :class="{
                      'greyBg':item.medalDimensionIdName.indexOf('个性评价')>=0,
                      'redBg':item.medalDimensionIdName.indexOf('德')>=0,
                      'red1Bg':item.medalDimensionIdName.indexOf('文')>=0,
                      'artGreenBg':item.medalDimensionIdName.indexOf('艺')>=0,
                      'blueBg':item.medalDimensionIdName.indexOf('活动')>=0,
                      }"></div>
                  <div class="commTagContent">{{item.medalDimensionIdName}}-{{item.evaluationName}}</div>
                </div>
<!--                <div class="tag flex" v-else-if="item.medalDimensionIdName.indexOf('德')>=0">
                  <div class="commTagLine greyBg"></div>
                  <div class="commTagContent grey">{{item.medalDimensionIdName}}-{{item.evaluationName}}</div>
                </div>
                <div class="tag flex" v-else>
                  <div class="commTagLine purpleBg"></div>
                  <div class="commTagContent purple">{{item.medalDimensionIdName}}-{{item.evaluationName}}</div>
                </div> -->
              </div>
              <p class="time">{{item.time}}</p>
            </div>
            <div v-for="(s,i) in item.itemInfoList" :key="i" class="right-item">
              <div class="flex right-p justifySpaceBetween">
       <!--         <p v-if="item.rewardType != 4 && item.rewardType != 6">{{s.content}}</p>
                <p v-else>扣分缘由请咨询班主任</p> -->
                <p>{{s.content}}</p>
                <p v-if="s.status == 0">审核中</p>
                <p v-else-if="item.rewardType == 3">+{{s.score}}</p>
                <p v-else-if="item.rewardType == 5">+{{s.medal}}</p>
                <p v-else-if="item.rewardType == 4">{{s.score}}</p>
                <p v-else-if="item.rewardType == 6">{{s.medal}}</p>
              </div>
              <div class="img-warp flex justifySpaceBetween" v-if="item.rewardType != 4 && item.rewardType != 6">
                <img @click="preImage(a.absolutePath)" v-for="(a,b) in s.fileInfoVOS" :key="a.absolutePath+b" :src="a.absolutePath"/> 
              </div>
              <div class="right-bottom flex justifySpaceBetween">
                <p>评价老师:{{item.evaluatorName}}老师</p>
                <p v-show="item.deadLine && item.effectStatus == 0">{{item.deadLine | downTime}}天后生效</p>
              </div>
            </div>
            
          </div>
        </div>
        <!--底部判断是加载图标还是提示“全部加载”-->
        <div class="wait-list-loading" v-show="queryLoading" v-if="dataList.length > 10">
          <span v-show="moreLoading&&!allLoaded">加载中...</span>
          <span v-show="allLoaded">已全部加载</span>
        </div>
        <div class="emptyText" v-show="dataList.length==0">暂无数据</div>
      </div>
    </div>
    <v-choice :teaList="tea_list" :stuList="stu_list" @surePopup="surePopup" ref="choice"></v-choice>
  </div>
</template>
<script>
import TimeChoice from "@/components/timeChoice/timeChoice.vue";
import Choice from "../components/choicePopup.vue";
import {PjApi} from '@/utils/api'
import { ImagePreview } from 'vant';
export default {
  components:{
    TimeChoice,
    'v-choice': Choice
  },
  data(){
    return{
      title:'',
      show:false,
      radioVal:[],
      type:'1,2',
      page:1,
      endTime:this.$cookie.get("endTime"),
      startTime:this.$cookie.get("startTime"),
      evaluationIdList:null,
      tea_list: [],
      stu_list: [],
      dataList:[],
      queryLoading: true,
      moreLoading: false,
      allLoaded: false,
      typeName:'全部',
      score: 0,
      taskScore: 0,
    }
  },

  mounted() {
   
  },
  activated() {
    let xq =  this.$cookie.get("term") == '01' ? '秋学期' : '春学期';
    this.title = this.$cookie.get("schoolYear").split('-')[this.$cookie.get("term") == '01'?0:1] + ' ' + xq;
    this.page = 1;
    this.tea_list= [];
    this.stu_list= [];
    this.dataList=[];
    this.evaluationIdList = null;
    document.title = this.$route.query.name;
    this.score = this.$route.query.score;
    this.taskScore = this.$route.query.taskScore;
    this.typeName='全部';
    this.type='1,2';
    this.endTime = this.$cookie.get("endTime");
    this.startTime = this.$cookie.get("startTime");
    Promise.all([this.getPjxList(1),this.getPjxList(2)]).then(()=>{
     
      this.loadMore();
      this.getList();
    })
    
    
  },
  methods: {
    showChoice() {
      this.$nextTick(() => {
        this.$refs.choice._show();
      })
    },
    
    openTimeChoice() {
      this.$refs.timeChoice._show();
    },
    //日期帅选
    sure(a) {
      this.allLoaded = false;
      if(a.type == 3){//按学期
        this.endTime = a.gzjssj;
        this.startTime = a.gzkssj;
        let xq =  a.xq == '01' ? '秋学期' : '春学期';
        this.title = a.xn.split('-')[a.xq == '02'?1:0] + ' ' + xq
      }else if(a.type == 2){//按月
        let month = a.month.split('/')[1];
        this.startTime = a.month.split('/')[0]+'-' + a.month.split('/')[1] + '-01 00:00:00';
        this.endTime = a.month.split('/')[0]+'-' + a.month.split('/')[1] + '-' + this.getLastDay(a.month.split('/')[0],a.month.split('/')[1]) + ' 00:00:00';
        this.title = a.month
      }else{//按周
        this.startTime = a.startTime;
        this.endTime = a.endTime;
        this.title = a.weekTime
      }
      this.page = 1;
      this.dataList = [];
      this.getList();
    },
    getList(){
      let data={
        type:this.type,
        dimensionId:this.$route.query.id,
        endTime :this.endTime,
        startTime :this.startTime,
        limit:30,
        page :this.page,
        schoolCode:this.$cookie.get("xxdm"),
        evaluationId:this.evaluationIdList,
        userId:this.$route.query.studentCode
      }
      this.$indicator.open("加载中....");
      this.$req.post(PjApi.getPjxRecordList, data).then(res=>{
        if(res.resultCode == 1){
          if(res.value == null || res.value.length == 0){
            return;
          }
          this.dataList = [...this.dataList,...res.value.dataList];
          // this.list = this.list.concat(value.dataList).concat(value.dataList).concat(value.dataList).concat(value.dataList);
          
          if (res.value.dataList.length >= 30) {
            this.page++;
          } else {
            this.allLoaded = true;
          }
          this.dataList.forEach(item=>{
            let a = item.createTime.split(' ');
            item.month = a[0].split('-')[1];
            item.day = a[0].split('-')[2];
            item.time = a[1].split(':')[0]+ ':' + a[1].split(':')[1];
            item.height = item.itemInfoList.length * 120;
          })
        }
      })
    },
    /*
      滚动加载更多
    */
    loadMore() {
      this.$refs.viewBox.addEventListener('scroll', () => {
        var scrollTop = this.$refs.viewBox.scrollTop;
        this.scrollTop = scrollTop;
        var windowHeight = this.$refs.viewBox.clientHeight;
        var scrollHeight = this.$refs.viewBox.scrollHeight;
        if (scrollTop + windowHeight >= scrollHeight) {
          this.moreLoading = true;
          if (this.allLoaded) {
            return
          }
          this.getList()
        }
      })
    },
    /* 获取选中的评价项 */
    surePopup(a){
      this.allLoaded = false;
      if(a.length == (this.tea_list.length + this.stu_list.length)){
        this.evaluationIdList = null
        this.type = '1,2';
        this.typeName = "全部"
      }else{
        this.evaluationIdList = '';
        if(a == []) return;
        let teacher = false,student = false;
        a.forEach(e => {
          if(e.type == 1){
            teacher = true
          }else if(e.type == 2){
            student = true
          }
          this.evaluationIdList += e.id + ','
        });
        
        if(student == true && teacher == true){
          this.type = '1,2';
          this.typeName = "全部"
        }else if(student == true && teacher == false){
          this.type = '2';
          this.typeName = "学生任务"
        }else if(student == false && teacher == true){
          this.type = '1';
          this.typeName = "教师评价"
        }
       }
      this.page = 1;
      this.dataList = [];
      this.getList()
    },
    /* 获取月份最后一天 */
    getLastDay(year,month) {
      var new_year = year; //取当前的年份
      var new_month = month++;//取下一个月的第一天，方便计算（最后一天不固定）
      if(month>12) {
        new_month -=12; //月份减
        new_year++; //年份增
      }
      var new_date = new Date(new_year,new_month,1); //取当年当月中的第一天
      return (new Date(new_date.getTime()-1000*60*60*24)).getDate();//获取当月最后一天日期
    },
     /*
    * 获取评价项列表
      @param type 1录入（教师评价），2任务(学生任务)
    * */
    async getPjxList(type,checked) {
        let data = {
            scope: '1,3',
            type,
            dimensionId: this.$route.query.id,
            gradeCode: this.$cookie.get('gradeId'),
            classCode: this.$cookie.get('classCode')
        };
        
        const res = await this.$req.get(PjApi.list, data);
        if (res.resultCode == 1) {
          if(res.value.length == 0){
            return;
          }
          if(type == 1) {
              this.tea_list = res.value;
          } else {
              this.stu_list = res.value;
          }
        }
    },
    //预览图片
    preImage(img){
      ImagePreview({
        images: [
         img
        ],
        closeable: true
      });
    }
  }
}
</script>
<style lang="less" scoped>
  .warp{
    width: 100%;
    height: 100%;
    display: block;
    position: relative;
    overflow-x: hidden;
    overflow-y: scroll;
    .top{
      width: 100%;
      height: 320px;
      background:linear-gradient(360deg,rgba(0,168,255,1) 0%,rgba(10,205,255,1) 100%);
      padding: 32px;
      .xueqi{
        margin:10px auto;
        font-size: 30px;
        color:#fff;
        position: relative;
        text-align: center;
      }
      .xueqi::after{
        content: "";
        position: absolute;
        top: -40px;
        margin: 40px 10px;
        border-right:1px solid #fff;
        border-bottom: 1px solid #fff;
        width: 20px;
        height: 20px;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
      }
      .tab{
        padding: 32px;
        p{
          font-weight: 500;
          color:#fff;
          font-size: 48px;
          line-height: 140px;
        }
        img{
          margin-top:90px;
        }
      }
    }
    .content{
      width: 100%;
      background-color: #fff;
      border-radius:40px 40px 0px 0px;
      margin-top:-40px;
      height:1000px;
      overflow-y:scroll;
      .dot{
        width: 40px;
        height: 8px;
        background-color: #E2E4E6;
        border-radius: 4px;
        margin:8px auto;
      }
      .content-title{
        padding: 32px;
        position: relative;
        .type{
          font-size:28px;
          color:rgba(41,45,51,1);
          position: relative;
        }
        img{
          width: 26px;
          height: 16px;
          margin-top:12px;
          margin-left: 6px;
        }
        .scores{
          font-size: 28px;
          color: #292D33;         
          position: absolute;
          right: 32px;
          top: 20px;
          display: flex;
          align-items: center;
          .border{
            font-size: 48px;
            font-weight: bold;
            &.yellow{
              color: #FFB600;
            }
          }
        }
      }
      .item-warp{
        padding: 32px;
        .item{
          width: 100%;
          .left{
            width: 15%;
            .day{
              font-size:52px;
              font-family:ALIBABA Font;
              font-weight:bold;
              line-height:64px;
              color:rgba(38,38,38,1);
            }
            .month{
              font-size:28px;
              font-family:PingFang SC;
              font-weight:800;
              line-height:64px;
              color:rgba(38,38,38,1);
            }
            .line{
              width:0px;
              border:2px solid rgba(239,241,243,1);
              margin-left: 30%;
              margin-top:20px;
              margin-bottom:20px;
            }
          }
          .right{
            width: 85%;
            margin-top:12px;
            .right-item{
              height: 260px;
            }
            .right-top{
              height: 44px;
            }
            .tag{
              margin-right: 20px;
              .commTagLine{
                width:4px;
                height:44px;
                border-radius:4px;
              }
              .commTagContent{
                padding: 6px 16px;
                border-radius: 1px 6px 6px 1px;
                font-size:24px;
                font-family:PingFang SC;
                font-weight:400;
              }
            }
            .time{
              font-size:24px;
              font-family:ALIBABA Font;
              font-weight:400;
              line-height:64px;
              color:rgba(182,184,184,1);
            }
            .right-p{
              margin-top:10px;
              margin-bottom:20px;
              p:nth-child(1){
                font-size:28px;
                line-height:50px;
                color:rgba(38,39,39,1);
              }
              p:nth-child(2){
                font-size:28px;
                font-family:ALIBABA Font;
                font-weight:bold;
                line-height:40px;
                color:rgba(255,182,0,1);
              }
            }
            .img-warp{
              img{
                width:180px;
                height:120px;
                border-radius:20px;
              }
            }
            .right-bottom{
              margin-top:30px;
              margin-bottom:10px;
              font-size:24px;
              font-family:PingFang SC;
              font-weight:400;
              line-height:50px;
              color:rgba(182,184,184,1);
            }
          }
        }
      }
      
    }
    .green{
      background:rgba(235,248,243,1);
      color: #00CD86;
    }
    .greenBg{
      background-color: #00CD86;
    }
    .yellow{
      background:rgba(255,252,242,1);
      color:#FFB600;
    }
    .yellowBg{
      background-color:#FFB600;
    }
    .purpleBg{
      background-color: #8800FF;
      &+.commTagContent{
        background:rgba(242,235,255,1);
        color: #8800FF;  
      }
    }
    .redBg{
      background-color: #FF5353;
      &+.commTagContent{
        background:rgba(255,243,243,1);
        color: #FF5353; 
      }
    }
    .red1Bg{
      background-color: #FF6334;
      &+.commTagContent{
        background:rgba(255,245,242,1);
        color: #FF6334;   
      }
    }
    .artGreenBg{
      background-color: #00CD1B;
      &+.commTagContent{
        background:rgba(235,248,237,1);
        color: #00CD1B;   
      }
    }
    .blueBg{
      background-color: #33A5FF;
      &+.commTagContent{
        background:rgba(235,246,255,1);
        color: #33A5FF;       
      }
    }
    .greyBg{
      background-color: #707680;
      &+.commTagContent{
        background:#EBEFF5;
        color:#707680;        
      }
    }
    .emptyText{
      text-align: center;
      font-size: 30px;
      color:rgba(189,190,191,1);
      margin-top:40px;
    }
  }
  .wait-list-loading {
    height: 80px;
    line-height: 80px;
    text-align: center;
  }
</style>
<style>
.van-checkbox__icon .van-icon{
    width: 40px !important;
    height: 40px !important;
    line-height: 40px !important;
    margin-top:-10px;
  }
</style>