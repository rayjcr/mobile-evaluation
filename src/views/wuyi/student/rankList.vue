<template>
  <div class="bd-box scrollY scroll-view">
  	<div class="title_bg"></div>
  	<div class="list-box">
  		<div class="ranklist">
        <div class="search-box">
          <div class="search-top flex alignCenter justifySpaceBetween" v-if="!isTeacher">
            <div class="search-left">
              <span :class="{'active': rankScope == 'class'}" @click="rankScope = 'class'">本班</span>
              <span  :class="{'active': rankScope == 'major'}" @click="rankScope = 'major'">本专业</span>
            </div>
<!--            <div class="search-right" @click="openTimeChoice">
              <span>{{type == 1 ? '按周' : type == 2 ? '按月' : '按学期'}}</span>
              <span class="icon_down"></span>
            </div> -->
          </div>
          <div class="search-bottom border flex alignCenter justifyCenter" @click="popupClassVisible = true" v-else-if="curClass">
            {{curClass.bjmc}}<i class="mintui mintui-back arrowdown"></i>
          </div>
          <div class="search-bottom">{{timeWB}}</div>
          <div class="select-box flex alignCenter justifySpaceBetween">
            <div class="select-left">
              <span :class="{'active': !isExtScope}" @click="isExtScope=false">全部</span>
              <span  :class="{'active': isExtScope}" @click="isExtScope=true">含附加分</span>
            </div>
            <div class="select-right flex alignCenter" @click="openTimeChoice">
              <span>筛选</span>
              <span class="icon_down"></span>
            </div>
          </div>
          <div class="select-condition flex alignCenter justifySpaceBetween" v-if="dimensions.str.length>0">
            <span>{{dimensions.str}}</span>
            <span class="clear-select" @click="dimensions.str='';dimensions.arr=[];">清除筛选</span>
          </div>
        </div>

        <div class="rankBox" :class="isTeacher?'teacher':''" v-if="rankList.length > 0">
   <!--       <div class="switch-box flex alignCenter" :class="{'marignBottom140': myRankInfo}">
            <mt-switch v-model="isExtScope"></mt-switch>
            <span>是否含附加分 (任务获得的分数)</span>
          </div> -->
          <div class="ranking-me" v-if="myRankInfo">
            <div class="my-rank flex alignCenter">
                <div class="li_left flex alignCenter flex_1">
                <div class="ranking number">{{myRankInfo.rankNum}}</div>
                <div class="avatar"></div>
                <div class="name">我</div>
              </div>
              <div class="li_right"><span>{{myRankInfo.totalScore}}</span></div>
            </div>
          </div>
          <!-- <div class="scrollY scroll-view"> -->
            <ul class="list">
              <li class="flex alignCenter" v-for="(item,index) in rankList" :key="index">
                <div class="li_left flex alignCenter flex_1">
                  <div class="ranking guanjun" v-if="item.rankNum == 1">1</div>
                  <div class="ranking yajun" v-else-if="item.rankNum == 2">2</div>
                  <div class="ranking jijun" v-else-if="item.rankNum == 3">3</div>
                  <div class="ranking number" v-else>{{item.rankNum}}</div>
                  <div class="avatar"></div>
                  <div class="name">{{item.stuName}}</div>
                </div>
                <div class="li_right">
                  <span>{{item.totalScore}}</span>
                  <!-- <i class="mintui mintui-back back-icon"></i> -->
                </div>
              </li>
            </ul>
          <!-- </div> -->
        </div>
        <div class="empty flex justifyCenter alignCenter" v-else>暂无排行榜内容</div>
      </div>
  	</div>

    <!-- <time-choice ref='timeChoice' :isWuyi="true" :isShowTab="false" @sure="sure"></time-choice> -->
    
    <!-- 筛选弹框 -->
    <mt-popup v-model="popupVisible" position="bottom" class="mint-popup">
      <div class="popup-head flex alignCenter justifySpaceBetween">
        <span>{{isTeacher?'维度筛选':'筛选'}}<span class="tip" v-if="isTeacher">可多选</span></span>
        <span class="icon-close" @click="popupVisible=false"></span>
      </div>
      <div class="select-items" v-if="!isTeacher">
        <div class="title">学期<span class="tip">单选</span></div>
        <ul class="items">
          <li class="item" :class="{'active':selectBoxInfo.xn==''}" @click="selectBoxInfo.xn = '';selectBoxInfo.xq = ''">全部学期</li>
          <li class="item" v-for="xq in xnxqlist" :class="{'active':selectBoxInfo.xn==xq.yxn&&selectBoxInfo.xq==xq.xq}" @click="changeXq(xq)">
            {{xq.xn + ' ' + xq.xqmc}}
          </li>
<!--          <li class="item active">2017-2018秋学期</li>
          <li class="item">2018-2019春学期</li>
          <li class="item">2018-2019秋学期</li> -->
        </ul>
      </div>
      <div class="select-items">
        <div class="title" v-if="!isTeacher" >维度<span class="tip">可多选</span></div>
        <ul class="items">
          <li class="item" :class="{'active':selectBoxInfo.dimensions.arr.length==0}" @click="selectBoxInfo.dimensions.str = '';selectBoxInfo.dimensions.arr = []">全部</li>
          <li 
            class="item" 
            v-for="dimension in dimensionList" 
            :class="{'active':selectBoxInfo.dimensions.arr.findIndex(e=>e.id==dimension.id)>=0}" 
            @click="appendSelect(dimension)"
            v-show="dimension.dimensionType==1"
            >{{dimension.name}}</li>
 <!--         <li class="item" :class="{'active':selectBoxInfo.dimensions.indexOf('德')>=0}" @click="appendSelect('德')">德</li>
          <li class="item" :class="{'active':selectBoxInfo.dimensions.indexOf('文')>=0}" @click="appendSelect('文')">文</li>
          <li class="item" :class="{'active':selectBoxInfo.dimensions.indexOf('技')>=0}" @click="appendSelect('技')">技</li>
          <li class="item" :class="{'active':selectBoxInfo.dimensions.indexOf('艺')>=0}" @click="appendSelect('艺')">艺</li>
          <li class="item" :class="{'active':selectBoxInfo.dimensions.indexOf('活动')>=0}" @click="appendSelect('活动')">活动</li>
          <li class="item" :class="{'active':selectBoxInfo.dimensions.indexOf('荣誉奖励')>=0}" @click="appendSelect('荣誉奖励')">荣誉奖励</li> -->
        </ul>
      </div>
      <div class="select-btns flex alignCenter">
        <div class="reset btn" @click="resetValue">重置</div>
        <div class="confirm btn" @click="checkSelect">确认</div>
      </div>
    </mt-popup>
    
    <!-- 选班级弹框 -->
    <mt-popup
      v-model="popupClassVisible"      
      class="popup"
      position="bottom">      
      <div class="pop-item flex">
        <div class="pop-title flex alignCenter">
          <div class="picker-btn picker-cancel" @click="popupClassVisible = false">取消</div>
          <div class="flex_1 title">班级选择</div>
          <div class="picker-btn picker-sure" @click="handleChangeClass">确定</div>
        </div>
        <mt-picker ref='classPicker' :slots="classSlots"></mt-picker>
      </div>
    </mt-popup>
  </div>
</template>

<script>
  import TimeChoice from '@/components/timeChoice/timeChoice.vue'
  import { wuyiApi } from '@/utils/api'
  import { userInfoAPi,PjApi } from '@/utils/api'

  export default {
    name: 'wuyiRankList',
    components: {
      TimeChoice
    },
    data () {
      return {
        schoolYear: '',
        term: '',

        studentCode: '',
        rankScope: 'class', // 默认按班级
        type: 3, // 按周1，按月2,按学期3;默认按学期
        myRankInfo: null, // 我的排行榜信息
        rankList: [], // 排行榜
        timeWB: '', // 默认当前学年学期
        isExtScope: false ,// 是否含附加分 (任务获得的分数)
        popupVisible: false,// 是否展示筛选的弹框
        xnxqlist: [],//学年学期列表
        dimensions: {
          arr: [],
          str: '',
        },
        dimensionList: [],
        selectBoxInfo:{
          xn: '',
          xq: '',
          dimensions: {
            str: '',
            arr: []
          },
        },
        resetData:{},
        isTeacher: false,
        classList: [],//教师可选班级列表
        curClass: null,//教师当前选中班级
        popupClassVisible: false,
      }
    },
    computed: {
      changeData() {
        const { schoolYear,term,rankScope,isExtScope,dimensions } = this;
        return {
          schoolYear,
          term,
          rankScope,
          isExtScope,
          arr:dimensions.arr
        }
      },
      classSlots(){
        var res = [{
          values: []
        }];
        if(this.classList){
          this.classList.forEach(e=>{
            res[0].values.push(e.bjmc);
          })          
        }
        return res;
      }
    },
    watch: {
      changeData() {
        this.rankList = [];
        Promise.all([
          this.getStudentRankInfo(),          
        ]).then(() => {}).catch((error) => {
          console.log(error);
        });
      },
      curClass(val){
        if(this.isTeacher){
          this.rankList = [];
          Promise.all([
            this.getStudentRankInfo(),          
          ]).then(() => {}).catch((error) => {
            console.log(error);
          });          
        }
      }
    },
    async activated() {
      console.log('activated')
      this.studentCode =  this.$route.query.studentCode;
      this.isTeacher =  this.$route.query.type=='teacher';
      if(this.isTeacher){
        this.schoolYear = this.$route.query.schoolYear;
        this.term = this.$route.query.term;
      } else {
        this.schoolYear = this.$cookie.get('schoolYear')
        this.term = this.$cookie.get('term')
      }
      await this.getDimensionList();
      if(!this.isExtScope && this.type == 3 && this.rankScope == 'class') {
        Promise.all([
          this.initData(),
          this.getStudentRankInfo(),
        ]).then(() => {}).catch((error) => {
          console.log(error);
        });
      }
    },
    methods: {
      /*
      * 获取排行榜
      * */
      async getStudentRankInfo () {
        let data = {
          dataScope: this.type == 3 ? 'term' : this.type == 2 ? 'month' : 'week',
          rankScope: this.rankScope,
          isExtScope: this.isExtScope,
          userId: this.studentCode,
          dimensionList : [],      
          termList: [], 
        }
        console.log(this.dimensionList,205)
        if(this.dimensions.arr.length>0){
          this.dimensions.arr.forEach(e=>{
            data.dimensionList.push(({
              dimensionId: e.id,
              dimensionName: e.name
            }))
          })          
        } else {
          // 如果所有维度就传所有的
          this.dimensionList.forEach(e=>{
            if(e.dimensionType==1){
              data.dimensionList.push({
                dimensionId: e.id,
                dimensionName: e.name
              })              
            }
          })         
        }
        if(this.term != ''){
          data.termList.push({
            schoolYear: this.schoolYear,
            term: this.term,
          }) 
        } else {
          this.xnxqlist.forEach(e=>{
            data.termList.push({
              schoolYear: e.yxn,
              term: e.xq,
            })
          })
          
        }
        if(this.isTeacher){
          data.classCode = this.curClass.bjid;
        }
        var queryLink = this.isTeacher?wuyiApi.getScoreRankByClassCode:wuyiApi.getScoreRank;
        this.$indicator.open("加载中...");
        const res = await this.$req.post(queryLink, data)
        if (res.resultCode == 1) {
          this.myRankInfo = (res.value && res.value.stuName) ? {
            rankNum: res.value.rankNum,
            totalScore: res.value.totalScore
          } : null;
          this.rankList = (res.value && res.value.list) || [];

        }
      },
     
      /*
      * 获取学年学期列表
      * */
      async getXnxqList() {
        let data = {
           page: 1,
           limit: 20,
           xxdm: this.$cookie.get('xxdm')
        };
        const res = await this.$req.get(userInfoAPi.getXnxqList,data);
        if (res.status == 200) {
          let { rows } = res.data;
          rows.map(c=>{
            this.$set(c,'yxqmc',c.xqmc);
            this.$set(c,'xqmc',(c.xqmc=='上学期'?'秋学期':'春学期'));
            this.$set(c,'yxn',c.xn);
            this.$set(c,'xn',(c.xn.split('-')[c.xq == '02'?1:0]));
          }); 
          this.xnxqlist = rows;
        }
      },
     
      /*
      * 获取维度列表
      * */
      async getDimensionList() {
        const res = await this.$req.get(PjApi.getAll);
        if (res.resultCode == 1) {
          var arr = res.value.filter(e=>e.dimensionType==1);
          this.dimensionList = arr || [];
          this.dimensions.arr.push({});
          this.dimensions.arr.pop();
        }
      },
      openTimeChoice() {
          // this.$refs.timeChoice._show();
          this.selectBoxInfo.xn = this.schoolYear;
          this.selectBoxInfo.xq = this.term;          
          this.selectBoxInfo.dimensions = JSON.parse(JSON.stringify(this.dimensions)) ;      
          this.popupVisible = true;
      },
      resetValue(){
        if(!this.isTeacher){
          this.selectBoxInfo.xn = this.$cookie.get('schoolYear');
          this.selectBoxInfo.xq = this.$cookie.get('term');           
        }
        this.selectBoxInfo.dimensions.arr = [] ;  
        this.selectBoxInfo.dimensions.str = '' ;   
      },
      async initData() {
        console.log('hlelo')
        this.type = 3;
        this.rankScope = 'class';
        let xq = this.term == '01' ? '秋学期' : '春学期';
        this.timeWB = this.schoolYear.split('-')[this.term == '02'?1:0] + ' ' + xq;
        this.isExtScope = false;
        this.rankList = [];    
        if(this.isTeacher){
          await this.getGrantedClass();
          // this.classList = JSON.parse(sessionStorage.getItem("allClassList"));
          this.curClass = this.classList[0];
        }
        this.getXnxqList();
        // this.getDimensionList();
      },
      sure(a) {
        this.type = a.type;
        if(a.type == 3) { // 按学期
          this.schoolYear = a.xn;
          this.term = a.xq;
          let xq =  a.xq == '01' ? '秋学期' : '春学期';
          this.timeWB = this.schoolYear.split('-')[this.term == '02'?1:0] + ' ' + xq;
        }
      },
      // 切换学期
      changeXq(xq){
        this.selectBoxInfo.xn = xq.yxn;
        this.selectBoxInfo.xq = xq.xq;          
      },
      // 筛选维度
      appendSelect(dimension){
        var arr = this.selectBoxInfo.dimensions.str.split('、');
        var index = this.selectBoxInfo.dimensions.arr.findIndex(e=>e.id==dimension.id);
        if(index<0){
          if(this.selectBoxInfo.dimensions.str.length>0){
            this.selectBoxInfo.dimensions.str += '、'; 
          }             
          this.selectBoxInfo.dimensions.str += dimension.name;
          this.selectBoxInfo.dimensions.arr.push(dimension);
        } else {          
          arr.splice(index,1);
          this.selectBoxInfo.dimensions.str = arr.join('、')
          this.selectBoxInfo.dimensions.arr.splice(index,1);
        }
        // 判断是否全选
        if(this.selectBoxInfo.dimensions.arr.length==this.dimensionList.length){
          this.selectBoxInfo.dimensions.str = '';
          this.selectBoxInfo.dimensions.arr = [];
        }
      },
      // 确认筛选
      checkSelect(){
        this.schoolYear = this.selectBoxInfo.xn;
        this.term = this.selectBoxInfo.xq;
        let xq =  this.term == '01' ? '秋学期' : '春学期';
        this.timeWB = this.schoolYear==''? '全部学期':(this.schoolYear.split('-')[this.term == '02'?1:0] + ' ' + xq);
        this.dimensions = this.selectBoxInfo.dimensions;    
        
        this.popupVisible = false;
      },
      // 获取可选班级列表
      async getGrantedClass(){
        var params = {
          xxdm: this.$cookie.get('xxdm'),
          zgh: this.$cookie.get('userId'),
          xndm: this.schoolYear,
          // njdm: this.
        }
        var res = await this.$req.get(userInfoAPi.getGrantedClass,params);
        console.log(res,413);
        this.classList = res.data;
        if(res.data.length==0){
          this.$toast('该学期您没有班级权限')
          this.$router.go(-1)
        }
      },
      
      handleChangeClass(){
        var value = this.$refs.classPicker.getValues();
        var classData = this.classList.find(e=>e.bjmc==value);
        if(classData){
          this.curClass = classData
        }        
        this.popupClassVisible = false;
      },
      
      _jump (path, a) {
        let query = {
          studentName: a.studentName,
          studentCode: a.studentCode
        }

        this.$router.push({
          path,
          query,
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .bd-box {
    padding: 0 32px;
    height: 100%;
    background-color: #050B58;
    background-image: url(../img/ranking_title1.png);
    background-size: 750px auto;
    background-position: top center;
    background-repeat: no-repeat;

    .title_bg {
      height: 170px;
      padding-top: 72px;
      // background-image: url(../img/ranking_title@2x.png);
      background-size: 419px auto;
      background-position: center;
      background-repeat: no-repeat;
    }
    .list-box {
      margin-top: 34px;
      .ranklist {
        margin-bottom: 20px;
        .search-box {
          // background: linear-gradient(90deg,rgba(158,46,255,1) 0%,rgba(255,95,57,1) 100%);
          background-color: #6332EE;
          box-shadow: 0 6px 18px rgba(255,167,47,0.15);
          border-radius: 20px 20px 0 0;
          .search-top {
            .search-left {
              margin: 0 auto;
              span {
                display: inline-block;
                padding: 20px;
                color:rgba(255,255,255,.5);
                font-size: 30px;
              }
              .active {
                color:rgba(230,235,242,1);
                font-weight: 600;
                position: relative;
                &::after{
                  content: '';
                  width:20px;
                  height:4px;
                  border-radius: 2px;
                  background-color: #fff;
                  display: block;
                  position: absolute;
                  bottom: 10px;
                  left: 50%;
                  transform: translateX(-50%);
                }
              }
            }
            .search-right {
              span {
                display: inline-block;
                color: #FFFFFF;
                font-size: 28px;
                margin-right: 10px;
                vertical-align: middle;
              }
              .icon_down {
                width: 33px;
                height: 28px;
                background: url('../img/icon_down@2x.png') no-repeat center;
                background-size: 33px auto;
              }
            }
          }
          .search-bottom {
            height: 76px;
            line-height: 76px;
            color: #FFFFFF;
            font-size: 36px;
            font-weight: 400;
            text-align: center;
            &.border{
              font-weight: 600;
            }
            .arrowdown{
              transform: rotate(-90deg);
              margin-left: 20px;
            }
          }
          .select-box{
            height: 100px;
            font-size: 28px;
            padding-left: 34px;
            background-color: #fff;
            .select-left{
              span{
                height: 60px;
                border-radius:30px;
                padding: 10px 20px;
                font-size:28px;
                color:rgba(174,182,193,1);
                background:rgba(230,235,242,1);
                margin-right: 20px;
                box-sizing: border-box;
              }
              .active{
                color:rgba(255,255,255,1);
                background:rgba(99,50,238,1);
              }
            }
            .select-right{
              color:rgba(41,45,51,1);
              color:rgba(41,45,51,1);
              padding-right: 32px;
              .icon_down {
                width: 36px;
                height: 36px;
                background: url('../img/icon_down_black@2x.png') no-repeat center;
                background-size: 33px auto;
                display: inline-block;
                margin-left: 20px;
              }
            }
          }
          .select-condition{
            height: 100px;
            font-size:28px;
            font-weight:400;
            color:rgba(41,45,51,1);
            background-color: #fff;
            padding: 0 32px;
            .clear-select{
              color:rgba(22,141,255,1);
            }
          }
        }
        .rankBox {
          position: relative;
          background-color: #ffffff;
          border-radius: 0 0 20px 20px;
          padding-top: 110px;
          &.teacher{
            padding-top: 0;
            /deep/ .scroll-view{
              max-height: calc(100vh - 690px);
            }
          }
          .marignBottom140 {
            margin-bottom: 140px;
          }
          .switch-box {
            height: 100px;
            color: #262626;
            font-size: 28px;
            padding-left: 34px;
            span {
              margin-left: 20px;
            }
          }
          .ranking {
            width: 60px;
            height: 60px;
            line-height: 60px;
            font-size: 36px;
            text-align: center;
            background-size: 60px auto;
            background-repeat: no-repeat;
            background-position: center;
          }
          .guanjun {
            color: #ffffff;
            background-image: url('../img/icon_guanjun@2x.png');
          }
          .yajun {
            color: #ffffff;
            background-image: url('../img/icon_yajun@2x.png');
          }
          .jijun {
            color: #ffffff;
            background-image: url('../img/icon_jijun@2x.png');
          }
          .number {
            color: #262727;
            text-align: center;
          }
          .avatar {
            width: 80px;
            height: 80px;
            margin-left: 40px;
            background-image: url(/static/img/avatar@2x.png);
            background-repeat: no-repeat;
            background-size: 80px auto;
            background-position: center;
          }
          .name {
            color: #262727;
            font-size: 28px;
            margin-left: 20px;
          }
          .li_right {
            span {
              color: #33A5FF;
              font-size: 36px;
              margin-right: 10px;
            }
            .back-icon {
              display: inline-block;
              vertical-align: top;
              margin-top: 10px;
              color: #C7C7CC;
              transform: rotate(-180deg);
            }
          }
          .ranking-me {
            position: absolute;
            top: -20px;
            left: -32px;
            width: 750px;
            height: 150px;
            background-image: url(../img/my_ranking@2x.png);
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-position: center;
            .my-rank {
              height: 100%;
              padding: 0 50px;
            }
            img {
              width: 100%;
              height: 100%;
            }
            .number {
              color: #FFFFFF;
              font-size: 36px;
            }
            .name {
              color: #ffffff;
              font-size: 28px;
            }
            .li_right {
              span {
                color: #ffffff;
              }
            }
          }
          .scroll-view {
            max-height: calc(100vh - 800px);
          }
          .list {
            padding-left: 26px;
            padding-right: 32px;
            li {
              height: 120px;
              img {
                width: 100%;
                height: 100%;
              }
            }
          }
        }
        .empty {
          color: #BDBEBF;
          font-size: 28px;
          height: 734px;
          background-color: #FFFFFF;
          border-radius: 0 0 20px 20px;
        }
      }
    }
  }
  .mint-popup{
    .popup-head{
      font-size:36px;
      color:rgba(41,45,51,1);
      padding: 40px 32px;
      font-weight:bold;
      .tip{        
        font-size:28px;
        font-weight:400;
        color:rgba(174,182,193,1);
        margin-left: 20px;
      }
      .icon-close{
        display: inline-block;
        height: 40px;
        width: 40px;
        background: url(../img/close@2x.png) no-repeat;
        background-size: 100% auto;
      }
    }
    .select-items{
      padding: 0 36px;
      margin-bottom: 20px;
      .title{
        font-size:32px;
        font-weight:bold;
        color:rgba(41,45,51,1);
        .tip{
          font-size:28px;
          font-weight:400;
          color:rgba(174,182,193,1);
          margin-left: 20px;
        }
      }
      .items{
        margin-top: 20px;
        .item{
          height:60px;
          background:rgba(230,235,242,1); 
          border-radius:30px;
          font-size:28px;
          font-weight:400;
          color:rgba(174,182,193,1);
          padding: 10px 20px;
          display: inline-block;
          box-sizing: border-box;
          margin-right: 20px;
          margin-bottom: 20px;
        }
        .active{
          color:rgba(255,255,255,1);
          background:rgba(99,50,238,1);
        }
      }
    }
    .select-btns{
      margin-bottom: 20px;
      padding-top: 40px;
      justify-content: space-around;
      .reset{
        color:rgba(112,118,128,1);
        background:rgba(239,241,243,1);
      }
      .confirm{
        background:rgba(99,50,238,1);
        color:rgba(255,255,255,1);
      }
      .btn{
        width:320px;
        height:88px;
        border-radius:44px;
        font-size:32px;
        font-weight:400;
        line-height:88px;
        text-align: center;
      }
    }
    
    // popup
    &.popup {
      width: 100%;
      height: 600px;
      background-color: #ffffff;
      .pop-item {
        width: 100%;
        flex-direction: column;
        align-items: center;
        .pop-title {
          width: 100%;
          height: 100px;
          .title {
            font-size: 36px;
            font-weight: 600;
            text-align: center;
          }
          .picker-btn {
            width: 180px;
            font-size: 32px;
            text-align: center;
          }
          .picker-cancel {
            color: #B6B8B8;
          }
          .picker-sure {
            color: #33A5FF;
          }
        }
        .frequencySelect {
          width: 624px;
          height: 60px;
          background-color: #ffffff;
          border: 2px solid rgba(239, 241, 243, 1);
          border-radius: 30px;
          text-align: center;
          align-items: center;
          input[type="radio"] {
            display: none;
            &:checked + label {
              width: 140px;
              height: 60px;
              background-color: rgba(51, 165, 255, 1);
              border-radius: 30px;
              line-height: 60px;
              color: #fff;
            }
          }
          label {
            flex: 1;
          }
        }
        .picker {
          width: 100%;
        }
      }
    }
  }
</style>

