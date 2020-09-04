<template>
  <div class="studentDetail scrollY">
    <div class="head flex alignCenter" v-if="isStu != 1">
      <div class="class" @click="stuVisible = true">
        <span>{{name}}</span>
        <i class="mintui mintui-back down-icon"></i>
      </div>
      <div class="flag" @click="jump('/RankList','teacher')">榜单</div>
    </div>
    <div class="content">
      <div class="nav flex">
        <div class="flex alignCenter">
          <div class="headerimg"><img src="/static/img/avatar@2x.png"></div>
          <div>
            <div class="name">{{name}}</div>
            <div class="class">{{className}}</div>
          </div>
        </div>
        <div class="select flex alignCenter" @click="popupVisible = true"><span>{{searchTime}}</span><img class="icon_down" src="/static/img/icon_down@2x.png" alt=""></div>
      </div>
      <div class="detailList">
        <!--时间本周本月-->
        <v-time ref="time" @getTimeWB="getTimeWB"></v-time>
        <ul>
          <li class="detail" v-if="isStu != 1">
            <div class="title">获卡情况</div>
            <p class="jlk-title">本{{rankTimeType == 1 ? '周' : '月'}}共发卡<span>{{totalCount}}</span>张，比上{{rankTimeType == 1 ? '周' : '月'}}{{totalCount - preTotalCount > 0 ? '多' : '少'}}发<span>{{Math.abs(totalCount - preTotalCount)}}</span>张<span class="jiantou">{{totalCount - preTotalCount > 0 ? '↑' : '↓'}}</span></p>
            <div class="jlk-list clear">
              <div class="fl" :class="{'margin' : (index+1)%2 != 0}" v-for="(item,index) in list" :key="index">
                <div class="img-box">
                  <img :src="item.icon">
                </div>
                <div class="bottom">
                  <div class="left text-overflow">{{item.name}}</div>
                  <div class="right">
                    <span class="num">{{item.totalMedal}}</span>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li class="detail">
            <div class="title">获卡趋势</div>
            <div class="echarts" v-show="hasRadarData">
              <v-radar ref="radar"></v-radar>
            </div>
            <div class="empty" v-show="!hasRadarData">
              <v-empty-list :text="'无数据'"></v-empty-list>
            </div>
          </li>
          <li class="detail" v-if="isStu == 1">
            <div class="title">班级获卡之星排行榜</div>
            <ul class="studentlist" v-if="rankList.length > 0">
              <li class="stuinfo flex alignCenter me" v-if="myRankInfo">
                <div class="flex alignCenter">
                  <div class="ranking"><span>{{myRankInfo.rankingNum}}</span></div>
                  <div class="headimg"><img src="/static/img/avatar@2x.png"></div>
                  <div>我</div>
                </div>
                <div class="flex alignCenter">
                  <div class="score">{{myRankInfo.medalCardNum}}</div>
                </div>
              </li>
              <li class="stuinfo flex alignCenter" v-for="(item,index) in rankList" :key="index">
                <div class="flex alignCenter">
                  <div class="ranking">
                    <img v-if="(index + 1) <= 3" :src="item.rankingNum==1?'/static/img/icon_guanjun@2x.png':item.rankingNum==2?'/static/img/icon_yajun@2x.png':'/static/img/icon_jijun@2x.png'">
                    <span v-else>{{item.rankingNum}}</span>
                  </div>
                  <div class="headimg"><img src="/static/img/avatar@2x.png" ></div>
                  <div>{{item.studentName}}</div>
                </div>
                <div class="flex alignCenter">
                  <div class="score">{{item.medalCardNum}}</div>
                </div>
              </li>
              <li class="lookRankList" v-if="rankList.length == 5" @click="jump('/RankList','stu')">查看全部榜单</li>
            </ul>
            <div class="empty" v-else>
              <v-empty-list :text="'无数据'"></v-empty-list>
            </div>
          </li>
          <li class="detail">
            <div style="position:relative">
              <div class="select flex alignCenter" @click="showWd('wc')"><span class="dimensionName text-overflow">{{dimension['wc'].dimensionName ? dimension['wc'].dimensionName : '全部卡片'}}</span><img src="/static/img/icon_down.png"></div>
              <div class="title alignSelfCenter">位次变化</div>
            </div>

            <div class="echarts">
              <div class="rangeSelect flex">
                <input type="radio" name="frequency" v-model="range" value="1" id="1"><label for="1">班级</label>
                <input type="radio" name="frequency" v-model="range" value="2" id="2"><label for="2">年级</label>
                <input type="radio" name="frequency" v-model="range" value="3" id="3"><label for="3">全校</label>
              </div>
              <v-line ref="lineChart" v-show="hasLineChartData"></v-line>
              <div class="empty" v-show="!hasLineChartData">
                <v-empty-list :text="'无数据'"></v-empty-list>
              </div>
            </div>
          </li>
          <li class="detail">
            <div style="position:relative">
              <div class="select flex alignCenter" @click="showWd('zs')"><span class="dimensionName text-overflow">{{dimension['zs'].dimensionName ? dimension['zs'].dimensionName : '全部卡片'}}</span><img src="/static/img/icon_down.png" alt=""></div>
              <div class="title alignSelfCenter">获卡数量走势</div>
            </div>
            <div class="echarts" v-show="hasLinesChartData">
              <v-lines ref="linesChart"></v-lines>
            </div>
            <div class="empty" v-show="!hasLinesChartData">
              <v-empty-list :text="'无数据'"></v-empty-list>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!--按周，按月选择器-->
    <mt-popup v-model="popupVisible" v-roll:visible=[popupVisible,stuVisible] position="bottom" class="mint-popup">
      <mt-picker :slots="dataList" :visible-item-count="5" :show-toolbar="true" ref="picker" value-key="name"
                 :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm">完成</div>
        </div>
      </mt-picker>
    </mt-popup>

    <!--学生列表选择器-->
    <mt-popup v-model="stuVisible" v-roll:visible=[popupVisible,stuVisible] position="bottom" class="mint-popup">
      <mt-picker :slots="stuList" :visible-item-count="5" :show-toolbar="true" ref="stupicker" value-key="studentName"
                 :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="stuVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm">完成</div>
        </div>
      </mt-picker>
    </mt-popup>

    <!--维度选择器-->
    <v-wd-select ref="wd" @getWdInfo="getWdInfo" @getWdName="getWdName"></v-wd-select>
  </div>
</template>

<script>
  import WdSelect from '@/components/wdSelect/WdSelect.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import Time from '@/components/time/Time.vue'
  import Radar from '@/components/echarts/Radar.vue'
  import LineChart from '@/components/echarts/Line.vue'
  import LinesChart from '@/components/echarts/Lines.vue'
  import {CountApi,PjApi} from '@/utils/api'

  export default {
    name: 'StudentDetail',
    components: {
      "v-time": Time,
      'v-wd-select': WdSelect,
      'v-empty-list': EmptyList,
      "v-radar": Radar,
      "v-line": LineChart,
      "v-lines": LinesChart
    },
    data() {
      return {
        stuRankList: JSON.parse(sessionStorage.getItem('stuRankList')), // 榜单列表里面的学生

        isStu: this.$route.query.isStu, // 是否是本人
        name: this.$route.query.name,
        className: this.$route.query.className,
        studentCode: this.$route.query.studentCode,
        classCode: this.$route.query.classCode,
        userId: this.$cookie.get('userId'),

        totalCount: 0, // 本周共发卡
        preTotalCount: 0, // 上周共发卡
        range: '1', // 位次（班级1年级2全校3）
        hasRadarData: true, // 获卡趋势是否有数据
        hasLineChartData: true, // 位次变化是否有数据
        hasLinesChartData: true, // 获卡数量走势是否有数据
        stuVisible: false,
        popupVisible: false,
        dimensionType: 'wc', // wc位次，zs，走势
        dimension: {
          'wc': {dimensionId: '',dimensionName: ''}, // 位次
          'zs': {dimensionId: '',dimensionName: ''} // 走势
        },
        searchTime: '按周',
        timeText: '',
        startTime: '',
        endDate: '',
        weekId: '',
        rankTimeType: 1, // 时间范围（week:按周，month:按月）
        timeList: [
          {type: 1, name: '按周'},
          {type: 2, name: '按月'}
        ],
        myRankInfo: null, // 我的排行信息
        rankChartInfo: {
          class: [],
          grade: [],
          school: []
        },
        list: [],
        rankList: [],
      }
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
      stuList() {
        let dateSlots = [
          {
            flex: 1,
            values: this.stuRankList,
            className: 'slot1',
            textAlign: 'center'
          }
        ];
        return dateSlots
      }
    },
    watch: {
      dimension: {
        handler: function () {
          if(this.dimensionType == 'wc') {
            this.getRankChart()
          } else {
            this.getStudentMedalCardsMovementsChart()
          }
        },
        deep: true
      },
      range(nVal) {
        if (nVal == 1) {
          this.setLineCharts(this.rankChartInfo.class)
        } else if (nVal == 2) {
          this.setLineCharts(this.rankChartInfo.grade)
        } else {
          this.setLineCharts(this.rankChartInfo.school)
        }
      },
      weekId(nVal) {
        if(nVal) {
          this.getChartData() // 获取图表数据
          this.getRecordInfo()
        }
      },
      studentCode(nVal) { // 切换学生
        if(nVal && this.weekId && this.rankTimeType == 1) {
          this.getChartData() // 获取图表数据
          this.getRecordInfo()
        }
      }
    },
    activated(){
      this.getQuery()
      setTimeout(() => {
        this.initData()
      },100)
    },
    methods: {
      async getRecordInfo() {
        if(!this.startTime) return;
        let data = {
          rankTimeType: this.rankTimeType,
          startTime: this.startTime,
          studentId: this.studentCode
        };
        const res = await this.$req.get(PjApi.recordInfo, data);
        if (res.resultCode == 1) {
          this.totalCount = res.value.totalCount;
          this.preTotalCount = res.value.preTotalCount;
          this.list = res.value.list || []
        }
      },
      async getStudentMedalCardsTrendChart() {
        if(!this.weekId) return;
        let data = {
          rankTimeType: this.rankTimeType,
          studentCode: this.studentCode,
          weekId: this.weekId
        };
        const res = await this.$req.get(CountApi.getStudentMedalCardsTrendChart, data);
        let {resultCode,value} = res;
        if (resultCode == 1) {
          let wdList = [],classMedalAvgNum = [],gradeMedalAvgNum = [],myMedalNum = [];
          if (!value) {
            this.hasRadarData = false;
            this.$refs.radar.clear();
            return;
          };
          this.hasRadarData = true;
          for(let key in value) {
            wdList.push({
              name: value[key].dimensionName
            });
            classMedalAvgNum.push(value[key].classMedalAvgNum || 0);
            gradeMedalAvgNum.push(value[key].gradeMedalAvgNum || 0);
            myMedalNum.push(value[key].myMedalNum || 0)
          }
          this.$refs.radar.radarOptions.radar.indicator = wdList;
          this.$refs.radar.radarOptions.series[0].data[0].value = myMedalNum;
          this.$refs.radar.radarOptions.series[0].data[1].value = gradeMedalAvgNum;
          this.$refs.radar.radarOptions.series[0].data[2].value = classMedalAvgNum;
          this.$refs.radar.clear();
          setTimeout(() => {
            this.$refs.radar.initChart()
          })
        }
      },
      async getStarRankInfo() {
        let data = {
          code: this.classCode,
          rankTimeType: this.rankTimeType,
          rankScope: 'class',
          starType: 2,
          dimensionId: '',
          startDate: this.startTime,
          endDate:this.endDate
        };
        const res = await this.$req.get(CountApi.getStarRankInfo, data);
        if (res.resultCode == 1) {
          this.rankList = (res.value.studentRankVOList && res.value.studentRankVOList.length >= 5 ) ? res.value.studentRankVOList.splice(0,5) : res.value.studentRankVOList || [];
          this.rankList.forEach((c) => {
            if(c.studentCode == this.userId) {
              this.myRankInfo = c;
            }
          })
        }
      },
      async getRankChart() {
        let data = {
          studentCode: this.studentCode,
          rankTimeType: this.rankTimeType,
          dimensionId: this.dimension['wc'].dimensionId,
          weekId: this.weekId
        };
        if(!this.isSelf){
          data.studentCode = this.studentCode
        }
        const res = await this.$req.get(CountApi.getRankChart, data);
        if (res.resultCode == 1) {
          for(let key in res.value) {
            this.rankChartInfo[key] = res.value[key];
            if (res.value['class'].length == 0) {
              this.hasLineChartData = false;
              this.$refs.lineChart.clear();
              return;
            };
          }
          this.hasLineChartData = true;
          this.setLineCharts(this.rankChartInfo.class)
        }
      },
      async getStudentMedalCardsMovementsChart() {
        let data = {
          studentCode: this.studentCode,
          rankTimeType: this.rankTimeType,
          dimensionId: this.dimension['zs'].dimensionId,
          weekId: this.weekId
        };
        const res = await this.$req.get(CountApi.getStudentMedalCardsMovementsChart, data);
        if (res.resultCode == 1) {
          let xAxisData = [],myMedalNum = [],classMedalAvgNum = [],gradeMedalAvgNum = [],schoolMedalAvgNum = [];
          if (!res.value) {
            this.hasLinesChartData = false;
            this.$refs.linesChart.clear();
            return;
          };
          this.hasLinesChartData = true;
          for(let key in res.value) {
            myMedalNum.push(res.value[key].myMedalNum || 0);
            classMedalAvgNum.push(res.value[key].classMedalAvgNum || 0);
            gradeMedalAvgNum.push(res.value[key].gradeMedalAvgNum || 0);
            schoolMedalAvgNum.push(res.value[key].schoolMedalAvgNum || 0);
            if (this.rankTimeType == 1) {
              xAxisData.push(res.value[key].weekName);
            } else {
              xAxisData.push(res.value[key].dateStr);
            }
          }
          this.$refs.linesChart.lineOptions.xAxis.data = xAxisData;
          this.$refs.linesChart.lineOptions.series[0].data = myMedalNum;
          this.$refs.linesChart.lineOptions.series[1].data = schoolMedalAvgNum;
          this.$refs.linesChart.lineOptions.series[2].data = gradeMedalAvgNum;
          this.$refs.linesChart.lineOptions.series[3].data = classMedalAvgNum;
          this.$refs.linesChart.clear();
          setTimeout(() => {
            this.$refs.linesChart.initChart()
          })
        }
      },

      setLineCharts(data) {
        let xAxisData = [],seriesData = [];
        this.hasLineChartData = data.length > 0 ? true : false;
        data.forEach((c) => {
          if (this.rankTimeType == 1) {
            xAxisData.push(c.weekName);
          } else {
            xAxisData.push(c.dataStr);
          }
          seriesData.push(c.medalNum);
        });
        this.$refs.lineChart.lineOptions.xAxis.data = xAxisData;
        this.$refs.lineChart.lineOptions.series[0].data = seriesData;
        this.$refs.lineChart.clear();
        setTimeout(() => {
          this.$refs.lineChart.initChart()
        })
      },
      getQuery() {
        this.isStu = this.$route.query.isStu; // 是否是本人
        this.name = this.$route.query.name;
        this.className = this.$route.query.className;
        this.studentCode = this.$route.query.studentCode;
        this.classCode = this.$route.query.classCode;
      },
      initData() {
        this.searchTime = '按周'
        this.rankTimeType = 1;
        this.range = '1';
        this.$refs.time.type = 1;
        this.popupVisible = false;
        this.stuVisible = false;
        this.$refs.wd.hide();
      },
      showWd(type) {
        this.dimensionType = type;
        this.$refs.wd.show();
      },
      getTimeWB(data) {
        this.timeText = data.text;
        this.weekId = data.weekId;
        this.startTime = data.startTime;
        this.endDate = data.endTime;
      },
      getChartData() {
        this.getStudentMedalCardsTrendChart();
        this.getStarRankInfo();
        this.getRankChart();
        this.getStudentMedalCardsMovementsChart()
      },
      onConfirm() {
        let subjectSelected;
        if(this.stuVisible) {
          subjectSelected = this.$refs.stupicker.getValues()[0];
          this.studentCode = subjectSelected.studentCode;
          this.name = subjectSelected.studentName;
        } else if(this.popupVisible){
          subjectSelected = this.$refs.picker.getValues()[0];
          this.range = '1';
          this.rankTimeType = subjectSelected.type;
          this.searchTime = subjectSelected.name;
          this.$refs.time.type = this.rankTimeType;
        }
        this.popupVisible = this.stuVisible = false;
      },
      getWdName(data) {
        this.dimension[this.dimensionType].dimensionName = '';
        data.forEach((c) => {
          this.dimension[this.dimensionType].dimensionName += c.name + '-'
        });
        this.dimension[this.dimensionType].dimensionName = this.dimension[this.dimensionType].dimensionName.substring(0,this.dimension[this.dimensionType].dimensionName.length-1)
      },
      getWdInfo(info) {
        this.dimension[this.dimensionType].dimensionId = info.id;
      },
      //跳转
      jump(path,type) {
        this.$router.push({
          path,
          query: {
            type,
            gradeCode: ''
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .studentDetail {
    height: 100%;
    background-color: #ffffff;

    .head {
      height: 88px;
      padding: 0 32px;
      background: rgba(255, 255, 255, 1);
      justify-content: space-between;
      .class {
        font-size: 36px;
        line-height: 64px;
        color: rgba(38, 38, 39, 1);
        span{
          font-weight: 600;
          color: #262627;
          font-size: 36px;
        }
        i{
          color: #C7C7CC;
          font-size: 26px;
        }
      }
      .flag {
        width: 180px;
        height: 60px;
        background: rgba(237, 247, 255, 1);
        opacity: 1;
        border-radius: 44px;
        font-size: 30px;
        font-weight: 400;
        line-height: 64px;
        color: rgba(51, 165, 255, 1);
        text-align: center;
      }
    }
    .content {
      background: url('./img/bg.png') no-repeat;
      .nav {
        padding: 40px 32px;
        justify-content: space-between;
        align-items: flex-start;
        .icon_down {
          width: 33px;
          height: 28px;
        }
        .headerimg {
          height: 100px;
          width: 100px;
          border-radius: 50%;
          margin-right: 16px;
        }
        .name {
          font-size: 40px;
          font-weight: 800;
          // line-height:64px;
          color: rgba(38, 38, 39, 1);
        }
        .class {
          margin-top: 4px;
          font-size: 28px;
          font-weight: 400;
          // line-height:64px;
          color: rgba(182, 184, 184, 1);
        }
      }
      .detailList {
        background-color: #fff;
        margin: 0 32px;
        box-shadow: 0px 6px 24px rgba(86, 104, 119, 0.15);
        border-radius: 20px;
        .listhead {
          opacity: 1;
          border-radius: 20px 20px 0px 0px;
          font-size: 36px;
          font-weight: 800;
          line-height: 64px;
          color: rgba(38, 38, 39, 1);
          text-align: center;
          padding: 12px 32px 14px 32px;
          i {
            color: #C7C7CC;
            font-size: inherit;
          }
        }
      }
      .detail {
        padding: 0 32px;
        margin-bottom: 60px;
        .dimensionName {
          display: inline-block;
          max-width: 120px;
        }
        .jlk-title {
          color: #262627;
          font-size: 32px;
          margin-top: 20px;
          margin-bottom: 40px;
          span {
            color: #33A5FF;
            font-weight: 600;
          }
        }
        .jlk-list {
          .fl {
            margin-bottom: 30px;
          }
          .margin {
            margin-left: 40px;
            margin-right: 100px;
          }
          .img-box {
            width: 216px;
            height: 100px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .bottom  {
            position: relative;
            color: #262727;
            font-size: 28px;
            margin-top: 20px;
            .left {
              width: 150px;
            }
            .right {
              position: absolute;
              bottom: -5px;
              right: 0;
            }
            span {
              color: #33A5FF;
              font-weight: 600;
            }
            .num {
              font-size: 48px;
              &:before {
                content: 'X';
                font-size: 28px;
                position: absolute;
                left: -25px;
                bottom: 5px;
              }
            }
          }
        }
        .title {
          text-align: center;
          font-size: 36px;
          font-weight: bold;
          line-height: 64px;
          color: rgba(38, 39, 39, 1);
          &::after {
            content: '';
            display: block;
            width: 72px;
            height: 8px;
            background: rgba(255, 182, 0, 1);
            opacity: 1;
            border-radius: 4px;
            margin: 0 auto;
          }
        }
        .select {
          position: absolute;
          top: 15px;
        }
        .value {
          font-size: 32px;
          font-weight: 400;
          // line-height:64px;
          color: rgba(38, 38, 39, 1);
          margin-top: 20px;
        }
        .cardGet {
          margin: 0 40px;
          margin-top: 42px;
          flex-wrap: wrap;
          justify-content: space-between;
          .box {
            margin-bottom: 20px;
            .cardName {
              justify-content: space-between;
              align-items: baseline;
              margin-top: 10px;
              .name {
                font-size: 28px;
                font-weight: 400;
                line-height: 64px;
                color: rgba(38, 39, 39, 1);
              }
              .count {
                font-size: 48px;
                font-weight: bold;
                line-height: 40px;
                span {
                  font-family: PingFang SC;
                  font-size: 28px;
                }
              }
            }

          }
        }
        .echarts {
          height: 544px;
          margin-top: 40px;
          .rangeSelect {
            width: 240px;
            height: 40px;
            background: #EFF1F3;
            opacity: 1;
            border-radius: 34px;
            text-align: center;
            align-items: center;
            margin: 0 auto;
            input[type="radio"] {
              display: none;
              &:checked + label {
                width: 80px;
                height: 40px;
                background: rgba(51, 165, 255, 1);
                opacity: 1;
                border-radius: 34px;
                color: #fff;
              }
            }
            label {
              flex: 1;
              color: #B6B8B8;
              font-size: 24px;
              font-weight: 400;
              line-height: 40px;
            }
          }
        }
        .empty {
          position: relative;
          height: 410px;
        }
        .studentlist {
          padding: 0 32px;
          padding-top: 20px;
          margin-bottom: 40px;
          .stuinfo {
            padding: 20px 0;
            font-size: 28px;
            font-weight: 400;
            line-height: 40px;
            color: rgba(38, 39, 39, 1);
            justify-content: space-between;
            .ranking {
              height: 64px;
              width: 46px;
              margin-right: 40px;
              font-size: 36px;
              font-weight: bold;
              line-height: 64px;
              text-align: center;
              color: rgba(38, 39, 39, 1);
            }
            .headimg {
              height: 80px;
              width: 80px;
              margin-right: 20px;
            }
            .score {
              font-size: 36px;
              font-weight: bold;
              line-height: 40px;
              color: rgba(51, 165, 255, 1);
            }
            .right-icon {
              color: rgba(199, 199, 204, 1);
              margin-left: 20px;
            }
          }
          .me {
            background: url('./img/myranking.png') no-repeat;
            background-size: 100% 100%;
            color: #fff;
            margin: 0px -20px;
            padding: 20px;
            .ranking, .score {
              color: #fff;
            }
          }
        }
      }
    }

    .lookRankList {
      height: 80px;
      line-height: 80px;
      color: #B6B8B8;
      font-size: 28px;
      text-align: center;
      border-top: 2px solid #EFF1F3;
    }
    img {
      height: inherit;
      width: inherit;
    }
    .right-icon {
      display: inline;
      transform: rotate(180deg);
    }
    .down-icon {
      display: inline-block;
      transform: rotate(-90deg);
      color: #C7C7CC;
      margin-left: 5px;
    }
    .blue {
      color: #33A5FF;
      font-weight: bold;
    }
    .select {
      font-size: 28px;
      font-weight: 400;
      color: rgba(38, 39, 39, 1);
      span {
        margin-right: 16px;
      }
    }
  }
</style>

