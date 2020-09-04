<template>
  <div class="stuProgress">
    <div class="overall">
      <div class="title flex justifySpaceBetween">
        <div class="label">总体完成情况</div>
        <div class="status" v-if="compitionStatus!=-1" :class="{'orange':compitionStatus==-1,'green':compitionStatus==1}" @click="showAudit">{{compitionStatusList[compitionStatus]}}</div>
      </div>
      <ringChart :chartData="compitionData"></ringChart>      
    </div>
    <div class="detail">
      <div class="title">完成详情</div>
      <div class="period" v-for="(detail,n) in detailList">
        <div class="header flex justifySpaceBetween alignCenter" v-if="subTaskDetail.evaluationRuleFrequency.type!=1">
          <!-- <div class="periodName">{{n}}</div> -->
          <!-- <div class="periodName">第{{n+1}}{{cycleName[subTaskDetail.evaluationRuleFrequency.type]}}</div> -->
          <div class="periodName">{{detail[0][cycleName[subTaskDetail.evaluationRuleFrequency.type]]}}</div>
          <div class="progress">{{detail.length}}/{{subTaskDetail.evaluationRuleFrequency.count}}</div>
        </div>
        <ul class="completionStatus">
          <li class="item flex justifySpaceBetween alignCenter" v-for="(iteminfo,n1) in detail">
            <div class="date">{{timeformate(iteminfo.createTime)}}  <span :class="{'pass':iteminfo.status==1}" v-if="iteminfo.status!=0" @click="showNoPass(iteminfo)">{{iteminfo.status==1?'通过':iteminfo.status==-1?'不通过':''}}</span></div>
            <div class="more" @click="showCompitionDetails(iteminfo)" v-if="iteminfo.status!=-1">查看详情</div>
            <div class="resubmit" @click="reSubmit(iteminfo)" v-if="iteminfo.status==-1">重新提交</div>
          </li>
        </ul>
      </div>
      <div class="footer">
        <div class="submitbtn" :class="canSubmit&&(compitionStatus==3||compitionStatus==0)?'blue':'grey'"  @click="submitTask">
          提交任务
        </div>        
      </div>
    </div>
 
     <!-- 审核未通过弹框 -->
     <mt-popup
       v-model="showAuditDetail"
       position="bottom">
       <div class="popupContent">
         <div class="topinfo">
           <div class="header flex alignCenter justifySpaceBetween">
             <div class="title">审核未通过</div>
             <div class="arrowdown" @click="showAuditDetail=false"></div>
           </div>
           <div class="time">
             审核时间: {{noPassDetail.auditTime}}
           </div>         
         </div>
         <div class="content">
           <p class="textMsg">{{noPassDetail.reMarks}}</p>
         </div>
       </div>
     </mt-popup>
    
    <!-- 提交详情弹框 -->
    <mt-popup
      v-model="completionDetail"
      position="bottom">
      <div class="popupContent"  v-if="curDetail">
        <div class="topinfo">
          <div class="header flex alignCenter justifySpaceBetween">
            <div class="title">提交详情</div>
            <div class="arrowdown" @click="completionDetail=false"></div>
          </div>
          <div class="time">
            <span class="date">{{getWeek(curDetail.createTime)}} {{curDetail.createTime.split(' ')[0]}}</span>
            <!-- 本人在未审核之前都可重复撤回编辑 -->
            <span class="recal" v-if="curDetail.userId==userId&&(compitionStatus==3||compitionStatus==0)" @click="showConfirm">撤回</span>
            <span class="edit" v-if="curDetail.userId==userId&&(compitionStatus==3||compitionStatus==0)" @click="toEdit(curDetail)">编辑</span>
          </div>        
        </div>
        <div class="content">
          <div class="teammate flex" v-if="!linkUserId&&subTaskDetail.totalContributorCount&&teammatelist.length>0">
            <span class="label">协作人</span>
            <ul class="teammatelist flex alignCenter" :class="{'limit':!showTeammates}">
              <li class="flex alignCenter" v-for="workMate in teammatelist">
                <div class="headimg">
                  <!--判断性别1男2女-->
                  <div class="avatar" v-if="workMate.icon" :style="{'backgroundImage': 'url('+workMate.icon+')'}"></div>
                  <div class="avatar boy" v-else-if="workMate.gender == 1"></div>
                  <div class="avatar girl" v-else></div>                  
                </div>
                <span>{{workMate.name}}</span>
              </li>
            </ul>
            <span v-show="teammatelist.length>3" @click="showTeammates = !showTeammates" class="arrowText">{{showTeammates?'收起':'查看全部'}}</span>
          </div>  
          <p class="textMsg">{{curDetail.content}}</p>
          <div class="video playerBtn" @click="toVideo(curDetail.fileInfoVOS['video'][0].absolutePath)" v-if="curDetail.fileInfoVOS['video'].length>0">
            <video :controls='false' ref="myVideo">
               <source :src="video.absolutePath" v-for="video in curDetail.fileInfoVOS['video']"></source>
            </video>
          </div>
            <div class="photos" 
                v-if="curDetail.fileInfoVOS['image'].length>0" 
                :class="{'photos1':curDetail.fileInfoVOS['image'].length==1,'photos2':curDetail.fileInfoVOS['image'].length==2}"
            >
            <div class="photo" v-for="(img, index) in curDetail.fileInfoVOS['image']" :key="index">
              <img v-gallery="'imgs'+curDetail.id" :src="img.absolutePath" alt="">
            </div>
          </div>
          <div class="link flex alignCenter" v-if="curDetail.linkUrl">
            <div class="linkicon"></div>
            <div class="linktitle flex_1 text-overflow-clamp2">{{curDetail.linkTitle}}</div>
            <div class="openlink" @click="openLink(curDetail.linkUrl)">打开链接</div>
          </div>
        </div>
      </div>
    </mt-popup>
    <!-- 是否撤回弹框 -->
    <confirm ref="confirmDialog" msg="是否确认撤回提交？" @choose="handleConfirm"></confirm>
  </div>
</template>

<script>
  import {RewardTaskApi as API} from '@/utils/api'
  import ringChart from './ringChart.vue'
  import confirm from '../../modal/Confirm.vue'
  import _ from 'lodash';
  import formateDate from '@/utils/formatDate/formatDate'
  export default {
    name: 'StuProgress',
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
        linkUserId: '',//被协作人--要用协作人id获取信息
        taskId: '',//子任务id
        subTaskDetail: null,//子任务信息
        showAuditDetail: false, //审核未通过弹框
        completionDetail: false, //完成内容弹框
        textMsg: '',
        noPassDetail:{},
        compitionInfo: null,// 完成情况信息
        compitionStatus: '',// 完成情况状态
        compitionStatusList:{
          '0': '审核中',
          '1': '审核通过',
          '-1': '审核未通过',
          '3': '进行中',
          '4': '未完成'
        },
        // cycleName:{
        //   '2': '天',
        //   '3': '周',
        //   '4': '月'
        // },
        cycleName:{
          '2': 'day',
          '3': 'weekTab',
          '4': 'monthTab'
        },
        weekName: ['周日','周一','周二','周三','周四','周五','周六'],
        detailList:[],//完成详情列表
        curDetail: null,//当前查看的提交详情记录,
        teammatelist: [],//协作人列表
        showTeammates: false,//展示所有协作人列表
      }
    },
    mounted(){
      this.init();
    },
    methods:{
      async init(){
        this.taskId = this.$route.query.taskId;  
        this.linkUserId = this.$route.query.linkUserId; 
        await this.getTaskDetail();
        this.getSubmitInfo();
        if(!this.linkUserId){
          // 主参与人可以看协作人
          this.getTeammates();
        } 
      },
      initVideo() {
        //页面dom元素渲染完毕，执行回调里面的方法
        this.$nextTick(() => {
          let myPlayer = this.$video(document.getElementById('myVideo'), {
            //确定播放器是否具有用户可以与之交互的控件。没有控件，启动视频播放的唯一方法是使用autoplay属性或通过Player API。
            controls: true,
            //自动播放属性,muted:静音播放
            autoplay: false,
            //建议浏览器是否应在<video>加载元素后立即开始下载视频数据。
            preload: "auto",
            //设置视频播放器的显示宽度（以像素为单位）
            // width: "800px",
            //设置视频播放器的显示高度（以像素为单位）
            // height: "400px",
            controlBar:{
              playToggle:false
            }
          }); 
          console.log(myPlayer,174);
        })
        
      },
      async getSubmitInfo(){
        var data = {
          classCode: this.classCode,
          evaluationId: this.taskId,
          evaluationObject: 1,
          gradeCode: this.gradeId,
          limit: 10,
          page:1,
          schoolCode: this.xxdm,
          type: '2',
          userId: this.linkUserId||this.userId
        }
        var res = await this.$req.post(API.getSubmitInfo,data);
        this.compitionInfo = res.value;
        var type = this.subTaskDetail.evaluationRuleFrequency.type
        var groupKeyWord = type == 2?'day':type==4?'monthTab':type==3?'weekTab':''

        console.log(res.value.dataList[0].itemInfoList,"res.value.dataList");

        this.detailList = res.value.dataList.length>0?this.indexGroupBy(res.value.dataList[0].itemInfoList, groupKeyWord):[];
  
        var endtime = new Date(this.subTaskDetail.endTime.replace(/-/g, "/"));
        var curtime = new Date(res.synDate.replace(/-/g, "/"));
        this.compitionStatus = endtime.getTime()<curtime.getTime()?'4':this.compitionInfo.dataList.length==0?'3':'';

        console.log(this.detailList,"this.detailList") 
      },
      async getTaskDetail(){
        var res = await this.$req.get(API.getSubTaskDetail+this.taskId,{});
        // console.log(res.value,96)
        this.subTaskDetail = res.value; 
        document.title = this.subTaskDetail.name
      },
      jumpTo(path,query){
        this.$router.push({path,query});
      },
      toVideo(src){
        this.$router.push({
          path: '/fullScreenVideo',
          query:{
            src
          }
        })
      },
      showConfirm(){
        this.$refs.confirmDialog.showModal()
      },
      showNoPass(item){
        console.log(item,"item")
        if(item.status==-1){
          // this.$set(this.noPassDetail,'updateTime',item.auditTime);
          // this.$set(this.noPassDetail,'remark',item.reMarks);
          this.noPassDetail = item;
          console.log(this.noPassDetail,"this.noPassDetail")
          this.showAuditDetail = true;
        }
      },
      showAudit(){
        if(this.compitionStatus=='-1'){
          this.showAuditDetail = true;
        }
      },
      openLink(link){
        window.open(link, '_blank');
      },
      async handleConfirm(choose){
        if(choose){
          console.log('recall')
          var res = await this.$req.get(API.deleteRewardItem,{itemId:this.curDetail.id});
          if(res.resultCode==1){
            this.$refs.confirmDialog.hideModal()
            this.completionDetail = false;
            this.$toast(res.resultMessage);
            this.getSubmitInfo();
          }
        }        
      },
      showCompitionDetails(item){   
        var data = JSON.parse(JSON.stringify(item));
        data.fileInfoVOS = this.groupBy(data.fileInfoVOS,'contentType');
        this.curDetail = data;
        this.completionDetail=true;
        // console.log(231)
        if(data.fileInfoVOS.video.length>0){
          // this.initVideo()
          setTimeout(()=>{
            console.log(this.$refs.myVideo.load,247)
            this.$refs.myVideo.load()
          },300)
        }
      },
      timeformate(timestr){
        var date = new Date(timestr.replace(/-/g, "/"));
        var res = this.weekName[date.getDay()]+' '+formateDate(date.getTime(),'(yyyy/MM/dd) hh:mm')
        return res;
      },
      getWeek(timestr){
        var date = new Date(timestr.replace(/-/g, "/"));
        return this.weekName[date.getDay()];
      },
      async getTeammates(){
        var res = await this.$req.get(API.getPullList,{
          schoolCode: this.xxdm,
          evaluationId: this.taskId,
          studentId: this.userId,
          classCode: this.classCode
        });
        this.teammatelist = res.value || []
      },
      toEdit(data,reEdit){
        var formData = {
          content: '',
          weblink: '',
          weblinkTitle: '',
          imgs: [],
          videos: [],
          id: '',
        }
        this.$set(formData,'content',data.content);
        this.$set(formData,'weblink',data.linkUrl);
        this.$set(formData,'weblinkTitle',data.linkTitle);
        this.$set(formData,'imgs',data.fileInfoVOS.image);
        this.$set(formData,'videos',data.fileInfoVOS.video);
        this.$set(formData,'id',data.id);
        sessionStorage.setItem('formData',JSON.stringify(formData)) // 存储表信息
        this.jumpTo('/StuSubmitTask',{taskId:this.taskId,linkUserId:this.linkUserId,type:reEdit?'reEdit':'edit'})
      },
      submitTask(){
        if(this.canSubmit&&(this.compitionStatus==3||this.compitionStatus==0)){
          this.jumpTo('/StuSubmitTask',{taskId:this.taskId,linkUserId:this.linkUserId});
        }
      },
      groupBy(arr,key){
        var res = {
          'video':[],
          'image':[]
        };
        arr.forEach(e=>{
          if(e[key].indexOf('video')>=0){
            res.video.push(e);
          } 
          if(e[key].indexOf('image')>=0){
            res.image.push(e);            
          }
        })
        return res;
      },
      indexGroupBy(arr,key){
        var res = [];
        if(key==''){
          res[0] = []
        }
        arr.forEach(e=>{
          if(key==''){
            res[0].push(e);
          } else {
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
          }

        })
        return res;
      },
      reSubmit(item){
        // console.log(item);
        this.toEdit(item,'reEdit');
        // this.jumpTo('/StuSubmitTask',{taskId: this.taskId,linkUserId:this.linkUserId,type:'edit'})
      }
    },
    computed:{
      compitionData(){
        var res = {
          rate: 0,
          submit: 0,
          should: 1,
        }
        if(this.subTaskDetail){
          res.should = this.subTaskDetail.stageCount*this.subTaskDetail.evaluationRuleFrequency.count;
        }        
        if(this.compitionInfo&&this.compitionInfo.dataList.length>0){
          var maxCount = this.subTaskDetail.evaluationRuleFrequency.count
          // this.compitionStatus = this.compitionInfo.dataList.length==0?3:'';

          this.detailList.forEach(e=>{
            res.submit += (e.length>maxCount?maxCount:e.length);            
          })

          this.compitionStatus = this.compitionInfo.dataList[0].status==3&&this.compitionStatus!=''?this.compitionStatus:(this.compitionInfo.dataList[0].status+'');  

        }          
        res.should = res.should||1;
        res.rate = Math.round(res.submit/res.should)*100;
        res.rate = res.rate>100?100:res.rate;
        return res;
      },
      canSubmit() {
        // 未提交过 或者 不限制提交次数
        var res = !this.compitionInfo || this.compitionInfo.dataList.length==0 || !this.subTaskDetail.totalSubmitCount;
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
            res = tempArr.length<this.subTaskDetail.totalSubmitCount;
          }
        }
        return res;
      },
    },
    watch:{
      completionDetail(val){
        if(!val){
          this.curDetail = null;
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .stuProgress{
    height: 100%;
    overflow: auto;
  }
  .overall{
    padding: 40px 32px;
    background-color: #fff;
    .title{
      font-size:32px;
      font-weight:800;
      margin-bottom: 40px;
      .label{
        color: #292D33;
      }
      .status{
        color: #FFB600;
      }
      .status.orange{
        color: #FF7B12;
        &::after{
          content: '';
          height: 11px;
          width: 11px;
          display: inline-block;
          border-top: 4px solid #FF7B12;
          border-right: 4px solid #FF7B12;
          transform: rotate(45deg);
          position: relative;
          top: -4px;
          margin-left: 20px;
        }
      }
      .status.green{
        color: #00CD86;
      }
    }
  }
  .detail{
    padding: 40px 32px;
    background-color: #fff;
    .title{
      font-size:32px;
      font-weight:800;
      margin-bottom: 40px;
    }
    .period{
      margin-bottom: 40px;
      .header{
        background:rgba(239,241,243,1);
        height: 60px;
        border-radius:8px;
        .periodName{
          background:linear-gradient(270deg,rgba(255,194,52,1) 0%,rgba(250,127,3,1) 100%);
          border-radius:8px 30px 30px 8px;
          font-size:24px;
          line-height: 60px;
          font-weight:400;
          color: #fff;
          padding:0 20px;
        }
        .progress{
          font-size:28px;
          font-weight:400;
          line-height: 60px;
          color:rgba(41,45,51,1);
          margin-right: 20px;
        }
      }
      .completionStatus{
        margin: 20px 0;
        .item{
          font-size:28px;
          font-weight:400;
          color:rgba(41,45,51,1);
          line-height: 80px;
          .more{
            color:rgba(51,165,255,1);
          }
          .resubmit{
            color: #FF7B12;
          }
        }
        .date{
          span{
            padding-left: 20px;
            color: #FF7B12;
            padding-right: 25px;
            background: url(../../img/arrowdown.png) no-repeat right center;
            background-size: auto 50%;
          }
          .pass{
            color: #00CD86;
            background: none;
          }
        }
      }
    }
    .footer{
      height: 36px;
      .submitbtn{
        width:280px;
        height:88px;
        border-radius:44px;
        font-size:30px;
        font-weight:400;
        color:rgba(255,255,255,1);
        line-height: 88px;
        text-align: center;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      } 
      .blue{
        background-color: #33A5FF;        
      }
      .grey{        
        background:rgba(192,227,255,1);     
      }      
    }
}

  .popupContent{
    padding: 40px 32px 0px;
    .topinfo{
      margin-bottom: 20px;
      .header{
        margin-bottom: 20px;
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
      .time{
        font-size:28px;
        font-weight:400;
        color:rgba(174,182,193,1);
        .edit{
          color:rgba(51,165,255,1);
          margin-left: 20px;
        }
        .recal{
          color:rgba(255,123,18,1);
          margin-left: 20px;
        }
      }
    }
    .content{
      margin-bottom: 40px;
      max-height: 800px;
      overflow: hidden;
      overflow-y: auto;
      .teammate{
        font-size:28px;
        font-weight:400;
        color:rgba(41,45,51,1);
        margin-bottom: 20px;
        position: relative;
        .teammatelist{
          margin-left: 20px;          
          width: calc(100% - 110px);
          overflow: hidden;
          flex-wrap: wrap;
          height: auto;
          margin-bottom: 60px;
          &.limit{
            width: calc(100% - 230px);
            height: 80px;
            margin-bottom: 0;
            &+.arrowText{
              line-height: 80px;
              left: auto;
              right: 0;
              bottom: 0;
            }            
          }
          li{
            width: 33%;
            height: 80px;
          }
          .headimg{
            // background-color: gray;
            display: inline-block;
            height: 60px;
            width: 60px;
            border-radius: 50%;
            .avatar {
              width: 100%;
              height: 100%;
              background-size: 100% auto;
              background-position: center;
              background-repeat: no-repeat;
            }
            .boy {
              background-image: url("/static/img/boy@2x.png");
            }
            .girl {
              background-image: url("/static/img/girl@2x.png");
            }
          }
        }
        .label{
          line-height: 80px;
        }
        .arrowText{
          line-height: auto;
          color: #aeb6c1;
          position: absolute;
          left: 110px;
          bottom: 0;
        }
        // .arrowdown{
        //   background-image: url(../../img/arrowdown.png);
        //   background-repeat: no-repeat;
        //   background-size: 100% auto;
        //   background-position: 0 0;
        //   height: 26px;
        //   width: 15.59px;
        //   position: relative;
        //   top: 50%;
        //   // margin-top: 13px;
        //   display: inline-block;
        //   transform: rotate(90deg);
        //   margin-right: 10px;
        //   transition: transfrom 0.3s;
        // }
      }
      .textMsg{
        font-size:28px;
        font-weight:400;
        line-height:40px;;
        color:rgba(174,182,193,1);
      }
      .video{
        height: 456px;
        // overflow: hidden;
        margin-top: 40px;
        border-radius: 20px;
        background-color: grey;
        video{  
          height: 100%;
          width: 100%;        
          border-radius: 20px;
        }
        &.playerBtn{
          position: relative;
        }
        .video-js{
          /deep/ .vjs-big-play-button{
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            height: 3em;
            border-radius: 50%;
            line-height: 3em;
          }
        }
      }
      .photos{
        margin: 0 -20px;
        margin-top: 20px;
        display: flex;
        // align-items: center;
        flex-wrap: wrap;
        .photo{
          width: calc(33.3% - 40px);
          height: 200px;
          // background-color: #ccc;
          margin: 20px;
          img{
            border-radius: 20px;
            height: 100%;
            width: 100%;
          }
        }
      }
      .photos.photos1{
        margin: 0;
        margin-top: 40px;
        display: block;
        .photo{
          height: 456px;
          width: 100%;
          margin: 0;
        }
      }
      .photos.photos2{
        display: flex;
        align-items: center;
        .photo{
          height: 320px;
          flex: 1;
        }
      }
      
      .link{
        margin-top: 20px;
        height:120px;
        background:rgba(239,241,243,1);
        border-radius:20px;
        .linkicon{
          height: 120px;
          width: 120px;
          background-color: #168DFF;
          border-radius: 20px;
          &::before{
            content: '';
            background-image: url(../../img/link.png);
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-position: 0 0;
            height: 57.17px;
            width: 57.17px;
            display: block;
            position: relative;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
          }
        }
        .linktitle{
          font-size:32px;
          font-weight:bold;
          color:rgba(41,45,51,1);
          margin-left: 20px;
          word-break: break-all;
        }
        .openlink{
          font-size:28px;
          font-weight:400;
          color:rgba(22,141,255,1);
          margin-right: 20px;
        }
      }
    }

  }
  .playerBtn::before{
    content: '';
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    height: 100px;
    width: 100px;
    border-radius: 50%;
    background-image: url(../../img/playbtn.png);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    z-index: 1;
  }
  
  /deep/ .popup-bg{
    z-index: 2010!important;

  }
  /deep/ .mint-popup{
    z-index: 2001!important;
  }    
  /deep/ .v-modal{
    z-index: 2000!important;
  }
</style>
