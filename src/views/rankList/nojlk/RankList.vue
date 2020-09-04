<template>
  <div class="ranklist">
    <div class="search-box">
      <div class="search-top flex alignCenter justifySpaceBetween">
        <div class="search-left">
          <span :class="{'active': rankScope == 'class'}" @click="rankScope = 'class'">本班</span>
          <span  :class="{'active': rankScope == 'grade'}" @click="rankScope = 'grade'">本年级</span>
        </div>
        <div class="search-right" @click="popupVisible=true">
          <span>{{type == 1 ? '按周' : '按月'}}</span>
          <span class="icon_down"></span>
        </div>
      </div>
      <div class="search-bottom">
        <!--时间本周本月-->
        <v-time ref="time" 
          :iconStyle="{'color': '#FFFFFF'}" 
          :timeStyle="{'color': '#FFFFFF'}" 
          :weekId="weekId"
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
      <div class="scrollY scroll-view">
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

    <!--选择器-->
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
      <mt-picker :slots="dataList"  :visible-item-count="5" :show-toolbar="true"  ref="picker" value-key="name" :itemHeight="40">
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
  import Time from '@/components/time/Time.vue'
  import { CountApi } from '@/utils/api'

  export default {
    name: 'RankList',
    components: {
      'v-time': Time
    },
    data () {
      return {
        userId: this.$cookie.get('userId'),
        weekId: this.$route.query.weekId, // 当前选中的周次Id
        rankScope: 'class', // 默认按班级
        popupVisible: false,
        type: 1, // 按周，按月
        timeList: [
          {type: 1,name: '按周'},
          {type: 2,name: '按月'}
        ],
        myRankInfo: null, // 我的排行榜信息
        rankList: [], // 排行榜
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
        ];
        return  dateSlots
      },
      changeData() {
        const { weekId,rankScope } = this;
        return {
          weekId,
          rankScope
        }
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
      }
    },
    activated() {
      this.weekId = this.$route.query.weekId;
      this.$refs.time.type = 1; // 触发周次列表获取
      if(this.type == 1 && this.rankScope == 'class') {
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
        if(!this.weekId) return;
        let data = {
          studentCode: this.userId,
          rankTimeType: this.type, // 1按周
          rankScope: this.rankScope,
          weekId: this.weekId
        }
        this.$indicator.open("加载中...");
        const res = await this.$req.get(CountApi.getStudentRankInfo, data)
        if (res.resultCode == 1) {
          this.myRankInfo = res.value.myRankInfo;
          this.rankList = res.value.studentRankVOList || []
        }
      },
      initData() {
        this.type = 1;
        this.rankScope = 'class';
        this.popupVisible = false;
        this.rankList = [];
      },
      getTimeWB(data) {
        this.weekId = data.weekId;
      },
      onConfirm() {
        let subjectSelected = this.$refs.picker.getValues()[0];
        this.$refs.time.type = subjectSelected.type;
        this.type = subjectSelected.type;
        this.popupVisible = false;
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
  .ranklist {
    .search-box {
      background: linear-gradient(90deg,rgba(158,46,255,1) 0%,rgba(255,95,57,1) 100%);
      box-shadow: 0 6px 18px rgba(255,167,47,0.15);
      border-radius: 20px 20px 0 0;
      .search-top {
        .search-left {
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
    }
    .rankBox {
      position: relative;
      background-color: #ffffff;
      border-radius: 0 0 20px 20px;
      &.paddingtop150 {
        padding-top: 150px;
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
      .scroll-view {
        max-height: calc(100vh - 600px);
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
</style>

