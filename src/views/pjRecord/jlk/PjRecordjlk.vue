<template>
  <div class="record-jlk-box">
    <div class="header">
      <div class="tab-box clear">
        <div class="tab-item fl" @click="tab(1)">发卡</div>
        <div class="tab-item fl" @click="tab(2)">班级</div>
        <div class="tab-item fl" @click="tab(3)">提醒</div>
        <span
          :class="{
          'span_left0': type == 1,
          'span_left160': type == 2,
          'span_left320': type == 3}"
        >{{type == 1 ? '发卡' : type == 2 ? '班级' : '提醒'}}</span>
      </div>
    </div>
    <!-- type 1发卡,2班级,3提醒   -->
    <div class="record-content">
      <div class="search-box1" @click="popupVisible=true" v-show="type != 2">
        <span>{{rankTimeType == 1 ? '按周' : '按月'}}</span>
        <span class="icon_down"></span>
      </div>

      <div class="section" v-show="type != 2">
        <!--时间本周本月本学期-->
        <v-time ref="time" @getTimeWB="getTimeWB"></v-time>

        <div class="jlk-box" v-show="type == 1">
          <p>
            本{{ rankTimeType == 1 ? '周' : '月' }}共发卡
            <span>{{totalCount}}</span>
            张，比上{{rankTimeType == 1 ? '周' : '月'}}
            {{ totalCount - preTotalCount > 0 ? '多' : '少' }} 发
            <span>{{ Math.abs(totalCount - preTotalCount) }}</span>
            张
            <span class="jiantou">{{totalCount - preTotalCount > 0 ? '↑' : '↓'}}</span>
          </p>
          <div class="jlk-list clear">
            <div class="fl cardbox" :class="{'margin' : (index+1)%2 != 0}" v-for="(item,index) in list" :key="index">
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
        </div>

        <div class="jlk-box" v-show="type == 3">
          <p>本周提醒<span>{{totalPeople}}</span>人，共<span>{{numberOfTimes}}</span>次</p>
          <ul class="student-list clear">
            <li class="fl" :class="{'marginRight0': (index+1)%3 == 0}" v-for="(item,index) in studentDetail"
                :key="index">
              <div class="img-box"></div>
              <div class="name text-overflow">{{item.studentName}}</div>
              <div class="class text-overflow">{{item.className}}</div>
              <div class="cs"><span>{{item.count}}</span>次</div>
            </li>
          </ul>
        </div>

      </div>
      <div class="section">
        <div class="top flex alignCenter" v-show="type != 2">
          <div class="flex_1">
            <div class="tab-box2 clear" v-show="type == 1">
              <div class="tab-item2 fl" @click="toggleTeam(false)">个人</div>
              <div class="tab-item2 fl" @click="toggleTeam(true)">团队</div>
              <span
                :class="{
                'span_left0': !is_team,
                'span_left100': is_team
                }"
              >{{is_team ? '团队' : '个人'}}</span>
            </div>
            <div class="title" v-show="type == 3">记录</div>
          </div>
          <div class="right">
            <v-search ref='search' :placeholder="'搜索记录'" @getSearch="getSearch"></v-search>
          </div>
        </div>

        <!-- 个人-->
        <div class="content" v-show="type == 1 && !is_team">
          <v-jlk-send v-if="recordList.length > 0" :list="recordList"></v-jlk-send>
          <div class="empty" v-else>
            <v-empty-list :text="'无数据'"></v-empty-list>
          </div>
        </div>

        <!-- 团队-->
        <div class="content"  v-show="type == 1 && is_team">
          <v-jlk-team v-if="teamList.length > 0" :list="teamList"></v-jlk-team>
          <div class="empty" v-else>
            <v-empty-list :text="'无数据'"></v-empty-list>
          </div>
        </div>

        <!-- 班级-->
        <div class="bj-box" v-show="type == 2">
          <v-record-list
            ref="recordList"
            :pjTabList="pjTabList"
            :recordList="recordList"
            @getRewardType="getRewardType"
          ></v-record-list>
        </div>

        <!-- 提醒-->
        <div class="content" v-show="type == 3">
          <v-jlk-tx v-if="txList.length > 0" :list="txList"></v-jlk-tx>
          <div class="empty" v-else>
            <v-empty-list :text="'无数据'"></v-empty-list>
          </div>
        </div>
      </div>
    </div>

    <!--撤销评价记录？-->
    <v-confirm ref="confirm" :content="type === 2 ? '撤销后该记录在教师端/学生端都不显示，班级增加/减少的分数或者勋章原路返回' : '撤销后该记录在教师端/学生端都不显示，学生增加/减少的分数或者勋章原路返回'" @sure="undoRecord"></v-confirm>

    <!--底部判断是加载图标还是提示“全部加载”-->
    <div class="wait-list-loading" v-show="queryLoading" v-if="recordList.length > 10 || teamList.length > 10 || txList.length > 10">
      <span v-show="moreLoading&&!allLoaded">加载中...</span>
      <span v-show="allLoaded">已全部加载</span>
    </div>

    <!--选择器-->
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
      <mt-picker :slots="dataList" :visible-item-count="5" :show-toolbar="true" ref="picker" value-key="name"
                 :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm">完成</div>
        </div>
      </mt-picker>
    </mt-popup>
  </div>
</template>

<script>
  import {PjApi, RemindApi} from '@/utils/api'

  import RecordList from '@/components/pjRecord/RecordList.vue'
  import Time from '@/components/time/Time.vue'
  import Search from '@/components/Search.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import Confirm from "@/components/confirm/confirm.vue";

  import JLKSend from './jlk-send.vue'
  import JLKTeam from './jlk-team.vue' // 团队
  import JLKTX from './jlk-tx.vue'

  export default {
    name: 'PjRecordjlk',
    components: {
      'v-time': Time,
      'v-search': Search,
      'v-record-list': RecordList,
      "v-confirm": Confirm,
      'v-jlk-send': JLKSend, // 发卡
      'v-jlk-tx': JLKTX, // 提醒
      'v-jlk-team': JLKTeam, // 团队
      'v-empty-list': EmptyList
    },
    data () {
      return {
        userId: this.$cookie.get('userId'), // 当前登录人
        xxdm: this.$cookie.get('xxdm'), // 学校代码

        type: 1, // 1发卡,2班级，3提醒
        is_team: false, // 团队true,个人false
        popupVisible: false,
        queryLoading: true,
        moreLoading: false,
        allLoaded: false,
        isbool: true, // 滚动到底部加载数据并且防止触发多次
        recordId: '', // 要撤销的记录项id
        page: 1, // 当前页码
        limit: 10, // 每页显示记录条数
        totalCount: 0, // 本周共发卡
        preTotalCount: 0, // 上周共发卡
        totalPeople: 0, // 本周提醒人数
        numberOfTimes: 0, // 共几次
        keyWords: '',
        rewardType: '',
        rankTimeType: 1, // 1 周 2 月
        startTime: '',
        endTime: '',
        timeList: [
          {type: 1, name: '按周'},
          {type: 2, name: '按月'}
        ],
        pjTabList: [
          {type: 0, name: '全部'},
          {type: 3, name: '加分'},
          {type: 4, name: '减分'}
        ],
        list: [], // 发卡列表
        recordList: [],
        teamList: [],// 团队列表
        txList: [],
        studentDetail: [], // 提醒统计
      }
    },
    computed: {
      dataList () {
        let dateSlots = [
          {
            flex: 1,
            values: this.timeList,
            className: 'slot1',
            textAlign: 'center'
          }
        ]
        return dateSlots
      },
    },
    watch: {
      /*
      * 周次切换
      * */
      startTime (nVal) {
        if (nVal) {
          if (this.type == 1) {
            // 发卡
            let p1 = this.is_team ? this.getTeamList : this.getRecordList;

            Promise.all([
              this.initData(),
              this.getRecordInfo(),
              p1()
            ]).then(() => {
            }).catch((error) => {
              console.log(error);
            });
          } else if(this.type == 3){
            // 提醒
            Promise.all([this.getPageList(), this.getRemindStatistics()]).then(() => {}).catch((error) => {
              console.log(error)
            })
          }
        }
      },
      '$route' (to, from) {
        if(from.path == '/pjrecord') {
          // 避免多次触发
          this.$root.eventHub.$off("revokeRecord", this.revokeRecord);
        }
      }
    },
    activated () {
      this.type = 1; // 默认显示发卡
      this.keyWords = '';
      this.$refs.search.keyWord = '';

      let p1 = this.initWeek,
          p2 = this.initData,
          p3 = null,
          p4 = null;

      //默认在按周查询才请求(因为watch监听的原因会触发两次请求)
      if (this.rankTimeType == 1) {
        p3 = this.getRecordInfo;
        p4 = this.getRecordList;
      }
      this.is_team = false; // 默认显示个人(发卡)
      Promise.all([
        p1(),
        p2(),
        p3 ? p3() : null,
        p4 ? p4() : null
      ]).then(() => {}).catch((error) => {
        console.log(error)
      })
      // 监听撤销评价记录事件
      this.$root.eventHub.$on("revokeRecord", this.revokeRecord);
    },
    methods: {
      /*
      * 获取激励卡一级子勋章获取统计
      * */
      async getRecordInfo () {
        if (!this.startTime) return
        let data = {
          rankTimeType: this.rankTimeType,
          startTime: this.startTime,
          zgh: this.userId
        }
        const res = await this.$req.get(PjApi.recordInfo, data)
        if (res.resultCode == 1) {
          this.totalCount = res.value.totalCount
          this.preTotalCount = res.value.preTotalCount
          this.list = res.value.list || []
        }
      },
      /*
      * 获取发卡记录列表
      * */
      async getRecordList (page) {
        if (!this.startTime) return;
        this.page = page || this.page;
        this.$indicator.open('加载中...');
        let data = {
          type: '1,2',
          page: this.page,
          limit: this.limit,
          evaluator: this.userId,
          keyWords: this.keyWords,
          rewardType: 5,
          startTime: this.rankTimeType == 1 ? this.startTime : this.startTime + ' 00:00:00',
          endTime: this.rankTimeType == 1 ? this.endTime : this.endTime + ' 23:59:59'
        }
        this.isbool = false;
        const res = await this.$req.post(PjApi.getPjxRecordList, data)
        let {resultCode, value} = res
        if (resultCode == 1) {
          let list = value.dataList
          let arr = list.filter((c) => {
            return c.score || c.medal
          })
          this.recordList = [...this.recordList, ...arr];

          if (list.length >= this.limit) {
            this.page++
          } else {
            this.allLoaded = true
          }
          this.isbool = true;
        }
      },
      /*
      * 获取团队记录列表
      * */
      async getTeamList() {
        if (!this.startTime) return;
        this.$indicator.open('加载中...')
        let data = {
          page: this.page,
          limit: this.limit,
          evaluator: this.userId,
          schoolCode: this.xxdm,
          keyWords: this.keyWords,
          rewardType: 5,
          startTime: this.rankTimeType == 1 ? this.startTime : this.startTime + ' 00:00:00',
          endTime: this.rankTimeType == 1 ? this.endTime : this.endTime + ' 23:59:59'
        }
        this.isbool = false;
        const res = await this.$req.post(PjApi.getTeamRList, data)

        if(res.resultCode == 1) {
          let list = res.value.dataList
          this.teamList = [...this.teamList, ...list]

          if (list.length >= this.limit) {
            this.page++
          } else {
            this.allLoaded = true
          }
          this.isbool = true;
        }
      },
      /*
      * 获取班级记录列表
      * */
      async getClassPjList () {
        let data = {
          type: 1,
          page: this.page,
          limit: this.limit,
          evaluationObject: 2,
          rewardType: this.rewardType,
          evaluator: this.userId
        }
        this.isbool = false;
        this.$indicator.open('加载中...');
        const res = await this.$req.get(PjApi.getRecordList, data);
        let {resultCode, value} = res
        if (resultCode == 1) {
          this.recordList = [...this.recordList, ...value.dataList]
          if (value.dataList.length >= this.limit) {
            this.page++
          } else {
            this.allLoaded = true
          }
          this.isbool = true;
        }
      },
      /*
      * 获取提醒记录列表
      * */
      async getPageList () {
        if (!this.startTime) return;
        let data = {
          page: this.page,
          limit: this.limit,
          timeType: this.rankTimeType,
          teacherId: this.userId,
          keyWord: this.keyWords,
          startTime: this.rankTimeType == 1 ? this.startTime : this.startTime + ' 00:00:00'
        }
        this.isbool = false;
        this.$indicator.open('加载中...')
        const res = await this.$req.get(RemindApi.getPageList, data)
        let {resultCode, value} = res
        if (resultCode == 1) {
          this.txList = [...this.txList, ...value.dataList]
          if (value.dataList.length >= this.limit) {
            this.page++
          } else {
            this.allLoaded = true
          }
          this.isbool = true;
        }
      },
      /*
      * 获取提醒统计
      * */
      async getRemindStatistics () {
        if (!this.startTime) return
        let data = {
          teacherId: this.userId,
          timeType: this.rankTimeType,
          startTime: this.rankTimeType == 1 ? this.startTime : this.startTime + ' 00:00:00'
        }
        const res = await this.$req.get(RemindApi.getRemindStatistics, data)
        if (res.resultCode == 1) {
          this.numberOfTimes = res.value.numberOfTimes
          this.studentDetail = res.value.studentDetail
          this.totalPeople = res.value.totalPeople
        }
      },
      /*
      * 撤销评价记录
      * */
      async undoRecord() {
        const res = await this.$req.put(PjApi.undoRecord+this.recordId);

        if (res.resultCode == 1) {
          this.$toast('撤销成功');
          this.$refs.confirm._hide();
          this.$root.eventHub.$emit('closeDetailModal');
          let p1 = this.initData,
            p2 = null;
          if(this.type == 2) { // 班级
            p2 = this.getClassPjList
          } else {
            p2 = this.getRecordList
          }
          Promise.all([p1(), p2 ? p2() : null]).then(() => {
          }).catch((error) => {
            console.log(error);
          });
        }
      },
      /*
      * 是否撤销评价记录?
      * */
      revokeRecord(id) {
        this.recordId = id;
        this.$refs.confirm._show();
      },

      getRewardType (key) {
        this.rewardType = this.pjTabList[key].type

        Promise.all([this.initData(), this.getClassPjList()]).then(() => {}).catch((error) => {
          console.log(error)      // 失败了，打出 '失败'
        })
      },
      getSearch (keyWords) {
        let p1 = this.initData,
            p2 = null;

        this.keyWords = keyWords;
        if (this.type == 1) {
          if(this.is_team) { // 团队
            p2 = this.getTeamList;
          } else {
            p2 = this.getRecordList;
          }
        } else {
          p2 = this.getPageList;
        }

        Promise.all([p1(), p2 ? p2() : null]).then(() => {}).catch((error) => {
          console.log(error)      // 失败了，打出 '失败'
        })
      },
      initData () {
        this.page = 1
        this.allLoaded = false
        this.popupVisible = false
        this.recordList = []
        this.teamList = []
        this.txList = []
      },
      initWeek () {
        this.rankTimeType = 1
        this.$refs.time.type = 1
      },
      onConfirm () {
        let subjectSelected = this.$refs.picker.getValues()[0]
        this.rankTimeType = subjectSelected.type
        this.$refs.time.type = subjectSelected.type
        this.popupVisible = false
      },
      getTimeWB (data) {
        /*this.startTime = data.startTime ? data.startTime.replace(/-/g,'/') : null;
        this.endTime = data.endTime ? data.endTime.replace(/-/g,'/') : null;*/
        this.startTime = data.startTime;
        this.endTime = data.endTime
      },
      /*
      * tab选项卡切换获取相应数据
      * @param type 1，发卡 2，班级 3，提醒
      * */
      tab (type) {
        this.keyWords = ''
        this.$refs.search.keyWord = ''
        this.type = type

        Promise.all([this.initData(), this.tabHttp()]).then(() => {}).catch((error) => {
          console.log(error)      // 失败了，打出 '失败'
        })
      },
      tabHttp () {
        if (this.type == 2) { // 班级
          this.$refs.recordList.type = 2;
          this.getClassPjList();
        } else {
          let p1 = null,
              p2 = null,
              p3 = this.initWeek;

          if (this.rankTimeType == 1) { // 按周
            if (this.type == 1) { // 发卡
              p1 = this.getRecordInfo;
              p2 = this.is_team ? this.getTeamList :this.getRecordList;

            } else { // 提醒
              p1 = this.getPageList;
              p2 = this.getRemindStatistics;
            }
          }
          Promise.all([p1 ? p1() : null,p2 ? p2() : null,p3()]).then(() => {}).catch((error) => {
            console.log(error)      // 失败了，打出 '失败'
          })
        }
      },
      /*
      * 个人，团队切换
      * */
      toggleTeam (bool) {
        if(this.is_team == bool) return;

        this.is_team = bool;
        let p1 = this.initData,
            p2 = null;

        p2 = bool ? this.getTeamList : this.getRecordList;

        Promise.all([p1(),p2()]).then(() => {}).catch((error) => {
          console.log(error)
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .record-jlk-box {
    .header {
      height: 78px;
      padding-top: 10px;
      background-color: #FFFFFF;

      .tab-box {
        position: relative;
        width: 480px;
        height: 68px;
        margin: 0 auto;
        border-radius: 34px;
        cursor: pointer;
        background-color: #EFF1F3;

        .tab-item {
          width: 160px;
          line-height: 68px;
          text-align: center;
          color: #B6B8B8;
          font-size: 30px;
        }

        .active {
          color: #ffffff;
        }

        span {
          position: absolute;
          top: 0;
          width: 160px;
          height: 68px;
          line-height: 68px;
          color: #ffffff;
          font-size: 28px;
          text-align: center;
          border-radius: 34px;
          background-color: #33A5FF;
          transition: all .2s;
        }

        .span_left0 {
          left: 0;
        }

        .span_left160 {
          left: 160px
        }

        .span_left320 {
          left: 320px
        }
      }
    }

    .record-content {
      padding: 0 32px;

      .search-box1 {
        width: 200px;
        height: 88px;
        line-height: 88px;

        span {
          color: #262727;
          font-size: 28px;
          margin-right: 10px;
        }

        .icon_down {
          display: inline-block;
          width: 33px;
          height: 28px;
          vertical-align: top;
          background: url('/static/img/icon_down@2x.png') no-repeat center;
          background-size: 33px auto;
          margin-top: 30px;
        }
      }

      .section {
        margin-bottom: 20px;
        border-radius: 20px;
        background-color: #FFFFFF;

        .tab-box2 {
          position: relative;
          width: 200px;
          height: 48px;
          border-radius: 24px;
          cursor: pointer;
          background-color: #EFF1F3;
          border-bottom: 1px solid #EFF1F3;

          .tab-item2 {
            width: 100px;
            line-height: 48px;
            text-align: center;
            color: #262727;
            font-size: 28px;
          }

          .active {
            color: #ffffff;
          }

          span {
            position: absolute;
            top: 0;
            width: 100px;
            height: 48px;
            line-height: 48px;
            color: #ffffff;
            font-size: 28px;
            text-align: center;
            border-radius: 24px;
            background-color: #33A5FF;
            transition: all .2s;
          }

          .span_left0 {
            left: 0;
          }

          .span_left100 {
            left: 100px;
          }
        }

        .bj-box {
          margin-top: 15px;
        }

        .jlk-box {
          margin: 0 30px;
          border-top: 2px solid #EFF1F3;

          .jiantou {
            display: inline-block;
            color: #33A5FF;
            margin-left: 8px;
            font-size: 30px;
          }

          p {
            color: #262627;
            font-size: 30px;
            margin-top: 30px;
            margin-bottom: 30px;

            span {
              color: #33A5FF;
              font-weight: 600;
              padding: 0 8px;
            }
          }

          .jlk-list {
            .fl {
              margin-bottom: 30px;
            }

            .margin {
              margin-left: 10px;
              margin-right: 10px;
            }

            .cardbox {
              width: 300px;
            }

            .img-box {
              margin: 0 auto;
              width: 216px;
              height: 100px;
              border-radius: 10px;
              overflow: hidden;
              border: 2px solid #f1f1f1;

              img {
                width: 100%;
                height: 100%;
                border-radius: 10px;
                display: block;
              }
            }

            .bottom {
              position: relative;
              color: #262727;
              font-size: 28px;
              margin: 0 auto;
              margin-top: 20px;
              width: 140px;
              height: 50px;
              line-height: 50px;
              padding-right: 80px;

              .left {
                width: 150px;
              }

              .right {
                position: absolute;
                bottom: 0;
                right: 0;
                height: 100%;
              }

              span {
                color: #33A5FF;
                font-weight: 600;
              }

              .num {
                display: inline-block;
                font-size: 32px;

                &:before {
                  content: 'x';
                  font-size: 24px;
                  font-weight: 600;
                  position: absolute;
                  left: -20px;
                  bottom: -2px;
                }
              }
            }
          }

          .student-list {
            padding-left: 30px;
            padding-bottom: 40px;

            li {
              text-align: center;
              margin-right: 80px;
            }

            .marginRight0 {
              margin-right: 0;
            }

            .img-box {
              display: inline-block;
              width: 120px;
              height: 120px;
              margin-bottom: 20px;
              background: url('/static/img/avatar@2x.png') no-repeat center;
              background-size: 120px auto;
            }

            .name {
              width: 130px;
              color: #262627;
              font-size: 36px;
              font-weight: 600;
              margin-bottom: 5px;
            }

            .class {
              width: 130px;
              color: #B6B8B8;
              font-size: 24px;
              margin-bottom: 20px;
            }

            .cs {
              color: #262727;
              font-size: 28px;

              span {
                color: #33A5FF;
              }
            }
          }
        }

        .top {
          padding: 0 32px;
          height: 84px;
          border-bottom: 2px solid #EFF1F3;

          .title {
            color: #262727;
            font-size: 34px;
            font-weight: 600;
          }

          .right {
            width: 360px;
          }
        }

        .content {
          padding: 0 32px;
        }

        .team-box {

        }

        .empty {
          position: relative;
          height: 500px;
        }
      }
    }

    .wait-list-loading {
      height: 80px;
      line-height: 80px;
      text-align: center;
    }
  }
</style>
