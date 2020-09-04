<template>
  <div class="missionProgress">
    <div class="title flex">
      <div @click="_toggle(0)">
        <span class="selectName text-overflow">{{taskName}}</span>
        <i class="mintui mintui-back select-icon"></i>
      </div>
      <div class="selectClass flex" @click="_toggle(1)">
        <span>{{className}}</span>
        <img class="icon_down" src="/static/img/icon_down@2x.png">
      </div>
    </div>
    <div class="navbar whitebg">
      <mt-navbar v-model="selected" class="mtnavbar">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="rank" v-if="voteStatus"><span class="selectbar">排行</span></mt-tab-item>
        <mt-tab-item id="0"><span class="selectbar">待审核</span></mt-tab-item>
        <mt-tab-item id="2"><span class="selectbar">预选</span></mt-tab-item>
        <mt-tab-item id="-1"><span class="selectbar">需努力</span></mt-tab-item>
        <mt-tab-item id="5"><span class="selectbar">未提交</span></mt-tab-item>
      </mt-navbar>
    </div>
    <div class="list-box scrollY" :class="{'list-box-height': list.length > 0 && selected=='2'}">
      <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="list.length > 0">
        <div class="content">
          <div class="tip" v-if="selected=='2'">争卡名额{{taskGetCount}}人，已选{{taskPutCount}}人，此班有{{hasCount}}人</div>
          <ul>
            <li class="taskbox" v-for="(item,index) in list" :key="index" @click="showDetail(item)">
              <div class="taskhead flex">
                <div class="headimg"><img src="/static/img/avatar@2x.png" alt=""></div>
                <div class="headinfo flex_1">
                  <div class="name">{{getClassName(classList,item.classCode)}} {{item.name}}</div>
                  <div class="time">{{item.createTime}}</div>
                </div>
                <div class="status" :class="item.status!=='0'?'pass':''">{{statusList[item.status]}}</div>
              </div>
              <div class="taskbody">
                <p class="text-overflow-clamp2">{{item.content}}</p>
                <div class="imglist flex" v-if="item.fileInfoVOS">
                  <div class="img" v-for="(img,imgind) in item.fileInfoVOS" :key="imgind">
                    <img :src="img.absolutePath">
                  </div>
                </div>
              </div>
              <div class="taskfoot flex">
                <div class="vote-number" v-if="voteStatus">{{item.votes || 0}}票</div>
                <div class="btn gray" v-if="item.status=='0'" @click.stop="audit(item,-1)">需努力</div>
                <div class="btn blue" v-if="item.status=='0'" >
                  <span v-if="taskGetCount > 0" @click.stop="audit(item,2)">加入预选</span>
                  <span v-else @click.stop="audit(item,1)">通过</span>
                </div>
                <div class="btn small gray" v-if="item.status=='2'" @click.stop="audit(item,-1)">删除</div>
              </div>
            </li>
          </ul>
        </div>
      </v-load-more>
      <div class="content whitebg" v-else-if="tzList.length > 0 && selected == '5'">
        <ul class="stulist">
          <li class="student flex" v-for="(n,i) in tzList" :key="i">
            <div class="info flex">
              <img src="/static/img/avatar@2x.png" alt="">
              <div class="text-overflow">{{n.name}}</div>
            </div>
            <div class="btn smaller" :class="n.notifyState!=0?'graybg':'blue'" @click="notify(n)">
              {{n.notifyState!=0?'已通知':'通知'}}
            </div>
          </li>
        </ul>
        <div class="footer flex">
          <div class="btn big" :class="allNotifyFlag?'graybg':'blue'" @click="notify()">一键短信通知</div>
        </div>
      </div>
      <div class="empty" v-else>
        <v-empty-list :text="'无数据'"></v-empty-list>
      </div>
    </div>

    <!--预选---发卡-->
    <div class="footer flex" v-if="list.length > 0 && selected=='2'">
      <div class="btn big blue" @click="showSendCard=true">发卡</div>
    </div>

    <!-- 确认争卡名单弹框 -->
    <div class="popup-bg flex" v-if="showSendCard" v-roll:visible=[showReplace,replaceflg,showSendCard,acceptflg,popupVisible,popupVisible1] >
      <div class="popup flex">
        <div class="popup-head flex">
          <div class="name"><span>确认争卡名单</span></div>
        </div>
        <div class="popup-info alignCenter">
          <p>请填写活动评价，争卡最终名单将会公布在电子班牌中。</p>
        </div>
        <div class="popup-content">
          <div class="flex">
            <div class="label flex_1">活动评价</div>
            <div class="number">{{remark.length}}/100</div>
          </div>
          <div class="flex border">
            <textarea class="flex_1 textarea" placeholder="请输入评价" @blur="$blur" v-model="remark" maxlength="100"></textarea>
          </div>
        </div>
        <div class="popup-btn flex">
          <div class="cancel btn flex_1" @click="showSendCard=false">取消</div>
          <div class="line"></div>
          <div class="confirm btn flex_1" @click="save()">确认</div>
        </div>
      </div>
    </div>
    <!-- 审核弹框 -->
    <div class="popup-bg flex" v-if="acceptflg" v-roll:visible=[showReplace,replaceflg,showSendCard,acceptflg,popupVisible,popupVisible1] @click="acceptflg = false">
      <div class="popup flex" @click.stop="acceptflg=acceptflg">
        <div class="popup-head flex">
          <div class="headimg"><img src="/static/img/avatar@2x.png" alt=""></div>
          <div class="headinfo flex_1">
            <div class="name">{{studetail.name}}</div>
            <div class="time">{{studetail.createTime}}</div>
          </div>
          <div class="vote-number" v-if="voteStatus">{{studetail.votes || 0}}票</div>
        </div>
        <div class="popup-info">
          <p>{{studetail.content}}</p>
          <div class="imglist flex" v-if="studetail.fileInfoVOS">
            <div class="img" v-for="(img,imgind) in studetail.fileInfoVOS" :key="img.absolutePath+imgind">
              <img v-gallery:group4 :src="img.absolutePath">
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 是否替换弹框 -->
    <div class="popup-replace-bg flex" v-if="showReplace" v-roll:visible=[showReplace,replaceflg,showSendCard,acceptflg,popupVisible,popupVisible1] >
      <div class="popup flex">
        <div class="popup-head flex">
          <div class="name"><span>提示</span></div>
        </div>
        <div class="popup-info alignCenter">
          <p>预选名额已满，是否替换？</p>
        </div>
        <div class="popup-foot flex">
          <div class="footbtn flex alignCenter">
            <div class="cancel btn flex_1" @click="showReplace=false">取消</div>
            <div class="line"></div>
            <div class="confirm btn flex_1" @click="showReplacePop()">确认</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 替换弹框 -->
    <div class="popup-bg flex" v-if="replaceflg" v-roll:visible=[showReplace,replaceflg,showSendCard,acceptflg,popupVisible,popupVisible1] @click="replaceflg = false">
      <div class="popup thin flex" @click.stop="replaceflg=replaceflg">
        <div class="popup-title">
          预选名单
        </div>
        <div class="popup-info">
          <ul class="stulist" v-if="replaceList.length">
            <li class="student flex" v-for="(n,k) in replaceList" :key="k">
              <div class="info flex">
                <img src="/static/img/avatar@2x.png" alt="">
                <div class="text-overflow">{{n.name}}</div>
              </div>
              <div class="btn smaller blue" @click="replace(n,tempitem)">替换</div>
            </li>
          </ul>
          <p v-else style="text-align:center;">暂无预选名单</p>
        </div>
      </div>
    </div>
    <!-- 班级选择弹框 -->
    <mt-popup v-model="popupVisible" v-roll:visible=[showReplace,replaceflg,showSendCard,acceptflg,popupVisible,popupVisible1]  position="bottom" class="mint-popup">
      <mt-picker :slots="classListSlot" :visible-item-count="5" :show-toolbar="true" ref="picker0" value-key="name"
                 :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm(0)">完成</div>
        </div>
      </mt-picker>
    </mt-popup>
    <!-- 评价项选择弹框 -->
    <mt-popup v-model="popupVisible1" v-roll:visible=[showReplace,replaceflg,showSendCard,acceptflg,popupVisible,popupVisible1] position="bottom" class="mint-popup">
      <mt-picker :slots="taskList" :visible-item-count="5" :show-toolbar="true" ref="picker1" value-key="name"
                 :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible1 = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm(1)">完成</div>
        </div>
      </mt-picker>
    </mt-popup>
  </div>
</template>

<script>
  import {PjApi,TaskApi,VoteApi} from '@/utils/api'
  import LoadMore from '@/components/LoadMore.vue'
  import EmptyList from '@/components/EmptyList.vue'
import { throws } from 'assert';
  export default {
    name: 'MissionProgress',
    components: {
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList
    },
    data () {
      return {
        userId: this.$cookie.get('userId'),//用户id
        classCode: this.$route.query.classCode,//班级id
        dimensionId: this.$route.query.id,//维度id
        evaluationId: this.$route.query.evaluationId,//评价项id
        selected: '',//已选择--全部0待审核2预选-1需努力5未提交
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        acceptflg: false,//审核弹框
        replaceflg: false,//替换弹框
        popupVisible: false,//班级选择弹框
        popupVisible1: false,//评价项选择弹框
        voteStatus: false, // 默认不显示排行（开启了投票才显示）
        classListSlot: [], // 选择班级
        classList: [], // 存放该任务关联的班级列表
        taskList: [],//评价项备选列表
        taskName: '全部',//评价项名称
        className: '',//班级名称
        task: {},//评价项内容
        list: [],//列表
        tzList: [], // 通知人员列表
        page: 1,
        limit: 10, // 每页显示记录条数
        studetail: {},//被审核（点击）的学生详情
        taskGetCount: 0,//争卡名额
        taskPutCount: 0,//预选名额
        hasCount: 0, // 此班有几人
        showReplace: false,//替换弹框
        showSendCard: false,//发卡弹框
        tempitem: {},//临时存放待替换的人
        replaceList: {},//预选名单
        remark: '',//活动评价
        statusList: {//状态列表
          '1': '已通过',
          '-1': '需努力',
          '2': '预选',
          '3': '撤销'
        },
        allNotifyFlag: false,//全部已通知
      }
    },
    watch: {
      selected (nVal) {
        this.initData()
        if (nVal == '5') {
          this.getUnCommit()
        } else {
          this.getList()
          if (nVal == '2') { // 预选
            this.getDetail()
            this.getTaskSelect()
          }
        }
      }
    },
    activated () {
      this.selected = ''
      this.getQuery();
      this.initData()
      this.getClassList()
      this.getTaskList()
      this.getDetail()
      this.getList()
      this.getEvaluationVoteSetting();
    },
    methods: {
      //获取学生提交列表
      async getList (page, type) {
        this.$indicator.open('加载中....')
        this.page = page || this.page
        let data = {
          page: this.page,
          limit: this.limit,
          classCode: this.classCode,
          dimensionId: this.dimensionId,
          evaluationId: this.evaluationId,
          type: 2, //1.录入型 2.项目型 3.学生上传
          status: (this.selected == '' || this.selected == 'rank') ? null : this.selected
        }
        let url = this.selected == 'rank' ? TaskApi.getVoteRankList : TaskApi.getPage;
        const res = await this.$req.post(url, data)

        if (res.resultCode == 1) {
          let totalCount = res.value.totalCount,
            list = res.value.dataList;
          this.hasCount = totalCount
          this.list = this.page == 1 ? list : [...this.list, ...list]

          // list长度如果大于等于每页显示条数则可以加载下一页数据否则已加载完
          if (list.length >= this.limit) {
            this.page++
            this.allLoaded = true
          } else {
            this.allLoaded = false
          }

          // 控制上拉刷新下拉加载回弹效果
          if (type == 'loadTop') {
            setTimeout(() => {
              this.$refs.loadMore.onTopLoaded()
            }, 300)
          } else if (type == 'loadBottom') {
            this.$refs.loadMore.onBottomLoaded()
          }
        }
      },
      //获取发卡情况
      async getTaskSelect () {
        let data = {
          dimensionId: this.dimensionId,
          evaluationId: this.evaluationId,
          status: '2',
          type: 2 //1.录入型 2.项目型 3.学生上传
        }
        const res = await this.$req.post(TaskApi.getListByEvaluation, data)
        if (res.resultCode == 1) {
          this.taskPutCount = res.value.length
        }
      },
      async getDetail () {
        const res = await this.$req.get_special(TaskApi.getDetail, this.evaluationId)
        if (res.resultCode == 1) {
          this.taskGetCount = res.value.totalRewardCount
        }
      },
      //评价项列表--左上选择
      async getTaskList () {
        let params = {
          scope: '3',
          type: '2',
          dimensionId: this.dimensionId,
          classCode: this.classCode,
          relevantUserNo: this.userId
        }
        const res = await this.$req.get(PjApi.list, params)
        if(res.resultCode == 1) {
          let dateSlots = [
            {
              flex: 1,
              values: res.value,
              className: 'slot1',
              textAlign: 'center'
            }
          ]
          this.taskList = dateSlots
          var task = res.value.find(e => {
            return e.id == this.evaluationId
          })
          this.taskName = task ? task.name : res.value[0].name
        }
      },
      async getEvaluationVoteSetting() {
        const res = await this.$req.get_special(VoteApi.getEvaluationVoteSetting, this.evaluationId)
        if (res.resultCode == 1) {
          this.voteStatus = res.value && res.value.status || false;
        }
      },
      //获取班级列表--右上选择
      async getClassList () {
        let data = {
          evaluationId: this.evaluationId
        };
        const res = await this.$req.get(PjApi.getClassesList, data)
        if (res.resultCode == 1) {
          if (res.value.length == 0) return;

          this.classList = res.value;
          this.classList.unshift({
            name: '全部班级',
            classCode: ''
          })
          let dateSlots = [
            {
              flex: 1,
              values: this.classList,
              className: 'slot1',
              textAlign: 'center'
            }
          ]
          this.classListSlot = dateSlots
          var clas = this.classList.find(e => {
            return e.classCode == this.classCode
          })
          this.className = clas ? clas.name : '全部班级'//如果没找到对应的班级就显示全部班级
          if(this.name == '全部班级'){//如果是全部班级classCode就应该为空
            this.classCode = ''
          }
        }
      },
      // 匹配班级
      getClassName(data,classCode) {
        let name = '';
        data.forEach((c) => {
          if(c.classCode == classCode) {
            name = c.name
          }
        })
        return name;
      },
      getQuery() {
        this.classCode = this.$route.query.classCode
        this.evaluationId = this.$route.query.evaluationId
        this.dimensionId = this.$route.query.dimensionId
      },
      //获取未提交列表
      async getUnCommit () {
        var param = {
          evaluationId: this.evaluationId,
          classId: this.classCode
        }
        const res = await this.$req.get(PjApi.getUnCommit, param)
        if (res.resultCode == 1) {
          this.tzList = res.value ? res.value : []
          for(var stu of this.tzList){//循环获取的数据
            if(stu.notifyState==0){//还有没通知的
              this.allNotifyFlag = false//按键可用
              return
            }
          }
          //已经全部通知
          this.allNotifyFlag = true//按键不可用
          return
        }
      },
      //已加载
      loaded (page) {
        this.allLoaded = page ? true : this.allLoaded
        this.list = page ? [] : this.list
        let type = page ? 'loadTop' : 'loadBottom'
        this.getList(page, type)
        if (this.selected == '2') {
          this.getDetail()
          this.getTaskSelect()
        }
      },
      initData () {
        this.page = 1
        this.list = []
        this.allLoaded = true
        this.showReplace = false
        this.replaceflg = false
        this.acceptflg = false
        this.showSendCard = false
        this.popupVisible = false
        this.popupVisible1 = false
      },
      //显示弹框
      _toggle (type) {
        if (type == 1) {
          this.popupVisible = true
        } else {
          this.popupVisible1 = true
        }
      },
      //确认弹框内容
      onConfirm (ind) {
        if (ind == 0) { // 选择班级
          let subjectSelected = this.$refs.picker0.getValues()[0]
          this.className = subjectSelected.name
          this.classCode = subjectSelected.classCode
          this.popupVisible = false
        } else { // 选择评价项
          let subjectSelected = this.$refs.picker1.getValues()[0]
          this.taskName = subjectSelected.name
          this.evaluationId = subjectSelected.id
          // this.classCode = subjectSelected.classCode
          this.popupVisible1 = false
        }
        if (this.selected == '5') {
          this.initData()
          this.getUnCommit()
        } else {
          this.initData()
          this.getList()
        }
      },
      //显示学生提交详情
      showDetail (item) {
        this.acceptflg = true
        this.studetail = item
      },
      //审核
      async audit (item, status) {
        console.log('autit',this.taskGetCount,this.taskPutCount,status)
        if (this.taskGetCount <= this.taskPutCount && status != -1) {//已经选满了
          this.showReplace = true
          this.tempitem = item
          return
        }
        var data = {
          recordItemId: item.id,
          dimensionId: this.dimensionId,
          status: status
        }
        const res = await this.$req.get(TaskApi.audit, data)
        if (res.resultCode == 1 && !this.replaceflg) {
          this.$toast('审核成功')
          this.initData()
          this.getList()
          this.getTaskSelect();
        }
      },
      //显示替换弹框
      async showReplacePop () {
        this.showReplace = false
        let data = {
          dimensionId: this.dimensionId,
          evaluationId: this.evaluationId,
          status: '2',
          type: 2 //1.录入型 2.项目型 3.学生上传
        }
        const res = await this.$req.post(TaskApi.getListByEvaluation, data)
        this.replaceList = res.value
        this.replaceflg = true
      },
      //替换
      replace (a, b) {
        this.audit(a, -1)
        this.taskPutCount--
        this.audit(b, 2)
        this.replaceflg = false
        this.$toast('替换成功')
        this.initData()
        this.getList()
      },
      //短信提醒
      async notify (item) {
        var params = `?evaluationId=${this.evaluationId}`
        if (item) {
          if(item.notifyState==1){//已通知不允许再通知
            return
          }
          params += `&&students=${item.studentId}`
        } else {
          if(this.allNotifyFlag){//已经全部通知不允许再通知
            return
          }
          this.tzList.forEach(e => {
            if(e.notifyState==0){
              params += `&&students=${e.studentId}`
            }
          })
        }
          var res = await this.$req.get_special(TaskApi.notifyStudents, params)
          this.$toast('通知成功！');
          this.getUnCommit();
      },
      //发卡
      async save () {
        var data = {
          remark: this.remark,
          evaluationId: this.evaluationId
        }
        const res = await this.$req.get(PjApi.allSave, data)
        if (res.resultCode == 1) {
          this.initData()
          this.$toast('发卡成功')
          this.showSendCard = false
          this.getTaskSelect();
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .missionProgress {
    height: 100%;
    .title {
      height: 88px;
      padding: 0 32px;
      background: rgba(255, 255, 255, 1);
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(239, 241, 243, 1);
      .selectName {
        display: inline-block;
        max-width: 300px;
        font-size: 36px;
        font-weight: 800;
        line-height: 64px;
        color: rgba(38, 38, 39, 1);
      }
      i {
        display: inline-block;
        vertical-align: top;
        margin-top: 20px;
        margin-left: 10px;
        color: #C7C7CC;
        font-size: 26px;
        transform: rotate(-90deg);
      }
      .selectClass {
        font-size: 28px;
        font-weight: 400;
        line-height: 64px;
        color: rgba(51, 165, 255, 1);
        align-items: center;
        img {
          width: 33px;
          height: 28px;
          margin-left: 12px;
        }
      }
    }
    .mtnavbar {
      height: 88px;
      margin: 0 30px;
      .selectbar {
        font-size: 30px;
        font-weight: 400;
        line-height: 64px;
        color: rgba(182, 184, 184, 1);
        transition: all 0.5s;
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
          font-weight: bold;
          line-height: 64px;
          color: rgba(38, 38, 39, 1);
        }
      }
    }
    .list-box {
      height: calc(100% - 176px);
      &.list-box-height {
        height: calc(100% - 264px);
      }
      .empty {
        position: relative;
        height: 100%;
      }
    }
    .footer {
      width: 100%;
      height: 88px;
      position: fixed;
      bottom: 10px;
      justify-content: center;
    }
    .content {
      .tip {
        font-size: 30px;
        font-weight: 400;
        color: rgba(150, 152, 153, 1);
        width: 686px;
        margin: 0 auto;
        margin-top: 20px;
      }
      .taskbox {
        width: 622px;
        background: rgba(255, 255, 255, 1);
        border: 1px solid rgba(239, 241, 243, 1);
        opacity: 1;
        border-radius: 20px;
        margin: 0 auto;
        margin-top: 20px;
        margin-bottom: 64px;
        padding: 32px;
        padding-bottom: 24px;
        .taskhead {
          align-items: flex-start;
          .headimg {
            height: 80px;
            width: 80px;
            background: #EFF1F3;
            border-radius: 50%;
            margin-right: 20px;
            img {
              height: inherit;
              width: inherit;
            }
          }
          .headinfo {
            font-size: 32px;
            font-weight: bold;
            // line-height:40px;
            color: rgba(38, 39, 39, 1);
            .time {
              font-size: 28px;
              font-weight: 400;
              // line-height:64px;
              color: rgba(182, 184, 184, 1);
            }
          }
          .status {
            font-size: 32px;
            font-weight: bold;
            line-height: 40px;
            color: rgba(255, 182, 0, 1);
          }
          .pass {
            color: rgba(182, 184, 184, 1);
          }
        }
        .taskbody {
          margin-top: 26px;
          font-size: 28px;
          font-weight: 400;
          line-height: 40px;
          color: rgba(38, 38, 39, 1);
          .imglist {
            justify-content: space-between;
            margin-top: 14px;
            .img {
              width: 200px;
              height: 200px;
              border-radius: 8px;
              background: #EFF1F3;
              img {
                height: inherit;
                width: inherit;
              }
            }
          }
        }
        .taskfoot {
          position: relative;
          height: 65px;
          margin-top: 24px;
          justify-content: flex-end;
          .vote-number {
            position: absolute;
            left: 32px;
            top: 15px;
            width: 80px;
            padding-left: 32px;
            color: #B6B8B8;
            font-size: 28px;
            background: url('./img/vote@2x.png') no-repeat left center;
            background-size: 26px auto;
          }
        }
      }
      .stulist {
        margin-top: 10px;
      }
      .student {
        height: 120px;
        width: 686px;
        margin: 0 auto;
        justify-content: space-between;
        align-items: center;
        background: #fff;
        .info {
          align-items: center;
          font-size: 32px;
          font-weight: 400;
          line-height: 64px;
          color: rgba(38, 38, 39, 1);
          img {
            height: 80px;
            width: 80px;
            margin-right: 18px;
          }
        }
      }
    }
    .whitebg {
      background: #fff;
    }
    .popup-bg {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.15);
      position: absolute;
      left: 0;
      top: 0;
      z-index: 3000;
      align-items: center;
      justify-content: center;
      .popup {
        width: 686px;
        background: rgba(255, 255, 255, 1);
        opacity: 1;
        border-radius: 20px;
        flex-direction: column;
        .popup-head {
          margin-top: 24px;
          padding-left: 32px;
          align-items: center;
          justify-content: center;
          position: relative;
          .vote-number {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 80px;
            padding-left: 32px;
            color: #B6B8B8;
            font-size: 28px;
            background: url('./img/vote@2x.png') no-repeat left center;
            background-size: 26px auto;
          }
          .headimg {
            img {
              height: 80px;
              width: 80px;
              margin-right: 20px;
            }
          }
          .name {
            font-size: 32px;
            font-weight: 600;
            color: rgba(38, 39, 39, 1);
          }
          .time {
            font-size: 28px;
            color: rgba(182, 184, 184, 1);
          }
        }
        .popup-title {
          font-size: 36px;
          font-weight: 800;
          color: rgba(38, 38, 39, 1);
          text-align: center;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .popup-info {
          margin: 32px;
          font-size: 28px;
          line-height: 40px;
          color: rgba(38, 38, 39, 1);
          flex-direction: column;
          p {
            word-break: break-all;
          }
          .imglist {
            justify-content: space-between;
            margin-top: 12px;
            .img {
              height: 200px;
              width: 200px;
              border-radius: 8px;
              background: #EFF1F3;
              img {
                height: inherit;
                width: inherit;
              }
            }
          }
          .student {
            height: 120px;
            margin: 0 auto;
            justify-content: space-between;
            align-items: center;
            background: #fff;
            .info {
              align-items: center;
              font-size: 32px;
              font-weight: 400;
              line-height: 64px;
              color: rgba(38, 38, 39, 1);
              img {
                height: 80px;
                width: 80px;
                margin-right: 18px;
              }
            }
          }
        }
        .popup-content {
          padding: 30px 20px;
          font-size: 28px;
          .label {
            color: #262627;
            font-weight: 600;
          }
          .number {
            color: #B6B8B8;
          }
          .border {
            margin-top: 15px;
            border: 2px solid #EFF1F3;
          }
          .textarea {
            width: 100%;
            height: 212px;
            padding: 14px 20px;
          }
        }
        .popup-btn {
          border-top: 1px solid #EFF1F3;
          height: 88px;
          align-items: center;
          .btn {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            line-height: 64px;
          }
          .line {
            width: 1px;
            height: 88px;
            background: rgba(239, 241, 243, 1);
          }
          .gray {
            color: #B6B8B8;
          }
          .blue {
            color: #33A5FF;
          }
          .cancel {
            color: #B6B8B8;
          }
          .confirm {
            color: #33A5FF;
          }
        }
        .popup-foot {
          border-top: 1px solid #EFF1F3;
          flex-direction: column;
          padding: 30px 32px;
          .footinfo {
            font-size: 36px;
            font-weight: 400;
            line-height: 64px;
            .status {
              color: #33A5FF;
              border: Bold;
            }
            .time {
              margin-left: 20px;
              color: #B6B8B8;
            }
          }
          .achieve {
            font-size: 28px;
            font-weight: 400;
            line-height: 40px;
            .title {
              color: rgba(182, 184, 184, 1);
            }
            .value {
              margin-left: 20px;
              color: rgba(38, 39, 39, 1);
            }
          }
        }
      }
      .thin {
        margin: 0 64px;
        .popup-info {
          max-height: 640px;
          overflow-y: scroll;
        }
      }
    }
    .popup-replace-bg {
      width: 100%;
      height: 100vh;
      background: rgba(0, 0, 0, 0.15);
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2000;
      align-items: center;
      justify-content: center;
      .popup {
        width: 100%;
        margin: 0 64px;
        background: rgba(255, 255, 255, 1);
        opacity: 1;
        border-radius: 40px;
        flex-direction: column;
        .popup-head {
          width: 100%;
          margin-top: 24px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          .name {
            font-size: 36px;
            font-weight: 800;
            line-height: 64px;
            color: rgba(38, 38, 39, 1);
          }
          .time {
            font-size: 32px;
            font-weight: 400;
            line-height: 64px;
            color: rgba(182, 184, 184, 1);
          }
          .close {
            position: absolute;
            right: 32px;
            top: 0;
          }
        }
        .popup-info {
          margin: 32px;
          font-size: 28px;
          font-weight: 400;
          line-height: 40px;
          color: rgba(38, 38, 39, 1);
          flex-direction: column;
          text-align: center;
          .imglist {
            justify-content: space-between;
            margin-top: 50px;
            .img {
              height: 200px;
              width: 200px;
              background: #EFF1F3;
              img {
                height: inherit;
                width: inherit;
              }
            }
          }
        }
        .popup-btn {
          border-top: 1px solid #EFF1F3;
          height: 88px;
          align-items: center;
          .btn {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            line-height: 64px;
          }
          .line {
            width: 1px;
            height: 88px;
            background: rgba(239, 241, 243, 1);
          }
          .gray {
            color: #B6B8B8;
          }
          .blue {
            color: #33A5FF;
          }
        }
        .popup-foot {
          border-top: 1px solid #EFF1F3;
          flex-direction: column;
          .footbtn {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            .line {
              width: 1px;
              height: 88px;
              background: rgba(239, 241, 243, 1);
              opacity: 1;
            }
            .cancel {
              color: #B6B8B8;
            }
            .confirm {
              color: #33A5FF;
            }
          }
        }
      }
    }
    .btn {
      width: 180px;
      height: 64px;
      opacity: 1;
      border-radius: 44px;
      text-align: center;
      font-size: 30px;
      font-weight: 400;
      line-height: 64px;
      margin-left: 20px;
    }
    .smaller {
      width: 100px;
      height: 48px;
      font-size: 24px;
      line-height: 48px;
    }
    .small {
      width: 120px;
    }
    .big {
      width: 320px;
      height: 88px;
      line-height: 88px;
    }
    .blue {
      background: rgba(51, 165, 255, 1);
      color: rgba(255, 255, 255, 1);
    }
    .gray {
      background: rgba(239, 241, 243, 1);
      color: rgba(51, 165, 255, 1);
    }
    .graybg {
      background: rgba(200, 203, 204, 1);
      color: rgba(255, 255, 255, 1);
    }
  }
</style>

