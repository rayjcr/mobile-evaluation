<template>
  <div class="ranklist">
    <section>
      <div class="first-block tea" v-if="type == 'teacher'">
        <div class="top flex alignCenter justifyCenter" @click="popupVisible1= true">
          <span class="class-name text-overflow">{{className || '暂无班级'}}</span>
          <i class="mintui mintui-back down-icon"></i>
        </div>
        <div class="bottom flex alignCenter">
          <div class="tab-item flex_1" @click="selected = 1">
            <span :class="{'active': selected == 1}">进步之星</span>
          </div>
          <div class="tab-item flex_1" @click="selected = 2">
            <span :class="{'active': selected == 2}">获卡之星</span>
          </div>
          <div class="tab-item flex_1" @click="selected = 3">
            <span :class="{'active': selected == 3}">争卡之星</span>
          </div>
        </div>
      </div>
      <div class="first-block flex stu" v-else>
        <div class="tab-item flex_1" @click="selected = 1">进步之星</div>
        <div class="tab-item flex_1" @click="selected = 2">获卡之星</div>
        <div class="tab-item flex_1" @click="selected = 3">争卡之星</div>
        <span
          :class="{
          'span_left0': selected == 1,
          'span_left100': selected == 2,
          'span_left200': selected == 3
          }"
        >{{selected == 1 ? '进步之星' : selected == 2 ?  '获卡之星' : '争卡之星'}}</span>
      </div>
    </section>
    <section>
      <div class="second-block">
        <div class="search-box">
          <div class="top flex alignCenter justifySpaceBetween">
            <div class="left">
              <span :class="{'active': rankScope == 'class'}" @click="rankScope = 'class'">本班</span>
              <span  :class="{'active': rankScope == 'grade'}" @click="rankScope = 'grade'">本年级</span>
            </div>
            <div class="right flex alignCenter">
              <div class="wd-box" @click="showWd">
                <span class="wd text-overflow">{{dimensionName ? dimensionName : '全部卡片'}}</span>
                <span class="icon_down"></span>
              </div>
              <div class="time-box" @click="popupVisible = true">
                <span class="time">{{searchTime}}</span>
                <span class="icon_down"></span>
              </div>
            </div>
          </div>
          <div class="bottom">
            <!--时间本周本月-->
            <v-time ref="time" 
              :iconStyle="{'color': '#FFFFFF'}" 
              :timeStyle="{'color': '#FFFFFF'}" 
              @getTimeWB="getTimeWB"
              ></v-time>
          </div>
        </div>
        <div class="rankBox" :class="{'paddingtop150': myRankInfo}" v-if="rankList.length > 0">
          <div class="ranking-me" v-if="myRankInfo">
            <div class="my-rank flex alignCenter">
                <div class="li_left flex alignCenter flex_1">
                <div class="ranking number">{{myRankInfo.rankingNum}}</div>
                <div class="avatar"></div>
                <div class="name">我</div>
              </div>
              <div class="li_right"><span>{{myRankInfo.medalCardNum}}</span></div>
            </div>
          </div>
          <div class="scroll-view scrollY" >
            <ul class="list">
              <li class="flex alignCenter" @click="_jump('/studenthome',item)" v-for="(item,index) in rankList" :key="index">
                <div class="li_left flex alignCenter flex_1">
                  <div class="ranking guanjun" v-if="index == 0">1</div>
                  <div class="ranking yajun" v-else-if="index == 1">2</div>
                  <div class="ranking jijun" v-else-if="index == 2">3</div>
                  <div class="ranking number" v-else>{{index+1}}</div>
                  <div class="avatar"></div>
                  <div class="name">{{item.studentName}}</div>
                </div>
                <div class="li_right">
                  <span>{{item.medalCardNum}}</span>
                  <i class="mintui mintui-back back-icon"></i>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="empty flex justifyCenter alignCenter" v-else>暂无排行榜内容</div>
      </div>
    </section>

    <!--按周按月-->
    <mt-popup v-model="popupVisible" v-roll:visible=[popupVisible,popupVisible1] position="bottom" class="mint-popup">
      <mt-picker :slots="dataList" :visible-item-count="5" :show-toolbar="true" ref="picker" value-key="name"
                 :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm">完成</div>
        </div>
      </mt-picker>
    </mt-popup>

    <!--维度选择器-->
    <v-wd-select ref="wd" @getWdInfo="getWdInfo" @getWdName="getWdName"></v-wd-select>

    <!--班级选择器-->
    <mt-popup v-model="popupVisible1" v-roll:visible=[popupVisible,popupVisible1] position="bottom" class="mint-popup">
      <mt-picker :slots="classList" :visible-item-count="5" :show-toolbar="true" ref="classPicker" value-key="className"
                 :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible1 = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirmClass">完成</div>
        </div>
      </mt-picker>
    </mt-popup>

  </div>
</template>

<script>
  import {CountApi} from '@/utils/api'

  import WdSelect from '@/components/wdSelect/WdSelect.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import Time from '@/components/time/Time.vue'
  import formatDate from '@/utils/formatDate/formatDate'

  export default {
    name: 'RankList',
    data() {
      return {
        userId: this.$cookie.get('userId'),
        classCode: this.$cookie.get('classCode'),
        type: this.$route.query.type,
        gradeCode: this.$route.query.gradeCode,

        className: '',
        selected: 1,
        popupVisible: false,
        popupVisible1: false,
        dimensionId: '', // 维度编号
        dimensionName: '', // 维度名称
        rankScope: 'class', // 统计范围（class: 班级，grade：年级
        searchTime: '按周',
        startDate: '',
        endDate: '',
        preStartDate: '',
        preEndDate: '',
        schoolYear: '', // 按学期查询需要学年
        term: '', // 按学期查询需要学期
        rankTimeType: 1, // 时间范围（1:按周，2:按月,term:按学期）
        timeList: [
          {type: 1, name: '按周'},
          {type: 2, name: '按月'},
          {type: 'term', name: '按学期'}
        ],
        rankList: [],
        classList: [], // 左上角班级列表
        myRankInfo: null, // 我的排行榜信息
      }
    },
    components: {
      'v-wd-select': WdSelect,
      'v-empty-list': EmptyList,
      'v-time': Time
    },
    computed: {
      dataList() {
        let dateSlots = [
          {
            flex: 1,
            values: this.timeList,
            className: 'slot1',
            textAlign: 'center'
          }
        ];
        return dateSlots
      },
      changeData() {
        const { selected, rankScope} = this;
        return {
          selected,
          rankScope
        }
      },
    },
    watch: {
      changeData: {
        handler: function () {
          if(this.startDate == '') {
            this.$toast('还没有周次信息');
            return;
          }
          this.getStarRankInfo()
        },
        deep: true
      },
      $route (to, from) {
        if (to.path == '/ranklist') {
          if(from.path == '/zhsz/home') {
            Promise.all([
              this.getQuery(),
              this.initData(),
              this.getClassList()
            ]).then(() => {}).catch((error) => {
              console.log(error)
            })
          }
        }
      }
    },
    mounted() {
      Promise.all([
        this.getQuery(),
        this.initData(),
        this.getClassList()
      ]).then(() => {}).catch((error) => {
        console.log(error)
      })
    },
    methods: {
      /*
        获取榜单信息
      */
      async getStarRankInfo() {
        let data = {
          code: this.classCode,
          rankTimeType: this.rankTimeType,
          rankScope: this.rankScope,
          starType: this.selected,
          dimensionId: this.dimensionId,
          startDate: this.startDate,
          endDate: this.endDate
        };
        if(this.rankTimeType == 'term') { // 按学期
          data['schoolYear'] = this.schoolYear;
          data['term'] = this.term;
        } else { // 按周，按月
          if(this.selected == 1 && this.rankTimeType == 1) { // 进步之星按周查询
            data['preStartDate'] = this.preStartDate;
            data['preEndDate'] = this.preEndDate;
          }
        }

        if(this.rankScope == 'grade'){ // 年级
          data['code'] = this.gradeCode;
        }
        this.$indicator.open("加载中...");
        const res = await this.$req.get(CountApi.getStarRankInfo, data);

        if (res.resultCode == 1) {
          this.rankList = res.value.studentRankVOList || [];
          this.rankList.forEach((c) => {
            if(c.studentCode == this.userId) {
              this.myRankInfo = c;
            }
          })
        }
      },

      initData() {
        this.selected = 1;
        this.rankTimeType = 1;
        this.$refs.time.type = 1; // 触发按周查询(time组件)
        this.searchTime = '按周';
        this.rankScope = 'class';
        this.dimensionId = '';
        this.dimensionName = ''
        this.popupVisible = false;
        this.popupVisible1 = false;
        this.hideWd()
      },
      getQuery() {
        this.type = this.$route.query.type;
        this.gradeCode = this.$route.query.gradeCode;
      },
      tab(type) {
        this.rankScope = type;
      },
      showWd() {
        this.$refs.wd.show();
      },
      hideWd() {
        this.$refs.wd.hide();
      },
      getWdName(data) {
        this.dimensionName = '';
        data.forEach((c) => {
          this.dimensionName += c.name + '-'
        });
        this.dimensionName = this.dimensionName.substring(0,this.dimensionName.length-1)
      },
      getWdInfo(info) {
        this.dimensionId = info.id;
        this.getStarRankInfo()
      },
      getTimeWB(data) {
        if(this.rankTimeType == 'term') { // 按学期
          this.schoolYear = data.xn;
          this.term = data.xq;
        } else {
          this.startDate = data.startTime;
          this.endDate = data.endTime;
          if (this.rankTimeType == 1) { // 按周
            let preEndTime = new Date(data.startTime).getTime() - 7*24*60*60*1000;
            let preEndDate = formatDate(preEndTime,'yyyy-MM-dd');
            this.preEndDate = preEndDate + ' 23:59:59';
            let preStartTime = new Date(this.preEndDate).getTime() - 7*24*60*60*1000;
            let preStartDate = formatDate(preStartTime,'yyyy-MM-dd');
            this.preStartDate = preStartDate + ' 00:00:00';
          } else { // 按月
            this.preEndDate = '';
            this.preStartDate = '';
          }
        }
        this.getStarRankInfo();
      },
      onConfirm() {
        let subjectSelected = this.$refs.picker.getValues()[0];
        this.rankTimeType = subjectSelected.type;
        this.$refs.time.type = subjectSelected.type;
        this.searchTime = subjectSelected.name;
        this.popupVisible = false
      },
      //获取班级列表--左上角选择
      getClassList() {
        let classList = JSON.parse(sessionStorage.getItem('allClassList')); // 获取班级列表数据

        if (this.type == 'stu' || !classList || classList.length == 0 || typeof this.type == 'undefined') return;

        let select = [];
        classList.forEach((c) => {
          if(this.gradeCode != '' && c.gradeCode == this.gradeCode){
            select.push(c);
          } else if(this.gradeCode == ''){
            select.push(c);
          }
        });

        // 过滤班级姓名为空
        var classNameArr = select.filter((c) => {
          return c.className
        })
        let dateSlots = [
          {
            flex: 1,
            values: classNameArr,
            className: 'slot1',
            textAlign: 'center'
          }
        ];
        this.classList = dateSlots;

        //默认选择列表中的第一项
        var clas = select.find(e => {
          return e.classCode == this.classCode
        })
        this.className = clas?clas.className: select[0].className;
        this.classCode = clas?clas.classCode: select[0].classCode;
        this.gradeCode = clas?clas.gradeCode: select[0].gradeCode;
      },
      //确认选择班级
      onConfirmClass() {
        let subjectSelected = this.$refs.classPicker.getValues()[0];
        this.className = subjectSelected.className;
        this.classCode = subjectSelected.classCode;
        this.gradeCode = subjectSelected.gradeCode
        this.popupVisible1 = false
        this.getStarRankInfo()
      },
      //跳转
      _jump(path,stu) {
        // 过滤学生姓名为空
        var studentNameArr = this.rankList.filter((c) => {
          return c.studentName
        })
        sessionStorage.setItem('stuRankList',JSON.stringify(studentNameArr))

        this.$router.push({
          path,
          query: {
            className: this.className,
            classCode: this.classCode,
            isStu: this.type == 'stu' ? 1 : 0,
            studentName: stu?stu.studentName:this.rankList[0].studentName,
            studentCode: stu?stu.studentCode:this.rankList[0].studentCode
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .ranklist {
    .first-block {
      margin-top: 34px;
      border-radius: 34px;
      &.tea {
        background-color: #A02FFA;
      }
      &.stu {
        position: relative;
        background-color: #ffffff;
        .tab-item {
          height: 68px;
          line-height: 68px;
          text-align: center;
          color: #B6B8B8;
          font-size: 30px;
        }
        span {
          position: absolute;
          top: 0;
          width: 228px;
          height: 68px;
          line-height: 68px;
          text-align: center;
          color: #ffffff;
          font-size: 30px;
          border-radius: 34px;
          background-color: #FFB600;
          transition: all .2s;
        }
        .span_left0 {
          left: 0;
        }
        .span_left100 {
          left: 228px;
        }
        .span_left200 {
          left: 456px;
        }
      }
      .top {
        padding: 20px 0;
        color: #FFFFFF;
        .class-name {
          max-width: 450px;
          font-size: 36px;
          font-weight: 600;
          margin-right: 16px;
        }
        .down-icon {
          display: inline-block;
          margin-top: 8px;
          transform: rotate(-90deg);
        }
      }
      .bottom {
        height: 84px;
        .tab-item {
          color: #FFFFFF;
          font-size: 28px;
          text-align: center;
          span {
            display: inline-block;
            width: 188px;
            height: 52px;
            line-height: 52px;
          }
          .active {
            background-color: #FFB600;
            border-radius: 34px;
          }
        }
      }
    }
    .second-block {
      margin-top: 20px;
      .search-box {
        height: 156px;
        background: linear-gradient(90deg,rgba(158,46,255,1) 0%,rgba(255,95,57,1) 100%);
        box-shadow: 0 6px 18px rgba(255,167,47,0.15);
        border-radius: 20px 20px 0 0;
      }
      .left {
        margin-left: 20px;
        span {
          display: inline-block;
          padding: 20px;
          color:rgba(255,255,255,.5);
          font-size: 30px;
        }
        .active {
          color:rgba(230,235,242,1);
          font-weight: 600;
        }
      }
      .right {
        margin-right: 40px;
        span {
          display: inline-block;
          vertical-align: middle;
        }
        .wd,.time {
          color: #FFFFFF;
          font-size: 28px;
        }
        .wd {
          max-width: 150px;
        }
        .icon_down {
          width: 33px;
          height: 28px;
          margin-left: 20px;
          background: url('../img/icon_down@2x.png') no-repeat center;
          background-size: 33px auto;
        }
        .wd-box {
          margin-right: 40px;
        }
      }
      .rankBox {
        position: relative;
        background-color: #ffffff;
        &.paddingtop150 {
          padding-top: 150px;
        }
        .ranking-me {
          position: absolute;
          top: 0;
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
      
      .scroll-view {
        max-height: 600px;
      }
      .empty {
        color: #BDBEBF;
        font-size: 28px;
        height: 700px;
        background-color: #FFFFFF;
        border-radius: 0 0 20px 20px;
      }
    }
  }
</style>

