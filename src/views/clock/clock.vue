<template>
    <div class="warp">
      <div class="head">
        <div class="heab-bg"></div>
        <div class="head-box">
          <div class="title flex justifySpaceBetween alignCenter">
            <div class="name text-overflow">{{info.name}}</div>
            <div class="status yellow">进行中</div>
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

      <div class="warp-content scrollY">
        <div class="top" :style="{'height': classInfoList.length === 0?'60px':'298px'}">
          <div class="control-bar flex justifySpaceBetween alignCenter">
            <!-- <div class="icon-ask" @click="goRules"></div> -->
            <div class="picker-group flex justifyCenter alignCenter">
              <div class="btn-pickerdate" @click="showPicker=true">{{nowDate}}</div>
              <div class="btn-pickertime" @click="showTimePicker=true">{{nowTime}}</div>
            </div>
          </div>

         
          
          <div class="echart-box flex flex-column justifyCenter" v-show="classInfoList.length > 0">
            <echarts-clock :minCount="cardCount" :maxCount="normalCount"></echarts-clock>
            <div class="status-bar flex">
              <!-- <div class="status-item flex flex-column alignCenter" v-if="nowTime == '全天'" @click="goAbnormal('未打卡',notClockCount)">
                <div class="number">{{notClockCount}}</div>
                <div class="name">未打卡</div>
              </div> -->
              <div class="status-item flex flex-column alignCenter" @click="goAbnormal('缺打卡',noCardCount)">
                <div class="number">{{noCardCount}}</div>
                <div class="name">缺打卡</div>
              </div>
              <div class="status-item flex flex-column alignCenter" v-if="nowTime == '全天' || nowTime.indexOf('进校') != -1" @click="goAbnormal('迟到',lateCount)">
                <div class="number">{{lateCount}}</div>
                <div class="name">迟到</div>
              </div>
              <div class="status-item flex flex-column alignCenter" v-if="nowTime == '全天' || nowTime.indexOf('离校') != -1" @click="goAbnormal('早退',earlyCount)">
                <div class="number">{{earlyCount}}</div>
                <div class="name">早退</div>
              </div>
              <div class="status-item flex flex-column alignCenter" @click="goAbnormal('请假',leaveCount)">
                <div class="number">{{leaveCount}}</div>
                <div class="name">请假</div>
              </div>
            </div>
          </div>
        </div>
        <div class="content marginBottom" v-show="classInfoList.length > 0">
          <div class="title flex justifySpaceBetween">
            <div class="name">考勤明细（共{{classInfoList.length}}个班级，{{studentCount}}人）</div>
            <div class="btn-sort" @click="sortList">排序<i class="icon-sort"></i></div>
           
          </div>
          <class-list :id="id" :classInfoList="classInfoList" :nowTime="nowTime" :date="date" :listType="1"></class-list>
        </div>
       
        <div class="empty" v-if="classInfoList.length === 0">
          <!-- <img src="img/empty.png" alt=""> -->
          <p class="tips">{{( nowTime == '全天') ? '今日不需要考勤哦~': (new Date(this.nowDate.replace(/\./g,'/')).getTime() != new Date(new Date().getFullYear()+'/'+(new Date().getMonth()+1)+'/'+new Date().getDate()).getTime() ?'今日不需要考勤哦~':'该时间段还未到~')}}</p>
        </div>
        <!-- <div class="tabber flex">
          <div @click="changeTab(1)" :class="{'activeTabber':tabber==1}">日</div>
          <div @click="changeTab(2)" :class="{'activeTabber':tabber==2}">周</div>
          <div @click="changeTab(3)" :class="{'activeTabber':tabber==3}">月</div>
        </div> -->
        
      </div>
      <date-picker @sure="datePickerSure" type="date" message="一次查询的时间不能超过当前学年" minDate="9" :pickerType="0" :currentDate="nowDate"></date-picker>
      <time-picker @sure="timePickerSure" :current="nowTime" :timeQuantum="timeQuantum"></time-picker>
    </div>
</template>

<script>
  import echartsClock from './components/echartsClock'
  import datePicker from './components/datePicker'
  import formatDate from '@/utils/formatDate/formatDate'
  import classList from './components/classList'
  import timePicker from './components/timePicker'
  import {PjApi,MedalApi} from '@/utils/api'
  export default {
    name: 'clock',
    data() {
      return {
        //tabber:1
        userId:this.$cookie.get("xxtyhh"),
        school: this.$cookie.get("xxdm"),
        date: formatDate(new Date().getTime(),'yyyy-MM-dd'),
        showPicker: false,
        showTimePicker: false,
        nowDate: formatDate(new Date().getTime(),'yyyy-MM-dd'),
        nowTime: '全天',
        TYPE_LIST: ['全天','上午进校', '上午离校', '下午进校', '下午离校', '晚上进校','晚上离校'],
        curTab: 1,
        statusList: [],
        classInfoList: [],
        classList: [],
        noCardCount: 0, // 缺卡
        lateCount: 0, // 迟到
        leaveCount: 0, // 请假
        notClockCount: 0, // 未打卡
        earlyCount: 0, // 早退
        normalCount: 0, // 应打卡
        cardCount: 0, // 已打卡
        studentCount: 0, // 已打卡
        sortRule: true, // 正序
        loading: true,
        timeQuantum: [],
        info:[],
        medalName:'',
        id:this.$route.query.id
      }
    },
     components: {
      echartsClock,
      datePicker,
      classList,
      timePicker
    },
    activated() {
      this.getInit();
      this.getpjInfo();
    },
    methods: {
      // changeTab(tab){
      //   this.tabber = tab
      // }
      getTimeQuantum() {
        let param = {
          userId: this.userId,
          school: this.school,
          date: this.nowDate,
          cmd: 'student'
        }
        console.log(this.nowDate,88777)
        this.$axGet('KaoqingGetTeacherOrStudentDayStateList',param).then(res => {
          if(res.ResultCode === 1) {
            let timeQuantum = []
            res.Value.forEach((item,index) => {
              if(index === 0) {
                timeQuantum.push('全天')
              }
              timeQuantum.push(item.Value)
            })
            this.timeQuantum = timeQuantum
          }
        })
      },
      getInit() {
        window.scrollTo(0,0)
        setTimeout(() => {
          window.scrollTo(0,1)
        },100)
        
        // 看板入口获取的时间段
        let kqSate = 0;
        
        // this.nowDate = formatDate(new Date().getTime(),'yyyy-MM-dd')
        // this.date = formatDate(new Date().getTime(),'yyyy-MM-dd')
        this.classInfoList = []
        this.loading = true
        this.getTimeQuantum()
        let param = {
           userId: this.userId,
           school: this.school,
           date: this.date,
           itemDayState: this.TYPE_LIST.indexOf(this.nowTime),
        }
        this.$axGet('KaoqingGetClassListRangeByDate', param).then(res => {
          if(res.ResultCode === 1) {
            this.classInfoList = res.Value
            if(!this.classInfoList || this.classInfoList.length === 0) {
              this.loading = false
              return
            }
            
            let studentCount = 0 // 学生人数
            let noCardCount = 0 // 缺卡
            let lateCount = 0 // 迟到
            let leaveCount = 0 // 请假
            let notClockCount = 0 // 未打卡
            let earlyCount = 0 // 早退
            let normalCount = 0 // 应打卡
            let cardCount = 0 // 已打卡
            let nowDateTime = new Date()
            this.classInfoList.forEach((item,index) => {
              this.$set(item,'isOpen',false)
              studentCount += item.MemberNum
              item.RangList.forEach((itm,inx) => {
                if(itm.KaoQinInfoList && itm.KaoQinInfoList.length > 0) {
                  console.log(itm,777)
                  itm.KaoQinInfoList.forEach(stateItem => { // 获取各状态人数
                    switch(stateItem.Type) {
                      case 1:
                        this.$set(item,'cardCount',stateItem.Count) // 打卡
                        cardCount += stateItem.Count
                        break;
                      case 2:
                        notClockCount += stateItem.Count
                        break;
                      case 3:
                        lateCount += stateItem.Count
                        break;
                      case 4:
                        earlyCount += stateItem.Count
                        break;
                      case 5:
                        leaveCount += stateItem.Count
                        break;
                      case 10:
                        this.$set(item,'normalCount',stateItem.Count) // 应打卡
                        normalCount += stateItem.Count
                        break;
                      case 11:
                        noCardCount += stateItem.Count
                        break;
                    }
                  })
                }
              })
              this.$set(item,'percent',parseInt(item.cardCount/(item.normalCount?item.normalCount:1)*100))
            })
            this.noCardCount = noCardCount // 缺卡
            this.lateCount = lateCount // 迟到
            this.leaveCount = leaveCount // 请假
            this.notClockCount = notClockCount // 未打卡
            this.earlyCount = earlyCount // 早退
            this.normalCount = normalCount // 应打卡
            this.cardCount = cardCount // 已打卡
            this.studentCount = studentCount // 
          }else {
            
            this.$toast('网络不太给力哦，检查一下您的网络再试吧~')
          }
          this.loading = false
        }).catch(err => {
          this.$toast('网络不太给力哦，检查一下您的网络再试吧！')
          this.loading = false
        })
      },
      /**
       * 日期选择
       */
      datePickerSure(date) {
        this.nowDate = date
        this.date = date
        this.getInit()
      },
      /**
       * 时段选择
       */
      timePickerSure(time) {
        this.nowTime = time;
      
        this.getInit()
      },
    
      /**
       * 排序按钮
       */
      sortList() {
        if(this.classInfoList.length <= 1) {
          return
        }
        this.sortRule = !this.sortRule
        if(this.sortRule) {
          
          this.classInfoList.sort(function (o1,o2) {
            let v1 = o1.percent
            let v2 = o2.percent
            if(v1 > v2) {
              return 1
            }else if(v1 < v2) {
              return -1
            }else {
              return 0
            }
          })
        }else {
          this.classInfoList.sort(function (o1,o2) {
            let v1 = o1.percent
            let v2 = o2.percent
            if(v1 > v2) {
              return -1
            }else if(v1 < v2) {
              return 1
            }else {
              return 0
            }
          })
        }
        
      },
      goAbnormal(type,count) {
        console.log(type,6666)
        if(count > 0) {
          
          let list = [
            {status: '未打卡',count: this.notClockCount,type:2},
            {status: '缺打卡',count: this.noCardCount,type:11},
            {status: '迟到',count: this.lateCount,type:3},
            {status: '早退',count: this.earlyCount,type:4},
            {status: '请假',count: this.leaveCount,type:5},
          ]
          if(this.nowTime.indexOf('进校') != -1) {
            list.splice(0,1)
            list.splice(2,1)
          }else if(this.nowTime.indexOf('离校') != -1){
            list.splice(0,1)
            list.splice(1,1)
          }
         
          this.$router.push('/abnormalClock')
        }else {
          switch (type) {
           
            case '迟到':
              this.$toast('大家都很准时')
              break
            case '未打卡':
              this.$toast(`没有学生${type}`)
              break
            case '缺打卡':
              this.$toast(`没有学生${type}`)
              break
            case '早退':
              this.$toast(`没有学生${type}`)
              break
            case '请假':
              this.$toast(`没有学生${type}`)
              break
          }
        }
        
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
    }
  }
</script>

<style lang="less" scoped>
  .warp{
    width: 100%;
    height: 100%;
    background-color: #33A5FF;
    .marginBottom{
      margin-bottom: 160px;
    }
    .head {
      position: relative;
      height: 350px;
      margin-bottom: 32px;
      .heab-bg {
        position: absolute;
        z-index: 10;
        left: 50%;
        top: 20px;
        transform: translateX(-50%);
        width: 622px;
        height: 306px;
        background: rgba(255,255,255,.3);
        border-radius: 20px;
      }
      .head-box {
        position: absolute;
        z-index: 11;
        left: 50%;
        top: 32px;
        transform: translateX(-50%);
        width: 100%;
        height: 340px;
        background-color: #ffffff;
        border-radius: 20px;
        background-image: url(img/juxing@2x.png);
        background-repeat: no-repeat;
        background-size: 32px auto;
        background-position: center 12px;
        .title {
          padding: 32px 20px;
          .name {
            width: 500px;
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
    .warp-content{
      width: 686px;
      margin:50px auto;
      background-color: #fff;
      border-radius: 20px;
      height: 900px;
      // .tabber{
      //   width:300px;
      //   height:60px;
      //   background:rgba(239,241,243,1);
      //   border-radius: 34px;
      //   font-size:28px;
      //   line-height:60px;
      //   color:rgba(182,184,184,1);
      //   margin:20px;
      //   div{
      //     width:100px;
      //     text-align: center;
      //   }
      //   .activeTabber{
      //     width:100px;
      //     height:60px;
      //     background:rgba(51,165,255,1);
      //     border-radius:34px;
      //     color:rgba(255,255,255,1);
      //   }
      // }
     
        .empty{
          width: 260px;
          margin: 45% auto 0;
          text-align: center;
          font-size: 28px;
          color:rgba(51,51,51,0.40);
          img{
            width: 100%;
          }
        }
        .top{
          padding: 20px 16px;
          box-sizing: border-box;
          width: 100%;
          height: 298px;
          background: #fff;
         
          .picker-group{
            font-size: 26px;
            color:rgba(38,38,38,0.60);
            .btn-pickerdate{
              position: relative;
              height: 20px;
              line-height: 20px;
              margin-right: 40px;
              &::after{
                content: "";
                position: absolute;
                top: -18px;
                right: -35px;
                margin: 20px;
                border-right:1.5px solid rgba(38,38,38,0.60);
                border-bottom: 1.5px solid rgba(38,38,38,0.60);
                width: 8px;
                height: 8px;
                transform: rotate(45deg);
                -o-transform: rotate(45deg);
                -webkit-transform: rotate(45deg);
                -moz-transform: rotate(45deg);
                -ms-transform: rotate(45deg);
              }
            }
            .btn-pickertime{
              position: relative;
              height: 20px;
              line-height: 20px;
              margin-right: 18px;
              &::after{
                content: "";
                position: absolute;
                top: -18px;
                right: -35px;
                margin: 20px;
                border-right:1.5px solid rgba(38,38,38,0.60);
                border-bottom: 1.5px solid rgba(38,38,38,0.60);
                width: 8px;
                height: 8px;
                transform: rotate(45deg);
                -o-transform: rotate(45deg);
                -webkit-transform: rotate(45deg);
                -moz-transform: rotate(45deg);
                -ms-transform: rotate(45deg);
              }
            }
          }
          .status-bar{
            justify-content: space-around;
            .number{
              font-size: 32px;
              color: #FFA005;
              font-weight: bold;
            }
            .name{
              font-size: 30px;
              color: rgba(51,51,51,0.60);
            }
          }
        }
        .content{
          padding: 0 16px;
          padding-bottom: 100px;
          margin-top: 12px;
          box-sizing: border-box;
          width: 100%;
          .title{
            color:rgba(51,51,51,0.60);
            font-size: 30px;
            .btn-sort{
              font-size: 32px;
              
              .icon-sort{
                margin-left: 6px;
                display: inline-block;
                width: 30px;
                height: 20px;
                background-image: url('img/icon_sort.png');
                background-repeat: no-repeat;
                background-size: contain;
                vertical-align: middle;
              }
            }
          }
        }
    }
    .flex{
      display: flex;
    }
  }
</style>