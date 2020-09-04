<template>
  <div class="stuProgress">
    <div class="teammate flex alignCenter" v-if="teammatelist.length>0">
      <span class="label">协作人</span>
      <ul class="teammatelist flex flex-wrap alignCenter">
        <li class="stu flex alignCenter" v-for="(stu,n) in teammatelist">
          <div class="headimg">
            <!--判断性别1男2女-->
            <div class="avatar" v-if="stu.icon" :style="{'backgroundImage': 'url('+stu.icon+')'}"></div>
            <div class="avatar boy" v-else-if="stu.gender == 1"></div>
            <div class="avatar girl" v-else></div>
          </div>
          <div class="name">{{stu.name}}</div>
        </li>
      </ul>
      <span class="arrowdown" v-show="teammatelist.length>3" @click="teammateShow = true"></span>
    </div>
    <div class="overall">
      <div class="title flex justifySpaceBetween">
        <div class="label">总体完成情况</div>
        <!-- <div class="status" :class="{'orange':compitionStatus=='-1','green':compitionStatus=='1'}" @click="compitionStatus=='-1'?showAuditDetail=true:''">{{compitionStatusList[compitionStatus]}}</div> -->
        <div class="status" :class="{'orange':compitionStatus=='-1','green':compitionStatus=='1'}" >{{compitionStatusList[compitionStatus]}}</div>
      </div>
      <div class="content flex ">
        <div class="overallitem">
          <div class="label green">应提交</div>
          <div class="value">{{compitionData.should}}次</div>
        </div>
        <div class="overallitem">
          <div class="label yellow">共提交</div>
          <div class="value">{{compitionData.submit}}次</div>
        </div>
      </div>
    </div>
    <div class="detail">
      <div class="title">完成详情</div>
      <div class="period" v-for="(detail,n) in detailList">
        <div class="header flex justifySpaceBetween alignCenter" v-if="subTaskDetail.evaluationRuleFrequency.type!=1">
          <!-- <div class="periodName">第{{n+1}}{{cycleName[subTaskDetail.evaluationRuleFrequency.type]}}</div> -->
          <div class="periodName">{{detail[0][cycleName[subTaskDetail.evaluationRuleFrequency.type]]}}</div>
          <div class="progress">{{detail.length}}/{{subTaskDetail.evaluationRuleFrequency.count}}</div>
        </div>
        <ul class="completionStatus">
          <li class="item clearfix" v-for="(iteminfo,n1) in detail">
            <div class="flex justifySpaceBetween alignCenter">
              <div class="date">{{timeformate(iteminfo.createTime)}} {{iteminfo.name?(iteminfo.name+'提交'):''}}</div>
              <div class="more" @click="showCompitionDetails(iteminfo)">查看全部</div>              
            </div>
            <div class="overview">
              <p class="previewText text-overflow-clamp2">
                {{iteminfo.content}}
              </p>
              <div class="medialist flex alignCenter justifySpaceBetween" v-if="iteminfo.fileInfoVOS.length>0">
                <div class="media" v-for="imgInd in 3">
                  <!-- <span>{{iteminfo.fileInfoVOS.length>=n}}</span> -->
                  <div @click="toVideo(iteminfo.fileInfoVOS[imgInd-1].absolutePath)" class="playerBtn" v-if="iteminfo.fileInfoVOS.length>=imgInd&&iteminfo.fileInfoVOS[imgInd-1].contentType.indexOf('video')>=0" >
                    <video 
                      ref="myVideo" 
                      :controls="false"                       
                      :src="iteminfo.fileInfoVOS[imgInd-1].absolutePath">
                    </video>                    
                  </div>
                  <!-- <VideoPlayer ref="myVideo" v-if="iteminfo.fileInfoVOS.length>=imgInd&&iteminfo.fileInfoVOS[imgInd-1].contentType.indexOf('video')>=0" :src="iteminfo.fileInfoVOS[imgInd-1]"></VideoPlayer> -->
                  <!-- <inCPlayer 
                    v-if="iteminfo.fileInfoVOS.length>=imgInd&&iteminfo.fileInfoVOS[imgInd-1].contentType.indexOf('video')>=0" 
                    :inOptList="[]" 
                    :ishackReset="false" 
                    :inVideoSrc="iteminfo.fileInfoVOS[imgInd-1].absolutePath" 
                    :inHasOpt="true">
                  </inCPlayer> -->
                  <img v-gallery="'smallimg'+n1" v-else-if="iteminfo.fileInfoVOS.length>=imgInd" :src="iteminfo.fileInfoVOS[imgInd-1].absolutePath" alt="">
                </div>
              </div>
              <div class="link flex alignCenter" v-if="iteminfo.linkUrl">
                <div class="linkicon"></div>
                <div class="linktitle flex_1 text-overflow-clamp2">{{iteminfo.linkTitle}}</div>
                <div class="openlink" @click="openLink(iteminfo.linkUrl)">打开链接</div>
              </div>
            </div>

            <div class="status" @click="showNoPass(iteminfo)" :class="{'pass':iteminfo.status>1}" v-if="iteminfo.status!=0">{{(iteminfo.status==-1)?'不通过':'通过'}}</div>
            <!-- <div class="status">{{iteminfo.status}}</div> -->
            <div class="singleSubmit" v-else  @click="showReview(iteminfo)">审核</div>

          </li>
        </ul>
      </div>
      <div class="footer">
        <div class="submitbtn clearfix" v-if="compitionStatus==0" @click="showReview">
          审核全部
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
      <div class="popupContent" v-if="curDetail">
        <div class="topinfo">
          <div class="header flex alignCenter justifySpaceBetween">
            <div class="title">提交详情</div>
            <div class="arrowdown" @click="completionDetail=false"></div>
          </div>
          <div class="time">
            <span class="date">{{timeformate(curDetail.createTime)}} {{curDetail.name?(curDetail.name+'提交'):''}}</span>
          </div>         
        </div>
        <div class="content">
          <p class="textMsg">{{curDetail.content}}</p>
          <div class="video" v-if="curDetail.fileInfoVOS['video'].length>0">
            <!-- <VideoPlayer ref='detailMyVideo' :src="video" v-for="video in curDetail.fileInfoVOS['video']" :key="video.fileId"> -->
               <!-- <source  :type="video.contentType"></source> -->
            <!-- </VideoPlayer> -->
            <div class="playerBtn" @click="toVideo(video.absolutePath)" v-for="video in curDetail.fileInfoVOS['video']">
              <video ref='detailMyVideo' :src="video.absolutePath"></video>
              <div class="play-btn"></div>
            </div>            
          </div>
          <div class="photos" v-if="curDetail.fileInfoVOS['image'].length>0" :class="{'photos1':curDetail.fileInfoVOS['image'].length==1,'photos2':curDetail.fileInfoVOS['image'].length==2}">
            <div class="photo" v-for="img in curDetail.fileInfoVOS['image']">
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
    
    <!-- 审核弹框 -->
    <confirm ref="reviewConfirm" title="审核" :showClose="true" :autoHide="false" activeColor="#33A5FF" @choose="handleConfirm" :btnText="btnText">
      <div class="reviewform flex flex-column alignCenter">
        <input v-model="checkedValue" type="radio" id="pass" name="review" value="1">
        <label for="pass">通过</label>
        <input v-model="checkedValue" type="radio" id="fail" name="review" value="-1">
        <label for="fail">不通过</label>
        <div class="reason" v-if="checkedValue=='-1'">
          <div class="label flex justifySpaceBetween alignCenter">
            <span class="title">具体原因</span>
            <span class="textcount">{{reason.length}}/200</span>
          </div>
          <div class="textarea">
            <textarea v-model="reason" placeholder="请输入具体原因" cols="50" maxlength="200" rows="10"></textarea>
          </div>          
        </div>
      </div>
    </confirm>
    

    <!-- 协作人详情弹框 -->
    <mt-popup
      v-model="teammateShow"
      position="bottom">
      <div class="popupContent" v-if="teammatelist">
        <div class="topinfo">
          <div class="header flex alignCenter justifySpaceBetween">
            <div class="title">协作人列表(共{{teammatelist.length}}人)</div>
            <div class="arrowdown" @click="teammateShow=false"></div>
          </div>
        </div>
        <div class="content">
          <ul class="teammatelist flex flex-wrap alignCenter">
            <li class="stu flex alignCenter" v-for="(stu,n) in teammatelist">
              <div class="headimg">
                <!--判断性别1男2女-->
                <div class="avatar" v-if="stu.icon" :style="{'backgroundImage': 'url('+stu.icon+')'}"></div>
                <div class="avatar boy" v-else-if="stu.gender == 1"></div>
                <div class="avatar girl" v-else></div>
              </div>
              <div class="name">{{stu.name}}</div>
            </li>
          </ul>          
        </div>
      </div>
    </mt-popup>
        
  </div>
</template>

<script>
  import {RewardTaskApi as API} from '@/utils/api'
  import formateDate from '@/utils/formatDate/formatDate'
  import confirm from '../../modal/Confirm.vue'
  import inCPlayer from '@/components/in-chimee-player'
  export default {
    name: 'StuProgress',
    components:{
      confirm,
      inCPlayer
    },
    data(){
      return {
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),
        showAuditDetail: false,
        completionDetail: false,
        btnText:{
          confirm: '提交',
          cancel: '取消'
        },
        checkedValue: '1',
        reason: '',
        noPassDetail:{},
        subTaskDetail: null,
        compitionInfo: null,// 完成情况信息
        compitionStatus: 0,// 完成情况状态
        compitionStatusList:{
          '0': '审核中',
          '1': '通过',
          '-1': '不通过',
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
        detailList:[],//完成详情列表
        curDetail: null,//当前查看的提交详情记录,
        teammatelist: [],//协作人列表
        taskId: '',
        studentId: '',
        classCode: '',
        evaluationRecordId:'',
        teammateShow: false,
        curReviewItem:null,
      }
    },
    mounted(){
      this.init();
    },
    methods:{
      async init(){
        this.taskId = this.$route.query.taskId;
        this.studentId = this.$route.query.studentId;
        this.classCode = this.$route.query.classCode;
        await this.getTaskDetail();
        this.getTeammates();
        this.getSubmitInfo();
      },
      async getTeammates(){
        var res = await this.$req.get(API.getPullList,{
          schoolCode: this.xxdm,
          evaluationId: this.taskId,
          studentId: this.studentId,
          classCode: this.classCode
        });
        this.teammatelist = res.value || []
      },
      async getSubmitInfo(){
        var data = {
          classCode: this.classCode,
          evaluationId: this.taskId,
          evaluationObject: 1,
          // gradeCode: this.gradeId,
          limit: 10,
          page:1,
          schoolCode: this.xxdm,
          type: '2',
          userId: this.studentId
        }
        var res = await this.$req.post(API.getSubmitInfo,data);
        this.compitionInfo = res.value;
        var type = this.subTaskDetail.evaluationRuleFrequency.type
        var groupKeyWord = type == 2?'day':type==4?'monthTab':type==3?'weekTab':''
        this.evaluationRecordId = res.value.dataList[0].id;
        this.detailList = res.value.dataList.length>0?this.indexGroupBy(res.value.dataList[0].itemInfoList, groupKeyWord):[];
        this.$nextTick(()=>{
          if(this.$refs.myVideo){
             this.$refs.myVideo.forEach(video=>{
              video.load();
            })            
          }         
        })
      },
      async getTaskDetail(){
        var res = await this.$req.get(API.getSubTaskDetail+this.taskId,{});
        // console.log(res.value,96)
        this.subTaskDetail = res.value; 
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
            var ind = res.findIndex(r=>r[0][key]==e[key]);
            if(ind<0){
              res.push([e]);
            } else {
              res[ind].push(e);
            }          
          }
        })
        return res;
      },
      timeformate(timestr){
        var date = new Date(timestr.replace(/-/g, "/"));
        var res = formateDate(date.getTime(),'yyyy/MM/dd hh:mm')
        return res;
      },     
      showCompitionDetails(item){   
        var data = JSON.parse(JSON.stringify(item));
        data.fileInfoVOS = this.groupBy(data.fileInfoVOS,'contentType');
        this.curDetail = data;
        this.completionDetail=true;
        // console.log(231)
        if(data.fileInfoVOS.video.length>0){
          this.$nextTick(()=>{
            this.$refs.detailMyVideo[0].load();
          })          
        }
      }, 
      showNoPass(item){
        if(item.status==-1){
          this.noPassDetail = item;
          this.showAuditDetail = true;
        }
      },
      async handleConfirm(value){
        console.log(value,"value")
        console.log(this.curReviewItem,"当前状态")
        if(value){
            if(this.curReviewItem){
                var params = {
                    remark: this.reason,
                    recordItemId:this.curReviewItem.id,
                    status: this.checkedValue
                }
                if(params.status=='-1'&&params.remark.length<2){
                    this.$toast('请填写2-200字不通过说明');
                    return
                }
                var res = await this.$req.get(API.auditRewardItem,params);
                this.$refs.reviewConfirm.hideModal()
                this.$toast(res.resultMessage);
                this.init();
            }else{
                var params = {
                    remark: this.reason,
                    recordId:this.evaluationRecordId,
                    status: this.checkedValue
                }
                if(params.status=='-1'&&params.remark.length<2){
                    this.$toast('请填写2-200字不通过说明');
                    return
                }
                var res = await this.$req.get(API.auditRewardRecord,params);
                if(res.resultCode==1){
                    this.$refs.reviewConfirm.hideModal()
                    this.$toast(res.resultMessage);
                    this.init();
                    // 提交后返回待审核列表
                    // this.$router.go(-1)
                }
            }
        }
      },
      openLink(link){
        window.open(link, '_blank');
      },
      jumpTo(path){
        this.$router.push(path);
      },
      toVideo(src){
        this.$router.push({
          path: '/fullScreenVideo',
          query:{
            src
          }
        })
      },
      showReview(item){

        console.log(item.id,"item--384")
        if(item.id){
            this.curReviewItem = item;
            this.$refs.reviewConfirm.showModal();
        }else{
            this.curReviewItem = null
            this.$refs.reviewConfirm.showModal();
        }
      }
    },
    computed:{
      compitionData(){
        var res = {
          submit: 0,
          should: 1,
        }
        if(this.compitionInfo){
          res.should = this.subTaskDetail.stageCount*this.subTaskDetail.evaluationRuleFrequency.count;
          this.compitionInfo.dataList.forEach(e=>{
            var maxCount = this.subTaskDetail.evaluationRuleFrequency.count
            // this.compitionStatus = this.compitionInfo.dataList.length==0?3:'';

            this.detailList.forEach(e=>{
              res.submit += (e.length>maxCount?maxCount:e.length);            
            })
            this.compitionStatus = e.status+'';
          })  
          res.should = res.should||1;
          if(this.compitionInfo.dataList.length>0){
            document.title = this.compitionStatus=='0'?('审核-' + this.compitionInfo.dataList[0].name):(this.compitionInfo.dataList[0].name+'的提交')
          }
        }
        return res;
      }
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
  .teammate{
    font-size:28px;
    font-weight:400;
    padding: 20px 32px;
    background-color: #fff;
    .label{
      color: #292D33;
      margin-right: 20px;
    }
    .teammatelist{
      width: calc(100% - 140px);
      overflow: hidden;
      height: 80px;
      .stu{
        height: 80px;
        width: 180px;
        // margin-right: 20px;
        .headimg{
          height: 60px;
          width: 60px;
          border-radius: 50%;
          margin-right: 12px;
          background-color: #B6B8B8;
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
        .name{
          color: #B6B8B8;
        }
      }
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
      transform: rotate(0deg);
      margin-right: 10px;
      transition: transfrom 0.3s;
    }
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
        // &::after{
        //   content: '';
        //   height: 11px;
        //   width: 11px;
        //   display: inline-block;
        //   border-top: 4px solid #FF7B12;
        //   border-right: 4px solid #FF7B12;
        //   transform: rotate(45deg);
        //   position: relative;
        //   top: -4px;
        //   margin-left: 20px;
        // }
      }
      .status.green{
        color: #00CD86;
      }
    }
    .content{
      justify-content: space-around;
      .overallitem{
        height: 124px;
        text-align: center;
        .label{
          font-size:28px;
          font-weight:400;
          color:rgba(174,182,193,1);
          margin-bottom: 18px;
          &::before{
            content: '';
            height: 12px;
            width: 12px;
            display: inline-block;
            margin-right: 8px;
            border-radius: 50%;
            position: relative;
            top: -4px;
          }
          &.green::before{
            background-color: #82CB59;
          }
          &.yellow::before{
            background-color: #FFB600;
          }
        }
        .value{
          font-size:48px;
          font-weight:bold;
          color:rgba(41,45,51,1);
        }
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
          padding-bottom: 20px;
          border-bottom: 1px dotted #e2e2e2;
          .more{
            color:rgba(51,165,255,1);
          }
          .status{
            color: #FFB600;
            font-weight: bold;
          }
          .status.pass{
            color: #00CD86;
          }
          .singleSubmit{
            float: right;
            width:136px;
            height:64px;
            background:rgba(51,165,255,1);
            border-radius:32px;
            font-size:26px;
            font-weight:400;
            color:rgba(255,255,255,1);
            line-height: 64px;
            text-align: center;
          }
        }
        .overview{
          margin-bottom: 20px;
          .previewText{
            max-height: 120px;
            line-height: 40px;
            font-size:28px;
            font-weight:400;
            color: #AEB6C1;
            -webkit-line-clamp: 3;
            margin-bottom: 20px;
          }
          .medialist{
            width: 100%;
            .media{
              height: 200px;
              width: 200px;
              border-radius: 20px;
              overflow: hidden;
              // background-color: #ccc;
              /deep/ video,img{
                height: 100%;
                width: 100%;
                border-radius: 20px;
              }
              .playerBtn{  
                height: 200px;
                width: 200px;
                border-radius: 20px;              
                position: relative;
              }
            }
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
    .footer{
      height: 36px;
      .submitbtn{
        width:280px;
        height:88px;
        background:rgba(51,165,255,1);
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
    }
  }

  .reviewform{
    text-align: center;
    padding: 40px;
    margin-top: 12px;
    box-sizing: border-box;
    border-top: 1px solid #EFF1F3;
    input[type='radio']{
      display: none;
      &:checked+label{
        color: #fff;
        &::after{
          content: '';
          height: 19.8px;
          width: 28.28px;
          display: inline-block;
          position: relative;
          left: 20px;
          top: -4px;
          background-image: url(../../img/checked.png);
          background-repeat: no-repeat;
          background-size: 100% auto;
          background-position: 0 0;
        }
        &[for='pass']{
          background:rgba(51,165,255,1);
        }
        &[for='fail']{
          background:rgba(255,123,18,1);
        }
      }
    }
    label{
      width:606px;
      height:112px;
      border-radius:56px;
      font-size:48px;
      font-weight:400;
      line-height:112px;
      display: block;
      &[for='pass']{
        margin-bottom: 40px;
        background:rgba(233,245,255,1);
        color:rgba(51,165,255,1);        
      }
      &[for='fail']{
        background:rgba(255,244,235,1);
        color:rgba(255,123,18,1);
      }
    }
    .reason{
      margin-top: 40px;
      .label{
        font-size:28px;
        font-family:PingFang SC;
        font-weight:800;
        color:rgba(41,45,51,1);
        margin-bottom: 20px;
        .textcount{
          font-weight:400;
          color:rgba(174,182,193,1);
        }
      }
      .textarea{
        height:208px;
        border:1px solid rgba(239,241,243,1);
        padding: 12px 20px;
        textarea{
          height: 100%;
          width: 100%;
          font-size:28px;
          font-weight:400;
          line-height:36px;
        }
      }
    }
  }

  .popupContent{
    padding: 40px 32px 0px;
    .topinfo{
      margin-bottom: 40px;
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
        .recal{
          color:rgba(51,165,255,1);
          margin-left: 20px;
        }
      }
      .teammate{
        font-size:28px;
        font-weight:400;
        color:rgba(41,45,51,1);
        margin-top: 20px;
        .teammatelist{
          margin-left: 20px;
          .headimg{
            background-color: gray;
            display: inline-block;
            height: 60px;
            width: 60px;
            border-radius: 50%;
            &:nth-child(n+2){
              margin-left: -20px;
            }
          }
        }
      }
    }
    .content{
      margin-bottom: 40px;
      max-height: 800px;
      overflow: hidden;
      overflow-y: auto;
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
          // position: relative;
          display: inline-block;
          // opacity: 0.5;
        }
        .playerBtn{
          position: relative;
          height: 100%;
          width: 100%; 
          border-radius: 20px;   
          &::before{
            display: none;
          }
          .play-btn{
            height: 100px;
            width: 100px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            background-image: url(../../img/playbtn.png);
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-position: 0 0;
            display: block;
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
          border-radius: 20px;
          // background-color: #ccc;
          margin: 20px;
          img{
            height: inherit;
            width: 100%;
            border-radius: inherit;
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
    
      
      .teammatelist{
        width: 100%;
        // overflow: hidden;
        // height: 80px;
        .stu{
          height: 80px;
          width: 30%;
          // margin-right: 20px;
          .headimg{
            height: 60px;
            width: 60px;
            border-radius: 50%;
            margin-right: 12px;
            background-color: #B6B8B8;
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
          .name{
            // color: #B6B8B8;
          }
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
  /deep/ .video-js{
    height: 100%!important;
    width: 100%!important;
    border-radius: 20px;
    // overflow: hidden;
  }
</style>
