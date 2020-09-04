<template>
  <div class="classList">
    <div class="list">
      <div v-for="(item,index) in myList" :key="item.code" class="hidden">
        <div class="class-item" ref="class-item" >
          <div class="per flex flex-column alignCenter justifyCenter">
            <div class="per-name">打卡率</div>
            <div class="per-number">{{ item.percent+ '%'}}</div>
          </div>
          <div class="class-item-title">{{item.Name}}<span class="number">({{item.MemberNum}}人)</span></div>
          <div class="status-group flex alignCenter" v-if="item.RangList[0]">
            <div class="status-item flex alignCenter" :style="{'width': nowTime=='全天'?'24.33333%':'33.33333%'}" v-for="stateItem in item.RangList[0].KaoQinInfoList" :key="stateItem.Type" v-if="(nowTime.indexOf('进校') != -1?(stateItem.Type=== 4 || stateItem.Type=== 2 ?false:true):(nowTime.indexOf('离校') != -1?(stateItem.Type=== 3 || stateItem.Type=== 2 ?false:true):true))">
              <div class="name">{{['','已打卡','未打卡','迟到','早退','请假','事假','公差','病假','无需考勤','应打卡','缺打卡'][stateItem.Type]}}</div>
              <div class="number">&nbsp;{{stateItem.Count}}</div>
            </div>
          </div>
          <div class="student-list" v-if="item.isOpen">
            <div class="list-loading" v-if="listLoading"></div>
            <p class="text-empty" v-if="studentNoClock(studentList)">{{listType== 1?'暂无学生数据':'暂无教师数据'}}</p>
            <div class="student-item flex justifySpaceBetween alignCenter" v-for="studentItem in studentList" :key="studentItem.UserId"  @click="goDetail(studentItem,item.Code)">
              <div class="student-item-name ellipsis">{{studentItem.Name}}</div>
              <div class="status" :style="{'color':studentItem.List[0].cmdType==1|| studentItem.List[0].cmdType==13?'rgba(51,51,51,0.60)':(studentItem.List[0].cmdType==12?'rgba(51,51,51,0.40)':'#FF9900')}" v-if="studentItem.List && studentItem.List.length > 0"><template v-for="(stateItem,stateIndex) in studentItem.List">{{(studentItem.List.length >1 && stateIndex>0 && (stateItem.cmdTypeName != '未考勤' && stateItem.cmdTypeName != '无需考勤')?',':'')+(stateItem.cmdTypeName == '未打卡' && nowTime != '全天' ?'':(studentItem.List.length >1 && stateItem.cmdTypeName == '未考勤'?'':(stateItem.cmdTypeName == '无需考勤'?'':stateItem.cmdTypeName)))}}</template></div>
              <div class="status" style="color:rgba(51,51,51,0.40);" v-else></div>
            </div>
          </div>
          <div class="btn-open" :style="{'bottom':!item.isOpen?'8px':'8px','transform': item.isOpen?'rotate(180deg)':'rotate(0deg)'}" @click.self="getStudentList(item,index)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'classList',
    data() {
      return {
        myList: [],
        userId: this.$cookie.get("xxtyhh"),
        school: this.$cookie.get("xxdm"),
        TIME_TYPE_LIST:['全天','上午进校', '上午离校', '下午进校', '下午离校', '晚上进校','晚上离校'],
        openIndex: null,
        studentList: [],
        listLoading: false,
      }
    },
    props: {
      classInfoList: {
        type: Array
      },
      nowTime: { // 时间段
        type: String
      },
      date: { // 日期
        type: String
      },
      listType: { // 1-班级 -部门
        type: Number
      },
      id: { // 评价项id
        type: String
      }
    },
    watch: {
      classInfoList(newVal) {
        if(newVal && newVal.length >0) {
          this.myList = newVal
          if(this.myList.length === 1) {
            this.getStudentList(this.myList[0],0)
          }
          this.getInit()
        }
      }
    },
    mounted() {
    },
    methods: {
      getInit() {
        this.myList.forEach(item => {
          if(this.myList.length > 1) {
            this.$set(item,'isOpen',false)
          }else {
            this.$set(item,'isOpen',true)
          }
        })
      },
      /**
       * 判断学生是否需要考勤
       */
      studentItemIsShow(item) {
        let ret = true
        // if(item.List && item.List.length > 0) {
        //   item.List.forEach(itm => {
        //     if(itm.cmdType === 9) {
        //       ret = false
        //     }
        //   })
        // }else {
        //   ret = false
        // }
        return ret
      },
      /**
       * 判断学生是否都是不需要考勤
       */
      studentNoClock(list) {
        let ret = true
        if(!list) {
          ret = true
        }else {
          ret = false
        }
        return ret
      },
      /**
       * 获取考勤列表
       */
      getStudentList(item,index) {
        this.listLoading = true
        this.myList.forEach((item,inx) => {
          if(inx !== index) {
            this.$set(item,'isOpen',false)
          }
        })
        this.$set(item,'isOpen',!item.isOpen)
        if(item.isOpen) {
          if(this.openIndex === index) {
            
          }else {
            this.studentList = []
            if(item.MemberNum) {
              let param = {
                userId: this.userId,
                school: this.school,
                date: this.date,
              }
              if(this.listType==1){ // 班级学生
                param.classCode = item.Code
                param.kqDayState = this.TIME_TYPE_LIST.indexOf(this.nowTime)
              }else { // 部门教师
                param.dept = item.Code
                param.itemDayState = this.TIME_TYPE_LIST.indexOf(this.nowTime)
              }
              this.$axGet(this.listType == 1 ?'KaoqingGetClassStudentDetailList':'KaoqingGetDeptUserStateListByNow',param).then(res => {
                if(res.ResultCode === 1) {
                  this.studentList = res.Value
                  if(this.studentList && this.studentList.length > 0) {
                    this.studentList.sort(function(o1,o2) { // 异常状态排序
                      let v1 = o1.List
                      let v2 = o2.List
                      let RULES_LIST = [12,13,5,4,3,11,2]
                      if(v1 && v2) {
                        if(v1.length === v2.length && v1.length === 1) {
                          if(RULES_LIST.indexOf(v1[0].cmdType) > RULES_LIST.indexOf(v2[0].cmdType)) {
                            return -1
                          }else if(RULES_LIST.indexOf(v1[0].cmdType) < RULES_LIST.indexOf(v2[0].cmdType)) {
                            return 1
                          }else {
                            return 0
                          }
                        }else if(v1.length === v2.length && v1.length != 1){
                          return 0
                        }else {
                          if(v1.length > v2.length) {
                            return -1
                          }else if(v1.length < v2.length) {
                            return 1
                          }else {
                            return 0
                          }
                        }
                      }
                    })
                  }
                }else {
                  this.$toast(res.ResultMessage || '网络不太给力哦，检查一下您的网络再试吧~')
                }
                this.listLoading = false
              }).catch(err => {
                this.listLoading = false
                this.$toast('网络不太给力哦，检查一下您的网络再试吧！')
              })
            }
          }
        }
      },
      goDetail(student,classCode) {
        this.$router.push({path:'/clockDetail',query:{userid:student.UserId,username:student.Name,schoolcode:this.school,classcode:classCode,clockdate:this.date,id:this.id}})
      }
    },
  }
</script>

<style lang="less" scoped>
.list{
  margin-top: 11px;
  width: 100%;
  .hidden{
    
    width: 100%;
    overflow: hidden;
  }
  .class-item{
    margin-bottom: 20px;
    position: relative;
    padding: 18px;
    box-sizing: border-box;
    background: #fff;
    box-shadow:0px 10px 20px rgba(0,24,55,0.05);
    border-radius:10px;
    .per{
      position: absolute;
      top: 6px;
      right: -50px;
      width: 180px;
      height: 60px;
      background:rgba(250, 181, 7, 0.986);
      color: #ffffff;
      transform:rotate(40deg);  
      .per-number{
        font-size: 20px;
      }
    }
    &-title{
      font-size: 28px;
      color:rgba(51,51,51,0.80);
      .number{
        margin-left: 12px;
      }
    }
    .status-group{
      flex-flow: wrap;
      -webkit-flex-wrap:wrap;
      margin-top: 15px;
      width: 100%;
      height:100px;
      .status-item{
        width: 33.33333%;
        font-size: 28px;
        color:rgba(51,51,51,0.70);
      }
      
    }
    .text-empty{
      color: rgba(51,51,51,0.40);
      margin-top: 10px;
      width: 100%;
      text-align: center;
      line-height: 24px;
    }
    .btn-open{
      position: absolute;
      bottom: 14px;
      right: 22px;
      width: 40px;
      height: 40px;
      background-image: url('~@/assets/img/icon_down.png');
      background-repeat: no-repeat;
      background-size: contain;
      transition-duration: .3s;
    }
    .student-list{
      margin-top: 10px;
      border-top:1px solid rgba(51,51,51,0.04);
      width: 100%;
      .list-loading{
        margin: 4px 0;
        width: 100%;
        height: 30px;
        // background-image: url('@/assets/img/loading.png');
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center center;
        -webkit-animation: loadingImage 1.5s infinite linear;
        -moz-animation: loadingImage 1.5s infinite linear;
        -ms-animation: loadingImage 1.5s infinite linear;
        animation: loadingImage 1.5s infinite linear;
        -webkit-transform-origin:center center center;
        -moz-transform-origin:center center center;
        transform-origin:center center center;
      }
      @keyframes loadingImage {
        0% {
          transform: rotate(0deg);
        }
        50% {
          transform: rotate(180deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      .student-item{
        border-bottom:1px solid rgba(51,51,51,0.02);
        width: 100%;
        height:75px;
        font-size: 26px;
        color:rgba(51,51,51,0.90);
        .student-item-name{
          max-width: 150px;
        }
        .status{
          position: relative;
          margin-right: 25px;
          min-height: 40px;
          color: #FF9900;
          &::after{
            content: "";
            position: absolute;
            top: -14px;
            right: -50px;
            margin: 20px;
            border-right:2px solid rgba(51,51,51,0.3);
            border-bottom: 2px solid rgba(51,51,51,0.3);
            width: 18px;
            height: 18px;
            transform: rotate(-45deg);
            -o-transform: rotate(-45deg);
            -webkit-transform: rotate(-45deg);
            -moz-transform: rotate(-45deg);
            -ms-transform: rotate(-45deg);
          }
        }
        &:last-child{
          margin-bottom: 24px;
        }
      }
    }
  }
}
</style>