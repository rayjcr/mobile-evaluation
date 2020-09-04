<template>
    <div class="stu-vote-box">
      <div class="head flex alignCenter justifySpaceBetween">
        <div class="head-left" @click="popupVisible=true">
          <span class="className text-overflow">{{className}}</span>
          <img class="icon_down" src="/static/img/icon_down@2x.png">
        </div>
        <div class="head-right">注：一人最多投{{voteNum}}人</div>
      </div>
      <div class="tab-bar flex alignCenter">
        <div class="tab-item" :class="{'active': selected == ''}" @click="changeTab('')">全部</div>
        <div class="tab-item" :class="{'active': selected == 1}" @click="changeTab(1)">排行</div>
        <div class="tab-item" :class="{'active': selected == 2}" @click="changeTab(2)">我的投票</div>
      </div>
      <div class="list-box scrollY">
        <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="list.length > 0">
          <ul :class="{'minHeight': list.length < 3}">
            <li v-for="(item,index) in list" :key="index" @click="showDetail(item)">
              <div class="list-top flex">
                <div class="headImg"><img src="/static/img/avatar@2x.png" alt=""></div>
                <div class="headInfo flex_1">
                  <div class="name">{{getClassName(classList,item.classCode)}} {{item.name}}</div>
                  <div class="time">{{item.createTime}}</div>
                </div>
                <div class="vote-number">{{item.votes || 0}}票</div>
              </div>
              <div class="content text-overflow-clamp2">{{item.content}}</div>
              <div class="img-box flex" v-if="item.fileInfoVOS">
                <div class="img-item" :class="{'marginRight0': (imgind+1)%3 == 0}" v-for="(img,imgind) in item.fileInfoVOS" :key="imgind">
                  <img :src="img.absolutePath">
                </div>
              </div>
              <div class="list-bottom flex justifyFlexEnd" v-if="item.studentVotes">
                <span class="btn cancel-btn" @click.stop="voteShow=true;voteStudent=item.userId" v-if="item.voteStatus">取消</span>
                <span class="btn vote-btn" v-preventReClick="1000" @click.stop="addVote($event,item.userId)" v-else>投票</span>
              </div>
              <div class="list-bottom flex justifyFlexEnd" v-else>
                <span class="btn cancel-btn" v-if="item.voteStatus" @click.stop="voteShow=true;voteStudent=item.userId">取消</span>
                <span class="btn voted-btn" v-else>已投完</span>
              </div>
            </li>
          </ul>
        </v-load-more>
        <div class="empty" v-else>
          <v-empty-list :text="'无数据'"></v-empty-list>
        </div>
      </div>

      <!-- 班级选择弹框 -->
      <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
        <mt-picker :slots="classListSlot" :visible-item-count="5" :show-toolbar="true" ref="picker0" value-key="name"
                   :itemHeight="40">
          <div class="flex">
            <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
            <div class="picker-title"></div>
            <div class="picker-btn picker-sure" @click="onConfirm()">完成</div>
          </div>
        </mt-picker>
      </mt-popup>

      <!-- 是否取消投票弹框 -->
      <div class="popup-bg flex alignCenter justifyCenter" v-if="voteShow">
        <div class="popup flex flex-column">
          <div class="popup-head flex alignCenter justifyCenter">
            <div class="name">提示</div>
          </div>
          <div class="popup-info flex alignCenter justifyCenter">
            <p>是否确认取消？</p>
          </div>
          <div class="popup-foot flex alignCenter">
            <div class="cancel btn flex_1" @click="voteShow=false">取消</div>
            <div class="line"></div>
            <div class="confirm btn flex_1" v-preventReClick="1000" @click="delVote($event)">确定</div>
          </div>
        </div>
      </div>

      <!-- 详情弹框 -->
      <div class="popup-bg flex alignCenter justifyCenter" v-if="acceptflg" @click="acceptflg = false">
        <div class="popup" @click.stop="acceptflg=acceptflg">
          <div class="popup-head flex">
            <div class="headimg"><img src="/static/img/avatar@2x.png" alt=""></div>
            <div class="headinfo flex_1">
              <div class="name">{{studetail.name}}</div>
              <div class="time">{{studetail.createTime}}</div>
            </div>
            <div class="vote-number">{{studetail.votes || 0}}票</div>
          </div>
          <div class="popup-content">
            <p>{{studetail.content}}</p>
            <div class="imglist flex" v-if="studetail.fileInfoVOS">
              <div class="img" v-for="(img,imgind) in studetail.fileInfoVOS" :key="imgind">
                <img :src="img.absolutePath">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
  import {PjApi,TaskApi,VoteApi} from '@/utils/api'
  import LoadMore from '@/components/LoadMore.vue'
  import EmptyList from '@/components/EmptyList.vue'

  export default {
    name: 'Vote',
    components: {
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList
    },
    data() {
      return {
        classCode: this.$route.query.classCode,//班级id
        dimensionId: this.$route.query.id,//维度id
        evaluationId: this.$route.query.evaluationId,//评价项id
        userId: this.$cookie.get('userId'), // 用户id
        popupVisible: false,
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        voteShow: false, // 控制取消投票弹层显隐
        acceptflg: false, //审核弹框
        className: '',
        selected: '', // ''全部，1排行，2我的投票
        voteStudent: '', // 被投票学生
        page: 1,
        limit: 10, // 每页显示记录条数
        voteNum: 0, // 一个人最多投几票
        studetail: {},//查看学生详情
        classListSlot: [], // 选择班级
        classList: [], // 存放该任务关联的班级列表
        list: []
      }
    },
    watch: {
      selected() {
        this.getList()
      }
    },
    activated() {
      this.selected = '' // 默认显示全部tab
      this.getQuery() // 更新地址栏参数
      this.initData() // 初始化数据
      this.getClassList() // 获取班级列表
      this.getList()
      this.getEvaluationVoteSetting() // 获取投票配置信息
    },
    methods: {
      //获取学生提交列表(全部)
      async getList (page, type) {
        this.$indicator.open('加载中....')
        this.page = page || this.page
        let data = {
          page: this.page,
          limit: this.limit,
          classCode: this.classCode,
          dimensionId: this.dimensionId,
          evaluationId: this.evaluationId,
          currentUser: this.userId,
          type: 2, //1.录入型 2.项目型 3.学生上传
        }
        let url = this.selected == '' ? TaskApi.getPage : this.selected == 1 ? TaskApi.getVoteRankList : TaskApi.getStuVoteList;
        const res = await this.$req.post(url, data)

        if (res.resultCode == 1) {
          let list = res.value.dataList;
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
      //获取班级列表--左上选择
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
      // 获取投票的设置信息
      async getEvaluationVoteSetting() {
        const res = await this.$req.get_special(VoteApi.getEvaluationVoteSetting, this.evaluationId)
        if (res.resultCode == 1) {
          this.voteNum = res.value && res.value.number || 0;
        }
      },
      async addVote(event,studentId) {
        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }
        let data = {
          voteStudent: this.userId,
          studentId,
          number: 1, // 投几票
          evaluationId: this.evaluationId
        }
        const res = await this.$req.post(VoteApi.addVote, data)
        if (res.resultCode == 1) {
          this.getList()
        }
      },
      async delVote(event) {
        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }
        let data = {
          voteStudent: this.userId,
          studentId: this.voteStudent,
          number: 1, // 投几票
          evaluationId: this.evaluationId
        }
        const res = await this.$req.delete(VoteApi.delVote, data)
        if (res.resultCode == 1) {
          this.voteShow = false;
          this.getList()
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
      //切换tab
      changeTab(key) {
        this.selected = key;
      },
      // 上拉加载下拉刷新
      loaded (page) {
        this.allLoaded = page ? true : this.allLoaded
        this.list = page ? [] : this.list
        let type = page ? 'loadTop' : 'loadBottom'
        this.getList(page, type)
      },
      //显示学生提交详情
      showDetail (item) {
        this.acceptflg = true
        this.studetail = item
      },
      // 更新地址栏参数
      getQuery() {
        this.classCode = this.$route.query.classCode
        this.evaluationId = this.$route.query.evaluationId
        this.dimensionId = this.$route.query.id
      },
      // 初始化数据
      initData () {
        this.page = 1
        this.list = []
        this.allLoaded = true
        this.acceptflg = false
        this.voteShow = false
        this.popupVisible = false
      },
      // 选择班级
      onConfirm() {
        let subjectSelected = this.$refs.picker0.getValues()[0]
        this.className = subjectSelected.name
        this.classCode = subjectSelected.classCode
        this.popupVisible = false
        this.initData()
        this.getList()
      },
    }
  }
</script>

<style lang="less" scoped>
  .stu-vote-box {
    height: 100%;
    .head {
      height: 88px;
      padding: 0 32px;
      font-size: 28px;
      background-color: #ffffff;
      .head-left {
        color: #33A5FF;
        .className {
          display: inline-block;
          vertical-align: middle;
          max-width: 300px;
        }
        img {
          display: inline-block;
          vertical-align: middle;
          width: 33px;
          height: 28px;
          margin-left: 12px;
        }
      }
      .head-right {
        color: #B6B8B8;
      }
    }
    .tab-bar {
      height: 88px;
      padding: 0 32px;
      background-color: #ffffff;
      .tab-item {
        color: #B6B8B8;
        font-size: 30px;
        margin-right: 50px;
        &.active {
          position: relative;
          color: #262627;
          font-weight: 600;
          &:after {
            position: absolute;
            bottom: -24px;
            left: 50%;
            margin-left: -40%;
            content: '';
            width: 80%;
            height: 4px;
            background-color: #33A5FF;
            border-radius: 2px;
          }
        }
      }
    }
    .list-box {
      padding: 20px 32px;
      height: calc(100% - 176px);
      .empty {
        position: relative;
        height: 100%;
      }
      .minHeight {
        height: calc(100vh - 176px);
      }
      li {
        padding: 32px 32px 20px;
        margin-bottom: 20px;
        background-color: #ffffff;
        border-radius: 20px;
        border: 1px solid #EFF1F3;
        .list-top {
          margin-bottom: 26px;
          .headImg {
            width: 80px;
            height: 80px;
            margin-right: 20px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .headInfo {
            .name {
              color: #262727;
              font-size: 32px;
              font-weight: 600;
            }
            .time {
              color: #B6B8B8;
              font-size: 28px;
            }
          }
          .vote-number {
            width: 80px;
            color: #B6B8B8;
            font-size: 28px;
            text-align: right;
            background: url('./img/vote@2x.png') no-repeat left 8px;
            background-size: 26px auto;
          }
        }
        .content {
          color: #262627;
          font-size: 28px;
        }
        .img-box {
          margin-top: 15px;
          .img-item {
            width: 200px;
            height: 200px;
            background-color: #EFF1F3;
            border-radius: 8px;
            margin-right: 12px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .marginRight0 {
            margin-right: 0;
          }
        }
        .list-bottom {
          margin-top: 20px;
          .btn {
            display: inline-block;
            width: 160px;
            height: 60px;
            line-height: 60px;
            border-radius: 44px;
            font-size: 30px;
            color: #ffffff;
            text-align: center;
          }
          .vote-btn {
            background-color: #33A5FF;
          }
          .voted-btn {
            color: #33A5FF;
            background-color: #EFF1F3;
          }
          .cancel-btn {
            background-color: #FF7B12;
          }
        }
      }
    }
    .popup-bg {
      width: 100%;
      height: 100vh;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2000;
      background-color: rgba(0, 0, 0, 0.15);
      .popup {
        width: 100%;
        margin: 0 64px;
        padding: 0 32px;
        background-color: #ffffff;
        border-radius: 40px;
        .popup-head {
          position: relative;
          margin-top: 24px;
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
          .name {
            color: #262627;
            font-size: 36px;
            font-weight: 600;
          }
          .time {
            font-size: 28px;
            color: rgba(182, 184, 184, 1);
          }
          .headimg {
            img {
              height: 80px;
              width: 80px;
              margin-right: 20px;
            }
          }
        }
        .popup-content {
          margin: 32px;
          font-size: 28px;
          line-height: 40px;
          color: rgba(38, 38, 39, 1);
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
        .popup-info {
          height: 190px;
          color: #262627;
          font-size: 36px;
        }
        .popup-foot {
          height: 88px;
          border-top: 1px solid #EFF1F3;
          .line {
            width: 2px;
            height: 88px;
            background-color: #EFF1F3;
          }
          .btn {
            text-align: center;
            font-size: 32px;
            font-weight: 600;
          }
          .cancel {
            color: #B6B8B8;
          }
          .confirm {
            color: #FF7B12;
          }
        }
      }
    }
  }
</style>
