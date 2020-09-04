<<template>
  <div class="warp">
    <div  class="warp-top clear">
      <div class="top-left flex fl">
        <img :src="clockInfo.Avatar"/><p class="name">{{clockInfo.Truename}}</p>
      </div>
      <div class="top-right flex fr">
        <img v-if="medal != 0" class="medalDimensionIcon" :src="info.medalDimensionIcon" />
        <p>{{medal == 0 ? '' : '累计已得'+ medal + '枚'}} {{score == 0 ? '' : '累计已得'+ score + '分'}}</p>
      </div>
     <datePicker :minDate="'9'" :pickerType="0" @sure="sure" :type="'date'" :message="'一次查询的时间不能超过当前学年'" :currentDate="clockDate.replace(/\-/g,'.')"></datePicker>
       
      
    </div>
    <p class="data-p" @click="showPicker = !showPicker">{{clockDate.replace(/\-/g,'.')}}</p>
    <div class="head" v-if="userType>3">
    
      <div class="head-box">
        <div class="title flex justifySpaceBetween alignCenter">
          <div class="name">{{info.name}}</div>
           <p class="status yellow">进行中</p>
        </div>
        <p class="headTitle" v-if="info.evaluationItemRuleAttendance != undefined">{{info.evaluationItemRuleAttendance.type == 1 ? '进校打卡' : '进/出校门打卡'}}</p>
        <div class="infolist">
          <div class="info flex alignCenter">
            <div class="icon star"></div>
            <div class="content">{{medalName}}</div>
          </div>
          <div class="info flex alignCenter" v-if="info.evaluationItemRuleFrequency">
          <div class="icon time"></div>
          <div class="content" v-if="info.evaluationItemRuleFrequency.type == 1">长期，仅一次</div>
          <div class="content" v-else-if="info.evaluationItemRuleFrequency.type == 2">长期，每天{{info.evaluationItemRuleFrequency.count}}次</div>
          <div class="content" v-else-if="info.evaluationItemRuleFrequency.type == 3">长期，每周{{info.evaluationItemRuleFrequency.count}}次</div>
          <div class="content" v-else-if="info.evaluationItemRuleFrequency.type == 4">长期，每月{{info.evaluationItemRuleFrequency.count}}次</div>
          <div class="content" v-else>长期，每学期{{info.evaluationItemRuleFrequency.count}}次</div>
        </div>
          <div class="info flex alignCenter" v-if="info.evaluationItemRuleScoreList">
          <div class="icon score"></div>
          <span class="content" v-for="(item,index) in info.evaluationItemRuleScoreList" :key="index">
            <span v-if="item.type == 1">每次{{item.score}}{{item.rewardType == 1 ? '分' : '枚'}}</span>
            <span v-if="item.type == 2">全部完成{{item.score}}{{item.rewardType == 1 ? '分' : '枚'}}</span>
          </span>
        </div>
        </div>
      </div>
    </div>



    <div class="warp-leave flex" @click="leaveDetail(item)" v-for="(item,index) in clockInfo.LeaveList" :key="index+'q'">
      <img src="./img/leave.png"/>
      <div>
        <p class="name">{{item.LeaveTypeName || '请假'}}</p>
        <p class="leave-value">{{item.Begin}} ~ {{item.End}}</p>
      </div>
    </div>
    <div class="stepsWarp" v-if="clockInfo != null">
      <steps v-for="(item,index) in clockList" :clockData="item" :key="index" :keyIndex="index" :showMontant="index == (clockList.length-1) ? false : true"  class="com-steps" :isTody="isTody" @rerender="getclockLog" :dataLength="clockList.length" :userName="clockInfo.Truename" :userCode="clockInfo.UserId"></steps>
    </div>
    
    <empty class="emptyDiv" :emptyText="'今日不需要考勤哦~'" v-if="!clockInfo.IsEnabled && clockInfo.LogList == null"></empty>
    <empty class="emptyDiv" :emptyText="'暂无考勤数据~'" v-if="clockInfo.IsEnabled && (clockInfo.LogList == null ||clockList.length ==0)"></empty>
  </div>
</template>
<script>
import steps from './components/steps'
import datePicker from './components/datePicker'
import formatDate from '@/utils/formatDate/formatDate'
import empty from './components/empty'
import {PjApi,MedalApi} from '@/utils/api'
export default {
  components:{steps,datePicker,empty},
  data(){
    return{
      showPicker:false,
      clockDate:formatDate(new Date().getTime(),'yyyy-MM-dd'),
      isBZR: null,
      schoolCode: '',
      loginUser: '',
      clockInfo:[],
      clockList:[],
      isTody:true,
      roleType:0,
      loadingFinish:false,
      classcode:'',
      canLeave:false,
      timeCount: 0, // 有效时间段个数
      score:0,
      medal:0,
      userType:this.$cookie.get("userType"),
      info:[],
      medalName:''
    }
  },
  activated() {
    this.loginUser = this.$route.query.userid;
    this.schoolCode = this.$route.query.schoolcode;
    this.clockDate = this.$route.query.clockdate;
    this.classcode = this.$route.query.classcode
    this.isTody = this.clockDate == formatDate(new Date().getTime(),'yyyy-MM-dd') ?true :false
    this.getnum();
    this.getclockLog();
    
    this.getpjInfo();
    
   
  },
  
  methods: {
    sure(val){
      this.clockDate = val;
      if(val == formatDate(new Date().getTime(),'yyyy-MM-dd')){
        this.isTody = true
      }else{
        this.isTody = false
      }
      
      this.getclockLog()
    },
   
    
    getclockLog(){
      this.canLeave = false;
      this.clockList = []
      let param = {
        schoolcode: this.schoolCode, // 学校编号
        loginuser:this.loginUser, // id
        kqdate: this.clockDate,
        isalllog:0
      }
      let nowDay = this.clockDate;
      this.$axGet('KaoQinGetUserKaoQinLog',param).then(res => {
        if(res.ResultCode === 1) {
          this.clockInfo = res.Value;
          if(this.clockInfo.LeaveList && this.clockInfo.LeaveList.length > 0){
            this.clockInfo.LeaveList.forEach((s,m)=>{// 判断请假时间是否超过当前所选的开始时间和结束时间  如果超过则不显示代请假按钮  不超过则需要显示代请假按钮
              let t1 = new Date(s.Begin.replace(/-/g, "/")).getTime(),
                  t2 = new Date((nowDay+' '+this.clockInfo.LogList[0].JudgeTimes.Time1).replace(/-/g, "/")).getTime(),
                  t3 = new Date(s.End.replace(/-/g, "/")).getTime(),
                  t4 = new Date((nowDay+' '+this.clockInfo.LogList[this.clockInfo.LogList.length-1].JudgeTimes.Time2).replace(/-/g, "/")).getTime();
              if(t2  >= t1 && t4 <= t3 ){
                this.canLeave = true;
              }
            })
          }
          if(this.clockInfo == null){
            this.clockList = [];
          }else{
            let nowDate = new Date().getTime();
            if(!this.clockInfo.LogList) {
              this.loadingFinish = true;
              return
            }
            //  打卡步骤只显示小于当前时间的数据
            this.clockList = this.clockInfo.LogList.filter((item,index)=>{
              item.showStatus = true;
              if(this.clockInfo.LogList.length === 1) {
                return true
              }else {
                return nowDate >= new Date((nowDay+' '+item.JudgeTimes.Time1).replace(/-/g, "/")).getTime()
              }
            })
            if (this.clockList.length == 6 ||this.clockList.length == 0){
              this.loadingFinish = true;
              return;
            } 
            
            let length = this.clockList.length -1;
            this.timeCount = length
            //如果上一个打卡的状态是正常、迟到或早退  那么需要显示下一个时间段的数据(不需要判断当前时间是否超过上一个打卡时间点)
            //否则当前时间超过上一个打卡时间段才显示下一个时间段的信息
            if(this.clockList[length].CardState == 1 || this.clockList[length].CardState == -2 ){
              this.clockInfo.LogList[length+1] ? this.clockList.push(this.clockInfo.LogList[length+1]):null
            }else{
              if(nowDate > new Date((nowDay+' '+this.clockList[length].JudgeTimes.Time2).replace(/-/g, "/")).getTime()){
                this.clockInfo.LogList[length+1]? this.clockList.push(this.clockInfo.LogList[length+1]):null
              }
            }
          }
          
        }else{
          this.$toast(res.ResultMessage)
        }
        this.loadingFinish = true
      }).catch(err => {
        console.log(err)
        this.$toast('网络不太给力哦，检查一下您的网络再试吧!')
        this.loadingFinish = true
      })
    },
    
    //获取勋章
    getnum() {
      let data={
        schoolCode:this.schoolCode,
        userId:this.loginUser,
        type:2,
        evaluationId:this.$route.query.id
      }
      this.score = 0;
      this.medal = 0;
      this.$req.get(PjApi.getAllRecordList, data).then(res=>{
        if(res.resultCode == 1){
          res.value.forEach(i=>{
            if(i.score){
              this.score += i.score;
            }
            if(i.medal){
              this.medal += i.medal;
            }
            
          })
        }
      }).catch(err=>{
        console.log(err,222222222)
      });
    },
    /* 获取评价项信息 */
    getpjInfo(){
      this.$req.get_special(PjApi.getDetail, this.$route.query.id).then(res=>{
        if (res.resultCode == 1) {
          this.info = res.value;
          this.getMedalDetailsByDimension(res.value.dimensionId)
        }
      });
    },
    /*
      获取勋章名称
    */
    async getMedalDetailsByDimension(dimensionId) {
      let data = {dimensionId}
      const res = await this.$req.get(MedalApi.getMedalDetailsByDimension, data)
      if (res.resultCode == 1) {
        this.medalName = res.value[0].name
      }
    },
  },

}
</script>
<style lang="less" scoped>
  .warp{
    width: 100%;
    padding: 16px;
    overflow-y: scroll;
    height: 100%;
    position: relative;
    background:#fff;
    .status {
      font-size: 36px;
      font-weight: 600;
      text-align: right;
    }
    .yellow {
      color: #FFB600;
    }
    .warp-top{
      height: 80px;
      margin-bottom: 18px;
      .top-left{
       
        .name{
          font-size: 28px;
          color:#262626;
          font-weight: 800;
          line-height:80px;
        }
       
        img{
          width: 70px;
          height: 70px;
          margin-right: 10px;
          border-radius:50%;
        }
        .check-handel{
          color:#586A94;
          font-size: 22px;
          font-weight: 500;
          margin-top:4px;
        }
      }
      .top-right{
        // width: 45%;
        margin-right: 40px;
        margin-top:20px;
        font-size: 26px;
        img{
          width: 40px;
          height: 40px;
          margin-right: 10px;
        }
        font-size: 28px;
        
      }
      
    }
    .data-p{
      font-size: 28px;
      color:#00cd86;
      position: relative;
      text-align: left;
      margin-left: 20px;
      margin-bottom:20px;
      width: 160px;
    }
    .data-p::after{
      content: "";
      position: absolute;
      top: -10px;
      right: -35px;
      margin: 20px;
      border-right:1.5px solid #00CD86;
      border-bottom: 1.5px solid #00CD86;
      width: 8px;
      height: 8px;
      transform: rotate(45deg);
      -webkit-transform: rotate(45deg);
    }
    .warp-leave{
      height: 140px;
      img{
        width: 44px;
        height: 44px;
        margin-right: 4px;
      }
      .name{
        font-size: 31px;
        color:#262626;
        font-weight: bold;
        margin-bottom:4px;
        width: 120px;
        position: relative;
      }
      .name::after{
        content: "";
        position: absolute;
        top: -4px;
        right: -12px;
        margin: 20px;
        border-right:2px solid #262626;
        border-bottom: 2px solid #262626;
        width: 8px;
        height: 8px;
        transform: rotate(-45deg);
        -webkit-transform: rotate(-45deg);
      }
      .leave-value{
        font-size: 28px;
        font-family:ALIBABA Font;
        color:#333333;
      }
    }
    .com-steps{
      margin-top:-2px;
    }
    .com-logs{
      padding-bottom: 50px;
    }
   
    .emptyDiv{
      height:430px;
    }
  }
  .head {
      position: relative;
      height: 350px;
      margin-bottom: 22px;
     // background-color: #26a2ff;
     
      .head-box {
        position: absolute;
        z-index: 11;
        left: 45%;
        top: 12px;
        margin-left: -343px;
        width: 730px;
        background-color: #ffffff;
        border-radius: 20px;
        
        .title {
          padding: 22px 20px;
          .name {
            color: #262727;
            font-size: 36px;
            font-weight: 600;
          }
          .status {
            font-size: 36px;
            font-weight: 600;
          }
          .yellow {
            color: #FFB600;
          }
          .gray {
            color: #B6B8B8;
          }
        }
        .infolist {
          padding: 0 20px;
          .info {
            margin-bottom: 20px;
          }
          .icon {
            width: 28px;
            height: 28px;
            margin-right: 20px;
            background-repeat: no-repeat;
            background-size: 28px auto;
            background-position: center;
          }
          .star {
            background-image: url(img/star@2x.png);
          }
          .time {
            background-image: url(img/time@2x.png);
          }
          .score {
            background-image: url(img/score@2x.png);
          }
          .content {
            color: #B6B8B8;
            font-size: 28px;
          }
        }
      }
      .headTitle{
        font-size:28px;
        line-height:40px;
        color:rgba(38,39,39,1);
        padding:2px 20px 20px 20px;
      }
    }
    .stepsWarp{
      margin-bottom:50px;
    }
</style>