<template>
  <div class="taskdetail">
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
            <div class="content">{{medalName}}</div>
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
            <div @click="showTask">
              查看<i class="mintui mintui-back select-icon"></i>
            </div>            
          </div>
          <p class="intro text-overflow-clamp2">
            {{info.summary}}
          </p>
        </div>
      </div>
    </div>
    <div class="taskcontent">
      <div class="content-top flex justifySpaceBetween alignCenter">
        <div class="top-left">
          <span class="name">总分:</span>
          <span class="total">{{total}}</span>
        </div>
        <div class="top-right" @click="_jump('/stu/otherStuTask')">查看同学上传</div>
      </div>
      <div class="content-list scrollY" v-if="list.length > 0">
        <v-record-list
          ref="list"
          :list="list"
          :info="info"
          @showDetail="showDetail"
        ></v-record-list>
      </div>
      <div class="empty-wrapper" v-else>
        <v-empty-list :text="'无提交任务'"></v-empty-list>
      </div>
    </div>
    <div class="taskfoot" v-if="info.assignmentStatus != 3 && showSubmitBtn" @click="showModal">提交任务</div>

    <!--做任务弹窗-->
    <v-submit-task ref="submit" :type="info.type" :id="id" :uploadImg="(info.characteristicList && info.characteristicList.length > 0) ? info.characteristicList[0] : 0" @submit="submit"></v-submit-task>

    <!--详情弹窗-->
    <v-detail ref="detail" :info="taskInfo" :taskKey="taskKey"></v-detail>

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
  import {TaskApi,MedalApi} from '@/utils/api'
  import RecordList from './RecordList.vue'
  import SubmitTask from '../../modal/SubmitTask.vue'
  import Detail from '../../modal/Detail.vue'
  import EmptyList from '@/components/EmptyList.vue'

  export default {
    name: 'TaskDetails',
    data () {
      return {
        id: this.$route.query.id,
        title: this.$route.query.title,
        type: this.$route.query.type,
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),
        showSubmitBtn: true,
        popupVisible: true,
        taskflg: '1',
        acceptflg: false, // 控制审核通过不通过弹窗显示
        page: 1,
        limit: 100,
        total: 0, // 该任务已得的分数或勋章总和
        medalName: '', // 勋章名称
        info: {},
        taskInfo: {},
        taskKey: 0,
        list: [],
        showTaskDetail: false,
      }
    },
    components: {
      'v-record-list': RecordList,
      'v-submit-task': SubmitTask,
      'v-empty-list': EmptyList,
      'v-detail': Detail,
    },
    activated () {
      Promise.all([
        this.initData(),
        this.getQuery(),
        this.getDetail(this.id)
      ]).then((result) => {}).catch((error) => {
        console.log(error)     
      })
    },
    methods: {
      /*
        获取任务详情
      */
      async getDetail (id) {
        const res = await this.$req.get_special(TaskApi.stuDetail, id)
        let {resultCode, value} = res
        if (resultCode == 1) {
          this.info = value
          this.getRecordList()
          this.getMedalDetailsByDimension(value.dimensionId)
        }
      },
      /*
        获取学生提交的任务列表
      */
      async getRecordList () {
        let data = {
          evaluationId: this.id,
          userId: this.userId,
          page: this.page,
          limit: this.limit,
        }
        this.$indicator.open('加载中....')
        const res = await this.$req.post(TaskApi.getStuTaskList, data)
        let {resultCode, value} = res
        if (resultCode == 1) {
          this.list = [...this.list, ...value.dataList]
          this.getTotalScore(this.list)
          this.setSubmitBtnShow(this.list.length > 0 ? this.list[0] : [])
        }
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
      /*
        控制做任务按钮的显隐
      */
      setSubmitBtnShow(data) { 
        if(data.length == 0) return;
        
        if(data.dayTab.indexOf('今日') > -1) {
          if(data.status == 1) {
            this.showSubmitBtn = false;
          }
        } else {
          this.showSubmitBtn = true
        }
      },
      /*
        获取地址栏参数
      */
      getQuery() {
        this.title = this.$route.query.title
        this.id = this.$route.query.id
        this.type = this.$route.query.type
        document.title = this.title
      },
      /*
        获取总分
      */
      getTotalScore(list) {
        let total = 0;
        // 1.分数 2.勋章 3.加分 4.减分 5.奖励勋章 6.扣除勋章 7.禁止兑换商品 ,99 由评价项规则来确定
        list.forEach((c) => {
          if(c.rewardType === 1 || c.rewardType === 3 || c.rewardType === 4) {
            total = (total - 0) + (c.score - 0)
          } else {
            total = (total - 0) + (c.medal - 0)
          }
        })
        this.total = total
      },
      initData () {
        this.page = 1
        this.showSubmitBtn = true;
        this.$refs.submit.hideModal()
        this.$refs.detail.hideModal()
        this.list = []
      },
      showModal () {
        this.$refs.submit.showModal()
      },
      showDetail (obj) {
        this.taskInfo = this.list[obj.index];
        this.taskKey = obj.i;
        this.$refs.detail.showModal()
      },
      showTask(){
        this.showTaskDetail = true;
      },
      async submit (data) {
        this.$indicator.open("提交中,请稍后...");
        const res = await this.$req.post(TaskApi.save, data)
        if (res.resultCode == 1) {
          this.$toast('提交成功')
          this.$refs.submit.hideModal()
          this.initData()
          this.getRecordList()
        }
      },
      _jump(path) {
        this.$router.push({
          path,
          query: {
            id: this.$route.query.id
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .taskdetail {
    position: relative;
    height: 100%;
    background-color: #33A5FF;
    padding: 32px 32px 20px 32px;
    box-sizing: border-box;
    overflow-y: auto;
    .head {
      position: relative;
      // height: 342px;
      margin-bottom: 32px;
      .heab-bg {
        position: absolute;
        z-index: 10;
        left: 50%;
        top: -15px;
        margin-left: -311px;
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
        margin-left: -343px;
        width: 686px;
        // height: 310px;
        background-color: #ffffff;
        border-radius: 20px;
        background-image: url(../../img/juxing@2x.png);
        background-repeat: no-repeat;
        background-size: 32px auto;
        background-position: center 12px;
        padding-bottom: 10px;
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
            background-image: url(../../img/star@2x.png);
          }
          .time {
            background-image: url(../../img/time@2x.png);
          }
          .score {
            background-image: url(../../img/score@2x.png);
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
    .taskcontent {
      width: 686px;
      height: calc(100% - 384px);
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      .content-top {
        padding: 40px 18px 40px 20px;
        .top-left {
          font-weight: 600;
          span {
            display: inline-block;
          }
          .name {
            color: #262627;
            font-size: 36px;
            vertical-align: top;
            margin-top: 10px;
          }
          .total {
            color: #FFB600;
            font-size: 48px;
            margin-left: 4px;
          }
        }
        .top-right {
          cursor: pointer;
          padding-right: 28px;
          color: #33A5FF;
          font-size: 24px;
          background: url("../../img/icon_right@2x.png") no-repeat right center;
          background-size: 16px auto;
        }
      }
      .content-list {
        height: calc(100% - 80px);
      }
      .empty-wrapper {
        position: relative;
        height: calc(100% - 260px);
      }
    }
    .taskfoot {
      position: fixed;
      z-index: 2001;
      bottom: 20px;
      left: 50%;
      margin-left: -160px;
      width: 320px;
      height: 88px;
      line-height: 88px;
      text-align: center;
      color: #ffffff;
      font-size: 30px;
      background-color: #FFB600;
      border-radius: 44px;
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

