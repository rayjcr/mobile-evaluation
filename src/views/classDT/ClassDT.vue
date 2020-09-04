<template>
  <div class="class-dt scrollY" ref="viewBox">
    <!--排行榜-->
    <div class="ranking-list">
      <div class="ranking-top flex justifySpaceBetween">
        <div class="search-box flex alignCenter" @click="popupVisible=true">
          {{rankTimeType == 1 ? "按周" : "按月"}}
        </div>
        <div class="history-honor" @click="_jump('/classhistoryhonor')">
            查看班级历史荣誉
            <i class="mintui mintui-back back-icon"></i>
        </div>
      </div>
      <div class="ranking-content">
        <!--时间本周本月-->
        <v-time ref="time" @getTimeWB="getTimeWB"></v-time>

        <!--按勋章，按积分-->
        <div class="tab-box clear">
          <div class="tab-item fl" @click="tab(2)">按勋章</div>
          <div class="tab-item fl" @click="tab(1)">按积分</div>
          <span
            :class="{
                'span_left0': rankType == 2,
                'span_left100': rankType == 1
               }"
          >{{rankType == 2 ? "按勋章" : "按积分"}}</span>
        </div>

        <div class="rankBox" v-if="rankList.length > 0">
          <ul class="list">
            <li class="flex alignCenter" v-for="(item,index) in rankList" :key="index"
                @click="_jump('/studenthome',item)">
              <div class="li_left flex alignCenter flex_1">
                <div class="ranking guanjun" v-if="index == 0">1</div>
                <div class="ranking yajun" v-else-if="index == 1">2</div>
                <div class="ranking jijun" v-else-if="index == 2">3</div>
                <div class="ranking number" v-else>{{index+1}}</div>
                <div class="avatar">
                  <img src="/static/img/avatar@2x.png">
                </div>
                <div class="name">{{item.studentName}}</div>
              </div>
              <div class="li_right">
                <span>{{item.medalCardNum}}</span>
                <i class="mintui mintui-back back-icon" v-if="xxdm != '133'"></i>
              </div>
            </li>
          </ul>
          <div class="look border-bottom" v-if="rankList.length >= 5" @click="_jump('/classmate')">查看班级全部同学</div>
        </div>
        <div class="noRank" v-if="rankList.length == 0">
          暂无排名数据
        </div>
      </div>
    </div>
    <!--评价详情-->
    <div class="pj-list">
      <v-record-list
        ref="recordList"
        :showTab="true"
        :showOnlySelf="showOnlySelf"
        :showOnlySelfBtn="showOnlySelfBtn"
        :origin="'class'"
        :pjTabList="pjTabList"
        :recordList="recordList"
        @changeShowSelf="changeShowSelf"
        @getRewardType="getRewardType"
        @getEvaluationObject="getEvaluationObject"
      ></v-record-list>
    </div>

    <!--底部判断是加载图标还是提示“全部加载”-->
    <div class="wait-list-loading" v-if="recordList.length > 10" v-show="queryLoading">
      <span v-show="moreLoading&&!allLoaded">加载中...</span>
      <span v-show="allLoaded">已全部加载</span>
    </div>

    <!--撤销评价记录？-->
    <v-confirm ref="confirm" content="撤销后该记录在教师端/学生端都不显示，学生增加/减少的分数或者勋章原路返回" @sure="undoRecord"></v-confirm>

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
  import { PjApi, CountApi } from "@/utils/api";

  import RecordList from "@/components/pjRecord/RecordList.vue";
  import Confirm from "@/components/confirm/confirm.vue"
  import Time from "@/components/time/Time.vue";

  export default {
    name: "ClassDT",
    data() {
      return {
        userId: this.$cookie.get("userId"),
        xxdm: this.$cookie.get("xxdm"), // 学校代码
        classCode: this.$route.query.classCode,// 班级代码

        queryLoading: true,
        moreLoading: false,
        allLoaded: false,
        recordId: '', // 要撤销的记录项id
        page: 1, // 当前页码
        limit: 10, // 每页显示记录条数
        rankType: 2, // 2 按勋章，1按积分
        evaluationObject: 1, // 1,学生，2，班级 3，团队
        rewardType: 0,
        popupVisible: false,
        isbool: true, // 滚动到底部加载数据并且防止触发多次
        recordList: [], // 存放评价记录列表数据
        pjTabList: [
          { type: 0, name: "全部" },
          { type: 3, name: "加分" },
          { type: 4, name: "减分" },
          { type: 5, name: "奖励勋章" },
          { type: 6, name: "扣除勋章" }
        ], // 默认显示学生的评价详情
        timeList: [
          { type: 1, name: "按周" },
          { type: 2, name: "按月" }
        ],
        rankList: [],
        rankTimeType: 1, // （1:按周，2:按月）
        startTime: "",
        endTime: "",
        timeText: "",
        weekId: "",
        showOnlySelf: undefined,
        showOnlySelfBtn: false,
      };
    },
    computed: {
      dataList() {
        let dateSlots = [
          {
            flex: 1,
            values: this.timeList,
            className: "slot1",
            textAlign: "center"
          }
        ];
        return dateSlots;
      }
    },
    components: {
      "v-record-list": RecordList,
      "v-confirm": Confirm,
      "v-time": Time
    },
    watch: {
      weekId(nVal) {
        if (nVal) {
          let p1 = this.getRecordList;
          Promise.all([
            this.initData(),
            this.getClassRankInfo(),
            p1 ? p1() : null
          ]).then(() => {
          }).catch((error) => {
            console.log(error);
          });
        }
      },
      '$route' (to, from) {
        if(to.path == '/classdt') {
          if(from.path == '/zhsz/home') {
            this.rankType = 2;
            this.classCode = this.$route.query.classCode;
            this.getIsPermitted();
            let p1 = null,
                p2 = this.initData,
                p3 = this.initWeek,
                p4 = null;

            if (this.rankTimeType == 1) { // 默认按周请求(watch监听会多请求一次)
              p1 = this.getClassRankInfo;
              p4 = this.getRecordList;
            }

            this.evaluationObject = 1; // 学生
            this.$nextTick(() => {
              this.$refs.recordList.type = 1;
            });

            Promise.all([p1 ? p1() : null, p2(), p3(), p4 ? p4() : null]).then(() => {
            }).catch((error) => {
              console.log(error);      // 失败了，打出 '失败'
            });
          }
        }
        if(from.path == '/classdt') {
          // 避免多次触发
          this.$root.eventHub.$off("revokeRecord", this.revokeRecord);
        }
      }
    },
    activated() {
      // 监听撤销评价记录事件
      this.$root.eventHub.$on("revokeRecord", this.revokeRecord);
    },
    async mounted() {
      await this.getIsPermitted();
      Promise.all([this.initData(),this.initWeek(),this.getClassRankInfo(),this.getRecordList(),this.loadMore()]).then(() => {
      }).catch((error) => {
        console.log(error);      // 失败了，打出 '失败'
      });
    },
    methods: {
      /*
      * 获取学生排行榜
      * */
      async getClassRankInfo() {
        if (!this.weekId) return;
        let data = {
          classCode: this.classCode,
          rankTimeType: this.rankTimeType,
          rankScope: "class",
          weekId: this.weekId,
          rankType: this.rankType
        };
        const res = await this.$req.get(CountApi.getClassRankInfo, data);
        if (res.resultCode == 1) {
          sessionStorage.setItem("rankList", JSON.stringify(res.value.studentRankVOList)); // 存储排行榜
          this.rankList = (res.value.studentRankVOList && res.value.studentRankVOList.length >= 5) ? res.value.studentRankVOList.splice(0, 5) : res.value.studentRankVOList || [];
        }
      },
      /*
      * 获取评价记录列表
      * */
      async getRecordList() {
        if (!this.startTime) return;
        this.$indicator.open("加载中...");
        var evaluator = this.showOnlySelfBtn?this.userId:'';
        let data = {
          type: '1,2,5,7', // 1.录入型 2.任务型 3.学生上传 5.班级荣誉
          page: this.page,
          limit: this.limit,
          classCode: this.classCode,
          evaluationObject: this.evaluationObject,
          rewardType: this.rewardType,
          evaluator: (this.showOnlySelf?this.userId:evaluator),
          startTime: this.startTime.replace(/-/g, "/"),
          endTime: this.endTime.replace(/-/g, "/")
        };
        this.isbool = false;
        const res = await this.$req.get(PjApi.getRecordList, data);
        let { resultCode, value } = res;
        if (resultCode == 1) {
          if (value.dataList.length >= this.limit) {
            this.page++;
          } else {
            this.allLoaded = true;
          }
          let arr = value.dataList.filter((c) => {
            return c.score || c.medal
          })
          this.recordList = [...this.recordList, ...arr];
          this.isbool = true;
        }
      },
      /**
       * 获取角色权限
       **/
      async getIsPermitted() {
        const res = await this.$req.get(PjApi.isPermitted,{operationCode: 'N000003',classCode: this.classCode,zgh: this.userId});
        this.showOnlySelf =!(res.value || false) ;
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
              p2 = this.getRecordList;
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

      initData() {
        this.page = 1;
        this.allLoaded = false;
        this.popupVisible = false;
        this.showOnlySelfBtn = false;
        this.recordList = [];
      },
      /*
      * 初始化周次信息
      * */
      initWeek() {
        this.rankTimeType = 1;
        this.$refs.time.type = 1;
        this.$refs.picker.setSlotValue(0,this.timeList[0])
      },
      tab(val) {
        this.rankType = val;
        this.getClassRankInfo();
      },
      /*
      * 奖惩项切换
      * */
      getRewardType(key) {
        this.rewardType = this.pjTabList[key].type;

        let p1 = this.initData,
            p2 = this.getRecordList;

        Promise.all([p1(), p2 ? p2() : null]).then(() => {
        }).catch((error) => {
          console.log(error);
        });
      },
      /*
     * 切换学生/班级/团队
     * */
      getEvaluationObject(type) {
        if(this.evaluationObject == type) return;

        this.evaluationObject = type;
        this.rewardType = this.$refs.recordList.tab2_key;
        let p1 = this.initData,
            p2 = this.getRecordList;

        Promise.all([p1(), p2 ? p2() : null]).then(() => {
        }).catch((error) => {
          console.log(error);
        });
      },
      // 切换只看我的评价
      changeShowSelf(val){
        this.initData();
        this.showOnlySelfBtn = val;
        this.getRecordList();
      },
      onConfirm() {
        let subjectSelected = this.$refs.picker.getValues()[0];
        this.rankTimeType = subjectSelected.type;
        this.$refs.time.type = subjectSelected.type;
        this.popupVisible = false;
      },
      getTimeWB(data) {
        this.timeText = data.weekTime;
        this.weekId = data.weekId;
        this.startTime = data.startTime;
        this.endTime = data.endTime
      },
      loadMore() {
        this.$refs.viewBox.addEventListener("scroll", () => {
          var scrollTop = this.$refs.viewBox.scrollTop;
          this.scrollTop = scrollTop;
          var windowHeight = this.$refs.viewBox.clientHeight;
          var scrollHeight = this.$refs.viewBox.scrollHeight;
          if (scrollTop + windowHeight >= scrollHeight && this.isbool) {
            if (this.allLoaded) {
              this.moreLoading = true;
              return;
            }
            this.moreLoading = true;
            this.isbool = false;
            let p1 = this.getRecordList();
            Promise.all([p1]).then(() => {
            }).catch((error) => {
              console.log(error);      // 失败了，打出 '失败'
            });
          }
        });
      },
      _jump(path, a) {
        let query = {};
        if (path == "/studenthome") {

          if(this.xxdm == '133') return;

          query = {
            studentName: a.studentName,
            studentCode: a.studentCode,
            classCode: this.classCode
          };
        } else {
          query = {
            title: this.timeText,
            classCode: this.classCode
          };
        }
        this.$router.push({
          path,
          query
        });
      }
    }
  };
</script>

<style lang="less" scoped>
  .class-dt {
    height: 100%;
    padding: 0 32px;
    background-color: #FFFFFF;
    background-image: url(./img/dt_bg.png);
    background-repeat: no-repeat;
    background-size: 100% 349px;

    .ranking-top {
      position: relative;
      margin-top: 18px;
      height: 56px;
      .search-box {
        width: 120px;
        height: 56px;
        padding-left: 20px;
        color: #262727;
        font-size: 28px;
        background-image: url(/static/img/icon_down@2x.png);
        background-repeat: no-repeat;
        background-size: 33px auto;
        background-position: 88px center;
        background-color: #ffffff;
        border-radius: 28px;
      }
      .history-honor{
          line-height: 56px;
          color: #262727;
          .back-icon {
            display: inline-block;
            vertical-align: top;
            color: #262727;
            transform: rotate(-180deg);
          }
      }
    }
    .ranking-content {
      position: relative;
      margin-top: 20px;
      border-radius: 20px;
      background-color: #FFFFFF;
      box-shadow: 0 6px 18px rgba(86, 104, 119, 0.15);
      .noRank {
        line-height: 300px;
        text-align: center;
        font-size: 30px;
        color: #999;
      }

      .tab-box {
        position: absolute;
        right: 32px;
        top: 96px;
        width: 200px;
        height: 40px;
        border-radius: 34px;
        cursor: pointer;
        background-color: #EFF1F3;
        .tab-item {
          width: 100px;
          line-height: 40px;
          text-align: center;
          color: #B6B8B8;
          font-size: 28px;
        }
        .active {
          color: #ffffff;
        }
        span {
          position: absolute;
          top: 0;
          width: 100px;
          height: 40px;
          line-height: 40px;
          color: #ffffff;
          font-size: 24px;
          text-align: center;
          border-radius: 34px;
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

      .rankBox {
        padding-top: 20px;
      }
      .list {
        margin: 0 26px;
        padding-bottom: 40px;
        li {
          height: 80px;
          margin-top: 40px;
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
            background-image: url('./img/icon_guanjun@2x.png');
          }
          .yajun {
            color: #ffffff;
            background-image: url('./img/icon_yajun@2x.png');
          }
          .jijun {
            color: #ffffff;
            background-image: url('./img/icon_jijun@2x.png');
          }
          .number {
            color: #262727;
            text-align: center;
          }
          .avatar {
            width: 80px;
            height: 80px;
            margin-left: 40px;
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
        }
        img {
          width: 100%;
          height: 100%;
        }
      }
      .look {
        color: #B6B8B8;
        font-size: 28px;
        height: 78px;
        line-height: 78px;
        text-align: center;
        border-bottom-color: #EFF1F3;
      }
    }
    .pj-list {
      margin-top: 40px;
      border-radius: 20px;
      background-color: #ffffff;
      box-shadow: 0 6px 18px rgba(86, 104, 119, 0.15);
    }
    .wait-list-loading {
      height: 80px;
      line-height: 80px;
      text-align: center;
    }
  }
</style>
