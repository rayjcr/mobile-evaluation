<template>
  <div class="teacherDetail">
    <div class="taskInfo">
      <div class="header flex justifySpaceBetween alignCenter">
        <div class="title">任务内容</div>
        <div class="more" @click="showTaskDetail=true">查看</div>
      </div>
      <div class="content text-overflow-clamp2">
        {{message}}
      </div>
    </div>
    <div class="tabs">
      <div class="navbar">
        <mt-navbar v-model="status" class="mtnavbar" ref="mtnavbar" :style="{'position':position,'top':top}">
          <mt-tab-item id=""><span class="selectbar">待审核</span></mt-tab-item>
          <mt-tab-item id="1"><span class="selectbar">已审核</span></mt-tab-item>
          <mt-tab-item id="-1"><span class="selectbar">未提交</span></mt-tab-item>
          <div class="tip" v-if="watiForSize>0">
            {{watiForSize}}
          </div>
        </mt-navbar>    
      </div>
      <div class="list-box scrollY" v-if="status == ''||status == '1'">
        <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="(status == ''&&waitForReview.length > 0) || (status == '1'&&reviewedList.length > 0)">
      
          <!-- 待审核 -->
          <ul class="audit" v-show="status==''">
            <li class="taskbox" v-for="(item,n) in waitForReview">
              <div class="header">
                <div class="stuInfo">
                  <div class="headimg">                    
                      <!--判断性别1男2女-->
                      <div class="avatar" v-if="item.icon" :style="{'backgroundImage': 'url('+item.icon+')'}"></div>
                      <div class="avatar boy" v-else-if="item.gender == 1"></div>
                      <div class="avatar girl" v-else></div>
                  </div>
                  <span class="name">{{item.name}}的提交</span>
                </div>
                <div class="status orange">待审核</div>
              </div>
              <div class="teammate text-overflow" v-show="item.collaborators">
                协作人: {{getCollaborators(item.collaborators)}}
              </div>
              <div class="footer flex justifySpaceBetween alignCenter">
                <div class="time">{{item.updateTime}}</div>
                <div class="btn" @click="jumpTo('/CheckStuProgress',{taskId: task.id,studentId: item.userId,classCode:item.classCode})">查看</div>
              </div>
            </li>
          </ul>          
      
          <!-- 已审核 -->
          <ul class="audit" v-show="status=='1'">
            <li class="taskbox" v-for="(item,n) in reviewedList" v-if="item.type!=7">
              <div class="header">
                <div class="stuInfo">
                  <div class="headimg">                    
                    <!--判断性别1男2女-->
                    <div class="avatar" v-if="item.icon" :style="{'backgroundImage': 'url('+item.icon+')'}"></div>
                    <div class="avatar boy" v-else-if="item.gender == 1"></div>
                    <div class="avatar girl" v-else></div>
                  </div>
                  <span class="name">{{item.name}}的提交</span>
                </div>
                <div class="status" :class="item.status=='1'?'pass':'fail'">{{item.status=='1'?'通过':'不通过'}}</div>
              </div>
              <div class="teammate text-overflow" v-show="item.collaborators">
                协作人: {{getCollaborators(item.collaborators)}}
              </div>
              <div class="footer flex justifySpaceBetween alignCenter">
                <div class="time">{{item.updateTime}}</div>
                <div class="btn" @click="jumpTo('/CheckStuProgress',{taskId: task.id,studentId: item.userId,classCode:item.classCode})">查看</div>
              </div>
            </li>
          </ul>
      
        </v-load-more>
      
        <div class="empty" v-else>
          <v-empty-list :text="'无数据'"></v-empty-list>
        </div>
      </div>
      <!-- tab-container -->
      <mt-tab-container v-model="status">
        <!-- 未提交 -->
        <mt-tab-container-item id="-1">
          <ul class="stulist flex flex-wrap" v-if="unSubmitList.length>0">
            <li class="stu" v-for="(stu,n) in unSubmitList">
              <div class="stuimg" v-if="stu.photo" :style="{'backgroundImage': 'url('+stu.photo+')'}">
              </div>
              <div v-else>
                <div class="stuimg boy" v-if="stu.gender==1"></div>
                <div class="stuimg girl" v-else></div>
              </div>
              <div class="stuName">{{stu.name}}</div>
            </li>
          </ul>
          <div class="empty" v-else>
            <v-empty-list :text="'无数据'"></v-empty-list>
          </div>
          <div class="remindBtn" :class="reminded?'grey':'orange'" v-if="unSubmitList.length>0" @click="showConfirm">{{reminded?'已提醒':'一键提醒'}}</div>
        </mt-tab-container-item>
      </mt-tab-container>
    </div>
 
    <!-- 任务内容弹层 -->
    <mt-popup
      v-model="showTaskDetail"
      position="bottom">
      <div class="popupContent">
        <div class="header flex alignCenter justifySpaceBetween">
          <div class="title">任务内容</div>
          <div class="arrowdown" @click="showTaskDetail = false"></div>
        </div>
        <div class="taskdetail" v-html="task.summary"></div>        
      </div>
    </mt-popup>
    
    <!-- 一键提醒确认弹窗 -->
    <confirm ref="tipConfirm" title="提醒内容:" activeColor="#33A5FF" @choose="handleChoose">
      <p class="myTipMsg">{{tipmsg}}</p>
    </confirm>
  </div>
</template>

<script>
  import LoadMore from '@/components/LoadMore.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import {PjApi as API} from '@/utils/api'
  import { RewardTaskApi } from '@/utils/api'
  import confirm from '../../modal/Confirm.vue'
  import Axios from 'axios'
  export default {
    name: "teacherDetail",
    props:['task','classId'],
    components:{
      confirm,
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList
    },
    data(){
      return {
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),
        classCode: '',
        status: '',
        position: 'relative',
        top: 0,
        offsetTop: 342,
        showTaskDetail: false,
        tipmsg: `[xxx]同学/家长，请及时完成[子任务名称]任务`,
        waitForReview:[],//待审核列表
        reviewedList:[],//已审核列表,
        unSubmitList:[],//未提交列表
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        page:1,
        limit: 10,
        reminded: false,
        wait: '',
        watiForSize: 0,//待审核数量
      }
    },
    async mounted() {
      await this.getMasterClasses();
      this.checkMenu();      
    },
    created() {     
      if(this.$refs.mtnavbar){
        this.offsetTop = this.$refs.mtnavbar.$el.offsetTop
      } 
      console.log(this.task,"this.task")
      console.log(this.classId,"this.classId")
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
    },
    methods:{
      // 获取待审核或已审核的数据
      async getMenuDataList(page,type,status){
        var data = {
          dimensionId: this.task.dimensionId,
          evaluationId: this.task.id,
          // evaluationObject : 1,
          evaluator: status!='0'?this.userId:null,
          // evaluatorType: 1,
          limit: this.limit,
          page: page || this.page,
          schoolCode: this.xxdm,
          classCode: this.classCode,
          status: status
        }

        if(this.classId){
          data.evaluator = null;
        }

        var res = await this.$req.post(API.getPjxRecordList,data);
        if(res.resultCode==1){
          let {dataList} = res.value;
          dataList.forEach(item=>{
            var teammates = this.getTeammate(item.userId,item.itemInfoList);
            this.$set(item,'teammates',teammates);
          })
          if(status=='0'){
            if(page==1){
              this.waitForReview = [];
            }
            this.watiForSize = res.value.totalCount;
            this.waitForReview = [...this.waitForReview, ...dataList];
          } else {
            if(page==1){
              this.reviewedList = [];
            }
            this.reviewedList = [...this.reviewedList, ...dataList];          
          }
          if (dataList.length >= this.limit) {
            console.log('page')
            this.page = page?(page+1):(this.page+1);
            this.allLoaded = true
          } else {
            this.allLoaded = false
          }  
          // 控制上拉刷新下拉加载回弹效果
          this.onLoaded(type);        
        }
        
      },
      // 获取未提交数据
      async getUnCommitList(){
        var res = await this.$req.get(API.getUnCommit,{evaluationId:this.task.id,classId: this.classCode});
        this.unSubmitList = res.value || []
        this.reminded = false;
        for(var e of this.unSubmitList){
          if(e.notifyState==1){
            this.reminded = true;
            break;
          }
        }
      },
      // 获取班主任班级
      getMasterClasses(){
        if(this.classId){
          this.classCode = this.classId
        }else{
          Axios.get(RewardTaskApi.getClassTeacherClassList+'?schoolCode='+this.xxdm+'&teacherCode='+this.userId).then((res) => {
            this.classCode = '';
            res.forEach(e=>{
              this.classCode += e.classId
              this.classCode += ','
            })
            this.classCode = this.classCode.substr(0, this.classCode.length - 1);        
          })
        }
      },
      /*
      * 上拉刷新下拉加载
      * @param page 当前页码
      * */
      loaded (page) {
        this.allLoaded = page ? true : this.allLoaded
        let type = page ? 'loadTop' : 'loadBottom'
        if(this.status == '') {
          this.waitForReview = page ? [] : this.waitForReview;
          this.getMenuDataList(page, type, '0')
        } else {
          this.reviewedList = page ? [] : this.reviewedList;
          this.getMenuDataList(page, type, '1,-1')
        }
      },
      // 控制上拉刷新下拉加载回弹效果
      onLoaded(type) {
        if (type == 'loadTop') {
          !!this.timer && clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.$refs.loadMore.onTopLoaded()
          }, 300)
        } else if (type == 'loadBottom') {
          this.$refs.loadMore.onBottomLoaded()
        }
      },
      // 检查位置
      checkMenu(val){
        var top = this.$refs.mtnavbar.$el.getBoundingClientRect().y;
        console.log(top,236)
        if(top<0){
          this.position = 'fixed'
        } else {
          if(val&&this.offsetTop-val.srcElement.scrollTop>=50){
            this.position = 'relative'            
          }
        }    
      },
      showConfirm(){
        if(this.reminded){
          return
        }
        this.tipmsg = `[xxx]同学/家长，请及时完成 ${this.task.name} 任务`
        this.$refs.tipConfirm.showModal();
      },
      async handleChoose(value){
        if(value){
          // 确认提醒
          this.reminded = true;
          // notifyStudents
          var data={
            evaluationId: this.task.id,
            students:''
          }
          this.unSubmitList.forEach(e=>{
            data.students+=e.studentId;
            data.students+=',';
          })
          data.students = data.students.substr(0, data.students.length - 1);  
          console.log(data,272)
          var res = await this.$req.get(RewardTaskApi.notifyStudents,data);
          if(res.resultCode==1){
            this.$toast(res.resultMessage)
            this.getUnCommitList();
          }
        }
      },
      getTeammate(authorId,itemInfoList){
        var teammates = '';
        itemInfoList.forEach(e=>{
          if(e.name&&e.userId!=authorId&&teammates.indexOf(e.name)<0){
            teammates+=e.name;
            teammates+='、';
          }
        })
        if(teammates.length>0){
          teammates = teammates.substr(0, teammates.length - 1);  
        }
        return teammates;
      },
      getCollaborators(arr){
        var res = '';
        if(arr){
          arr.forEach(e=>{
            res += e.name;
            res += '、'
          })
          if(arr.length>0){
            res = res.substr(0, res.length - 1); 
          }           
        }       
        return res;
      },
      jumpTo(path,query){
        this.$router.push({path,query});
      }
    },
    watch:{
      task(val){
        if(this.classCode!=''){
          console.log(349)
          this.getMenuDataList(1,'','0');
          this.wait = '';
        } else {
          this.wait = 'classCode';
        }       
      },
      classCode(val){
        if(this.task&&this.wait=='classCode'){
          console.log(356)
          this.getMenuDataList(1,'','0');
        }
      },
      status(val){
        console.log(361)
        if(val==''){
          this.waitForReview = []
          this.getMenuDataList(1,'','0');
        } else if(val=='1'){
          this.reviewedList = []
          this.getMenuDataList(1,'','1,-1');
        } else if(val=='-1'){
          this.getUnCommitList();
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .teacherDetail{
    .taskInfo{
      padding: 30px 32px 32px 32px;
      background-color: #FFFFFF;
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
        }
      }
      .content{
        font-size:28px;
        line-height:40px;
        font-weight:400;
        color: #AEB6C1;
      }
    }
    .tabs{
      margin-top: 20px;
      background-color: #fff;
      .navbar{
        height: 88px;
      }
      .mtnavbar{
        z-index: 999;
        background-color: #fff;
        width: 100%;
        height: 88px;
        margin: 0 auto;
        border-top: 1px solid rgba(239,241,243,1);
        .tip{
          padding: 8px 20px;
          background:rgba(255,123,18,1);
          border-radius:24px 24px 24px 4px;
          position: absolute;
          color: #fff;
          font-size:20px;
          line-height: 24px;
          font-weight:bold;
          left: 166px;
          top: 4px;
        }
        .selectbar{
          font-size: 30px;
          line-height: 64px;
          color: rgba(182,184,184,1);
        }
        .mint-tab-item{
          margin: 0;
          line-height: 34px;
        }
        .is-selected{
          border: 0;
          &::after{
            content: '';
            display: inline-block;
            width: 40px;
            height: 4px;
            background: rgba(51,165,255,1);
            border-radius: 2px;
            position: relative;
            top: -18px;
          }
          .selectbar{
            font-size: 30px;
            font-weight: 600;
            line-height: 64px;
            color: rgba(38,38,39,1);
          }
        }
      }
    }
  }
  .audit{
    padding: 0 32px;
    .taskbox{
      padding: 40px 0;
      position: relative;
      border-bottom: 1px solid #EFF1F3;
      &:last-child{
        border-bottom: 0px;
      }
      .header{
        .stuInfo{
          font-size:36px;
          font-weight:800;
          .headimg{
            height: 48px;
            width: 48px;
            margin-right: 10px;
            display: inline-block;
            position: relative;
            top: 10px;
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
        .status{
          font-size: 32px;
          font-weight: 800;
          position: absolute;
          top: 24px;
          right: 0px;
        }
        .orange{
          color: #FFB600;
        }
        .pass{
          color: #00CD86;
        }
        .fail{
          color: #FF7B12;
        }
      }
      .teammate{
        font-size:28px;
        font-weight:400;
        color: #B6B8B8;
        margin-top: 20px;
      }
      .footer{
        .time{
          font-size:28px;
          font-weight:400;
          color: #B6B8B8;          
        }
        .btn{
          width:174px;
          height:64px;
          border-radius:44px;
          font-size:28px;
          font-weight:400;
          color: #fff;
          line-height: 64px;
          text-align: center;
          background-color: #33A5FF;
        }
      }
    }
  }
  .stulist{
    padding: 0 14px 0 16px;
    margin-bottom: 120px;
    .stu{
      width: 100px;
      height: 160px;
      margin: 40px 40px 0 40px;
      .stuimg{
        height: 100px;
        width: 100px;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        border-radius: 50%;
      }
      .boy {
        background-image: url("/static/img/boy@2x.png");
      }
      .girl {
        background-image: url("/static/img/girl@2x.png");
      }
      .stuName{
        font-size:28px;
        font-weight:400;
        color: #292D33;
        margin-top: 20px;
        text-align: center;
      }
    }
  }
  .remindBtn{
    width:320px;
    height:88px;
    border-radius:44px;
    font-size:32px;
    font-weight:400;
    line-height: 88px;
    text-align: center;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }
  .remindBtn.orange{
    color: #FFFFFF;
    background-color: #FF7B12;
  }
  .remindBtn.grey{
    color: #969899;
    background-color: #EFF1F3;
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
    }
  }
  .empty {
    position: relative;
    height: 600px;
  }
  
  .myTipMsg{
    font-size:32px;
    line-height:48px;
    color:rgba(41,45,51,1);
    padding: 48px 46px 50px 48px;
    word-break: break-all;
  }
</style>
