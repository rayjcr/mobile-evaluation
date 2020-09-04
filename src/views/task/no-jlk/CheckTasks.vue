<template>
  <div class="scrollY detail-box" :style="{'backgroundColor': scrollTop == 0 ? '#33A5FF' : ''}" ref="viewBox">
    <div class="head">
      <div class="heab-bg"></div>
      <div class="head-box">
        <div class="title flex justifySpaceBetween alignCenter">
          <div class="name text-overflow">{{info.name}}</div>
          <div class="status" :class="{'yellow': info.assignmentStatus == 2,'gray': info.assignmentStatus != 2}">{{info.assignmentStatus == 3 ? '已截止' : info.assignmentStatus == 2 ? '进行中' : '未开始'}}</div>
        </div>
        <div class="infolist">
          <div class="info flex alignCenter">
            <div class="icon star"></div>
            <div class="content">{{info.dimensionName}}</div>
          </div>
          <div class="info flex alignCenter" v-if="info.evaluationItemRuleFrequency">
            <div class="icon time"></div>
            <div class="content" v-if="info.evaluationItemRuleFrequency.type == 1">{{info.startTime}}~{{info.endTime}}，仅一次</div>
            <div class="content" v-else-if="info.evaluationItemRuleFrequency.type == 2">{{info.startTime}}~{{info.endTime}}，每天{{info.evaluationItemRuleFrequency.count}}次</div>
            <div class="content" v-else-if="info.evaluationItemRuleFrequency.type == 3">{{info.startTime}}~{{info.endTime}}，每周{{info.evaluationItemRuleFrequency.count}}次</div>
            <div class="content" v-else-if="info.evaluationItemRuleFrequency.type == 4">{{info.startTime}}~{{info.endTime}}，每月{{info.evaluationItemRuleFrequency.count}}次</div>
            <div class="content" v-else>{{info.startTime}}~{{info.endTime}}，每学期{{info.evaluationItemRuleFrequency.count}}次</div>
          </div>
          <div class="info flex alignCenter" v-if="info.evaluationItemRuleScoreList">
            <div class="icon score"></div>
            <span class="content" v-for="(item,index) in info.evaluationItemRuleScoreList" :key="index">
              <span v-if="item.type == 1">每次{{item.score}}{{item.rewardType == 1 ? '分' : '枚'}}</span>
              <span v-else-if="item.type == 2">全部完成{{item.score}}{{item.rewardType == 1 ? '分' : '枚'}}</span>
            </span>
          </div>
        </div>
        <div class="head-intro" v-if="xxdm=='133'&&info.summary">
          <div class="title flex justifySpaceBetween alignCenter">
            <div class="name">任务内容</div>
            <div @click="showDetail">
              查看<i class="mintui mintui-back select-icon"></i>
            </div>            
          </div>
          <p class="intro text-overflow-clamp2">
            {{info.summary}}
          </p>
        </div>
      </div>
    </div>

    <!-- fixed tab -->
    <!-- :style="{'opacity': opacity >= 1 ? 1 : opacity}" -->
    <div class="fixed-head" v-if="scrollTop > 10">
      <mt-navbar v-model="selected" class="mtnavbar fixed-nav">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="0"><span class="selectbar">待审核</span></mt-tab-item>
        <mt-tab-item id="1"><span class="selectbar">已通过</span></mt-tab-item>
        <mt-tab-item id="-1"><span class="selectbar">未通过</span></mt-tab-item>
      </mt-navbar>
    </div>

    <!-- 学生上传的任务列表 -->
    <!-- :style="{'opacity': scrollTop == 0 ? 1 : (1 - opacity) <= 0 ? 0 : (1 - opacity),'display': (1 - opacity) <= 0 ? 'none' : ''}" -->
    <div class="list-box">
      <div class="list-head flex alignCenter">
        <div class="icon_submit_num"></div>
        <div class="num flex_1">已提交: &nbsp;{{tjrs}}人</div>
        <div class="head-right flex alignCenter" @click="jumpTo('/NotFinish')">
          <span>查看未完成学生</span>
          <i class="mintui mintui-back select-icon"></i>
        </div>
      </div>
       <mt-navbar 
          v-model="selected" class="mtnavbar"
          v-if="scrollTop <= 10"
        >
          <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
          <mt-tab-item id="0"><span class="selectbar">待审核</span></mt-tab-item>
          <mt-tab-item id="1"><span class="selectbar">已通过</span></mt-tab-item>
          <mt-tab-item id="-1"><span class="selectbar">未通过</span></mt-tab-item>
        </mt-navbar>

        <v-stu-task v-if="list.length > 0" :origin="'CheckTasks'" :list="list" @examine="getExamineId"></v-stu-task>

        <!--底部判断是加载图标还是提示“全部加载”-->
        <div class="wait-list-loading" v-show="queryLoading" v-if="list.length > 10">
          <span v-show="moreLoading&&!allLoaded">加载中...</span>
          <span v-show="allLoaded">已全部加载</span>
        </div>

        <!--暂无数据-->
        <div class="empty" v-if="list.length == 0">
          <v-empty-list :text="'无记录'"></v-empty-list>
        </div>
    </div>

     <!-- 审核弹框 -->
    <v-audit-pjx ref="audit" :info="recordInfo" :dimensionName="dimensionName" :dimensionId="dimensionId" @audit="audit" @showWd="showWd"></v-audit-pjx>

    <!--维度选择器-->
    <v-wd-select ref="wd" @getWdInfo="getWdInfo" @getWdName="getWdName"></v-wd-select>
  
    <!-- 任务详情弹层 -->
    <mt-popup
      v-model="showTaskDetail"
      position="bottom">
      <div class="popupContent">
        <div class="header flex alignCenter justifySpaceBetween">
          <div class="title">任务内容</div>
          <i class="mintui mintui-back hide-icon" @click="showTaskDetail=false"></i>
        </div>
        <div class="taskdetail">{{info.summary}}</div>        
      </div>
    </mt-popup>
  </div>
</template>

<script>
  import { TaskApi,PjApi } from '@/utils/api'

  import WdSelect from '@/components/wdSelect/WdSelect.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import StuTaskList from './teacher/StuTaskList.vue'
  import AuditPjx from '../modal/Audit-pjx.vue'

  export default {
    name: 'CheckTasks',
    data() {
      return {
        id: this.$route.query.id,
        title: this.$route.query.title,
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),

        info: {},
        recordInfo: {}, // 每一条审核记录详情
        nowTime: new Date().getTime(),
        scrollTop: 0,
        selected: '',
        queryLoading: true,
        moreLoading: false,
        allLoaded: false,
        dimensionName: '', // 维度名称
        dimensionId: '', // 维度主键
        page: 1,
        limit: 30,
        tjrs: 0, // 提交人数
        status: '',
        list: [],
        showTaskDetail: false,
      }
    },
    components: {
      'v-wd-select': WdSelect,
      'v-stu-task': StuTaskList,
      'v-empty-list': EmptyList,
      'v-audit-pjx': AuditPjx
    },
    computed: {
      opacity() {
        let new_opacity = 0;
        new_opacity = (this.scrollTop / 100).toFixed(2);
        return new_opacity;
      }
    },
    watch: {
      selected(nVal) {
        this.status = nVal;
        Promise.all([
          this.initData(),
          this.getList()
          ]).then((result) => {}).catch((error) => {
          console.log(error)      // 失败了，打出 '失败'
        })
      }
    },
    mounted() {
      document.title = this.title;
      Promise.all([
        this.loadMore(),
        this.getPjDetail(this.id),
        this.getJoinClassCount(),
        this.getList()
      ]).then((result) => {}).catch((error) => {
        console.log(error)     
      })
    },
    methods: {
      /*
        获取详情信息
      */
      async getPjDetail(id) {
        const res = await this.$req.get_special(PjApi.getDetail, id);
        let {resultCode, value} = res;
        if (resultCode == 1) {
          this.info = value;
        }
      },
      /*
        获取提交人数
      */
      async getJoinClassCount() {
        const res = await this.$req.get(PjApi.getJoinClassCount, {id:this.id});
        let {resultCode, value} = res;
        if (resultCode == 1) {
          value.forEach(c => {
            c.classList.forEach(v => {
              this.tjrs += (v.joinCardCount - 0)
            })
          })
        }
      },
      /*
        获取学生提交的任务列表
      */
      async getList() {
        let data = {
          page: this.page,
          limit: this.limit,
          status: this.status,
          evaluationId: this.id
        }
        this.$indicator.open('加载中....')
        const res = await this.$req.post(TaskApi.getPage, data);
        let { resultCode, value } = res;
        if (resultCode == 1) {
          this.list = [...this.list,...value.dataList];
          // this.list = this.list.concat(value.dataList).concat(value.dataList).concat(value.dataList).concat(value.dataList);
          
          if (value.dataList.length >= this.limit) {
            this.page++;
          } else {
            this.allLoaded = true;
          }
        }
      },
      /*
        审核学生提交的任务
      */
      async audit(data) {
        this.$indicator.open('审核中,请稍后....')
        const res = await this.$req.get(TaskApi.audit, data);
        if (res.resultCode == 1) {
          this.$toast('操作成功');
          this.$refs.audit.hideModal();
          this.initData()
          this.getList()
        }
      },
      /*
        维度弹窗显示
      */
      showWd() {
        this.$refs.wd.show();
      },
      /*
        获取选中的维度名称
      */
      getWdName(data) {
        this.dimensionName = '';
        data.forEach((c) => {
          this.dimensionName += c.name + '-'
        });
        this.dimensionName = this.dimensionName.substring(0,this.dimensionName.length-1)
      },
      /*
        获取选中的维度信息
      */
      getWdInfo(info) {
        this.dimensionId = info.id;
      },
      initData() {
        this.page = 1;
        this.scrollTop = 0;
        this.allLoaded = false;
        this.list = [];
      },
      /*
        滚动加载更多
      */
      loadMore() {
        this.$refs.viewBox.addEventListener('scroll', () => {
          var scrollTop = this.$refs.viewBox.scrollTop;
          this.scrollTop = scrollTop;
          var windowHeight = this.$refs.viewBox.clientHeight;
          var scrollHeight = this.$refs.viewBox.scrollHeight;
          if (scrollTop + windowHeight >= scrollHeight) {
            this.moreLoading = true;
            if (this.allLoaded) {
              return
            }
            this.getList()
          }
        })
      },
      // 打开任务内容
      showDetail(){
        this.showTaskDetail = true;
      },
      getExamineId(key) {
        this.$refs.audit.showModal();
        this.recordInfo = this.list[key]
      },
      jumpTo(path) {
        this.$router.push({
          path,
          query: {
            id: this.id,
            name: this.info.name
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .detail-box {
    height: 100%;
    padding: 32px 32px 10px 32px;
    box-sizing: border-box;
    .head {
      position: relative;
      // height: 342px;
      // padding-top: 32px;
      .heab-bg {
        position: absolute;
        z-index: 10;
        left: 50%;
        top: -15px;
        transform: translateX(-50%);
        width: 622px;
        height: 306px;
        background: rgba(255,255,255,.3);
        border-radius: 20px;
      }
      .head-box {
        position: relative;
        z-index: 11;
        left: 50%;
        // top: 32px;
        transform: translateX(-50%);
        width: 100%;
        // height: 310px;
        background-color: #ffffff;
        border-radius: 20px;
        background-image: url(../img/juxing@2x.png);
        background-repeat: no-repeat;
        background-size: 32px auto;
        background-position: center 12px;
        padding-bottom: 10px;
        .title {
          padding: 32px 20px;
          .name {
            width: 430px;
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
            background-image: url(../img/star@2x.png);
          }
          .time {
            background-image: url(../img/time@2x.png);
          }
          .score {
            background-image: url(../img/score@2x.png);
          }
          .content {
            color: #B6B8B8;
            font-size: 28px;
          }
        }
        .head-intro{
          .title{
            font-size:28px;
            padding-bottom: 20px;
            padding-top: 20px;
          }
          .select-icon{
            font-size: 24px;
            transform: rotate(-90deg);
            display: inline-block;
            margin-left: 10px;
          }
          .intro{
            font-size:28px;
            color:rgba(174,182,193,1);
            margin: 0 20px 30px 20px;
          }
        }
      }
    }

    .fixed-head {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      width: 100%;
      height: 88px;
      .fixed-nav {
        border-radius: 0;
      }
    }

    .mtnavbar {
      width: 100%;
      height: 88px;
      border-radius: 16px;
      .selectbar {
        font-size: 30px;
        line-height: 64px;
        color: rgba(182, 184, 184, 1);
      }
      .mint-tab-item {
        margin: 0;
        line-height: 34px;
      }
      .is-selected {
        border: 0;
        &::after {
          content: '';
          display: inline-block;
          width: 40px;
          height: 4px;
          background: rgba(51, 165, 255, 1);
          opacity: 1;
          border-radius: 2px;
          position: relative;
          top: -18px;
        }
        .selectbar {
          font-size: 30px;
          font-weight: 600;
          line-height: 64px;
          color: rgba(38, 38, 39, 1);
        }
      }
    }

    .list-box {
      margin-top: 30px;
      // margin-bottom: 20px;
      border-radius: 20px;
      background-color: #EFF1F3;
      .list-head {
        height: 80px;
        padding: 0 18px 0 20px;
        background-color: #ffffff;
        border-radius: 16px 16px 0 0;
        .icon_submit_num {
          width: 28px;
          height: 28px;
          background-image: url(../img/icon_submit_num@2x.png);
          background-size: 28px auto;
          background-position: center;
          background-repeat: no-repeat;
        }
        .num {
          color: #262727;
          font-size: 28px;
          margin-left: 20px;
        }
        .head-right {
          color: #B6B8B8;
          font-size: 24px;
          .select-icon {
            color: #C7C7CC;
            font-size: 25px;
            width: 25px;
            margin-left: 20px;
            transform: rotate(-180deg);
          }
        }
      }
      .wait-list-loading {
        height: 80px;
        line-height: 80px;
        text-align: center;
      }
      .empty {
        position: relative;
        height: calc(100vh - 600px);
      }
    }
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
      .hide-icon{
        font-size: 24px;
        transform: rotate(90deg);
      }
    }
    .taskdetail{
      font-size: 28px;
      max-height: 870px;
      overflow-y: auto;
      margin-bottom: 20px;
      word-break: break-all;
      background-color: #fff;
      padding: 0;
    }
  }
  
</style>
