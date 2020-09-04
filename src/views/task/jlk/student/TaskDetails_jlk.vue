<template>
  <div class="taskDetail scrollY">
    <div class="head flex">
      <div class="detail">
        <div class="headtitle flex">
          <div class="taskName flex_1" :class="spreadflg?'':'text-overflow'">{{task.name}}</div>
          <div class="status">{{task.assignmentStatus == 3 ? '已截止': task.assignmentStatus == 2 ? '进行中'
            : '未开始'}}
          </div>
        </div>
        <div class="content">
          <div>
            <p class="lineFeed" :class="spreadflg?'':'text-overflow-clamp2'">{{task.summary}}</p>
            <div class="imglist clear b" v-if="spreadflg">
              <div class="img fl" v-for="(img,index) in task.fileInfoVOS" :key="img.absolutePath+index"><img v-gallery:group6 :src="img.absolutePath">
              </div>
            </div>
            <div class="imglist clear a" v-else>
              <div class="img fl" v-if="index < 3" v-for="(img,index) in task.fileInfoVOS" :key="img.absolutePath+index"><img v-gallery:group6 :src="img.absolutePath"></div>
            </div>
          </div>
          <div class="more" @click="spreadflg = !spreadflg"
               v-if="(task.summary && task.summary.length > 50) || (task.fileInfoVOS && task.fileInfoVOS.length>3)">
            <span>{{spreadflg?'收起全部':'展开全部'}}</span>
            <i class="mintui mintui-back" :class="spreadflg?'less-icon':'more-icon'"></i>
          </div>
        </div>
      </div>
      <div class="infolist flex">
        <div class="info flex"><span>奖励：{{task.dimensionName}}</span><img :src="task.dimensionIcon" alt="">
        </div>
        <div class="info flex"><span>日期：{{task.startTime}}~{{task.endTime}}</span></div>
      </div>
      <div class="footer">{{task.createTime}} 由{{task.staffName}}创建</div>
    </div>
    <div class="line"></div>
    <div class="body">
      <div class="detailList">
        <div class="title">
          <div class="flex justifySpaceBetween">
            <div class="name">争卡情况</div>
            <div class="look" @click="jump('/stu/vote',task.dimensionId,task.id)" v-if="voteStatus">查看</div>
          </div>
          <div>获卡人数<strong class="blue">{{task.acquireCount}}</strong>，已有<span class="blue">{{task.participateCount?task.participateCount:0}}</span>人提交
          </div>
        </div>
        <div class="title">
          <div class="name">我的争卡</div>
          <!-- 没参与且进行中才能争卡 -->
          <div class="btn" v-if="myDetail.length==0&&task.assignmentStatus==2" @click="showModal">参与争卡</div>
        </div>

        <div class="detail flex" v-if="myDetail.length > 0" v-for="(detail,ind) in myDetail" :key="ind">
          <div class="detail-head flex">
            <div class="headimg"><img src="/static/img/avatar@2x.png" alt=""></div>
            <div class="headinfo flex_1">
              <div class="name">{{detail.name?detail.name:name}}</div>
              <div class="time">{{detail.createTime}}</div>
            </div>
            <div class="head-right">
              <div class="mystatus">{{detail.status==0?'待审核':detail.status==1?'已通过':detail.status==2?'预选':'需努力'}}</div>
              <div class="vote-number" v-if="voteStatus">{{detail.votes || 0}}票</div>
            </div>
          </div>
          <div class="detail-info">
            <p>{{detail.content}}</p>
            <div class="imglist flex" v-if="detail.fileInfoVOS">
              <div class="img" v-for="(img,index) in detail.fileInfoVOS" :key="img.absolutePath+index"><img v-gallery:group7 :src="img.absolutePath" alt=""></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 参与争卡弹框 ----激励卡争卡 类型要选2 -->
    <v-submit-task ref="submit" :type="2" :uploadImg="(task.characteristicList && task.characteristicList.length > 0) ? task.characteristicList[0] : 0" @submit="submit"></v-submit-task>
  </div>
</template>

<script>
  import {TaskApi,VoteApi} from '@/utils/api'

  import SubmitTask from './modal/SubmitTask.vue'

  export default {
    name: 'TaskDetail_jlk',
    components: {
      'v-submit-task': SubmitTask,
    },
    data () {
      return {
        nowTime: new Date().getTime(),//当前时间
        spreadflg: false,//是否展开
        id: this.$route.query.id,//评价项id
        name: this.$cookie.get('name'),//用户名称
        userId: this.$cookie.get('userId'),//用户id
        classCode: this.$cookie.get('classCode'),//班级code
        voteStatus: false, // 默认不显示查看（开启了投票才显示）
        task: {},//任务详情
        myDetail: [],//我的详情
      }
    },
    activated () {
      // 获取任务详情
      this.id = this.$route.query.id

      Promise.all([this.getTaskDetail(this.id),this.getMyDetail()]).then(() => {}).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    methods: {
      //参与争卡弹框
      showModal () {
        this.$refs.submit.showModal()
      },
      //获取任务详情
      async getTaskDetail (id) {
        const res = await this.$req.get_special(TaskApi.stuDetail, id)
        if (res.resultCode == 1) {
          this.task = res.value
          this.getDimensionIcon(this.task.dimensionId)
          this.getEvaluationVoteSetting(res.value.id)
        }
      },
      //获取我提交的详情
      async getMyDetail () {
        let data = {
          // dimensionId: this.task.dimensionId,
          evaluationId: this.id,
          userId: this.userId
        }
        const res = await this.$req.post(TaskApi.getListByEvaluation, data)
        if (res.resultCode == 1) {
          this.myDetail = res.value || []
        }
      },
      // 获取投票的设置信息
      async getEvaluationVoteSetting(id) {
        const res = await this.$req.get_special(VoteApi.getEvaluationVoteSetting, id)
        if (res.resultCode == 1) {
          this.voteStatus = res.value && res.value.status || false;
        }
      },
      //提交--参与争卡
      async submit (data) {
        let g_config = JSON.parse(this.$cookie.get('config'))
        data.name = [this.name]
        data.evaluationId = this.id
        data.dimensionId = this.task.dimensionId
        data.userId = [this.userId]
        data.schoolCode = g_config.schoolCode
        data.xueNian = this.$cookie.get('schoolYear')
        data.classCode = this.$cookie.get('classCode')
        data.gradeCode = this.$cookie.get('gradeId')
        const res = await this.$req.post(TaskApi.save, data)
        if (res.resultCode == 1) {
          this.$toast('提交成功')
          this.$refs.submit.hideModal()
          this.getTaskDetail(this.id)
          this.getMyDetail()
        }
      },
      //获取卡片icon
      async getDimensionIcon (dimensionId) {
        const res = await this.$req.get(TaskApi.getMedalDetailsByDimension, {dimensionId, level: 1})
        if (res.resultCode == 1) {
          this.$set(this.task, 'dimensionIcon', res.value[0].icon)
          this.$set(this.task, 'dimensionName', res.value[0].name)
        }
      },
      //跳转
      jump (path,id,evaluationId) {
        this.$router.push({
          path,
          query: {
            id,
            evaluationId,
            classCode: this.classCode
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .taskDetail {
    height: 100%;
    background-color: #fff;
    .head {
      background: rgba(255, 255, 255, 1);
      flex-direction: column;
      align-items: center;
      transition: all 1s ease;
      .detail {
        width: 686px;
        margin-top: 32px;
        background: rgba(238, 247, 255, 1);
        border-radius: 20px;
        .headtitle {
          width: 622px;
          padding: 24px 32px;
          background: rgba(51, 165, 255, 1);
          border-radius: 20px;
          font-size: 36px;
          font-weight: 800;
          line-height: 48px;
          color: #fff;
          .status {
            // width: 462px;
            margin-left: 50px;
          }
        }
        .content {
          // width:686px;
          margin: 32px;
          margin-bottom: 0;
          font-size: 28px;
          font-weight: 400;
          line-height: 40px;
          color: rgba(38, 38, 39, 1);
          .lineFeed {
            word-break: break-all;
          }
          .more {
            text-align: center;
            font-size: 26px;
            font-weight: 500;
            line-height: 46px;
            color: rgba(164, 215, 255, 1);
            margin: 20px 0;
            cursor: pointer;
            .more-icon {
              transform: rotate(-90deg);
            }
            .less-icon {
              display: inline-block;
              transform: rotate(90deg);
            }
          }
          .imglist {
            justify-content: space-between;
            margin-top: 32px;
            .img {
              height: 180px;
              width: 180px;
              margin-right: 10px;
              margin-bottom: 10px;
              border-radius: 8px;
              background: #EFF1F3;
              img {
                height: inherit;
                width: inherit;
              }
            }
          }
        }
      }
      .infolist {
        width: 685px;
        margin: 18px 0;
        // padding-left: 32px;
        font-size: 28px;
        font-weight: 400;
        color: rgba(38, 39, 39, 1);
        flex-direction: column;
        align-items: flex-start;
        .info {
          align-items: flex-start;
          margin-top: 22px;
          img {
            margin-left: 22px;
            max-height: 100px;
            max-width: 216px;
          }
        }
      }
      .footer {
        width: 686px;
        margin-bottom: 32px;
        font-size: 24px;
        font-weight: 400;
        color: rgba(182, 184, 184, 1);
      }
    }
    .line {
      height: 10px;
      width: 100%;
      background: #EFF1F3;
    }
    .body {
      background: #fff;
      .detailList {
        .title {
          width: 686px;
          margin: 0 auto;
          padding-top: 24px;
          color: rgba(150, 152, 153, 1);
          font-size: 28px;
          font-weight: 400;
          line-height: 64px;
          .name {
            font-size: 36px;
            font-weight: 800;
            line-height: 64px;
            color: rgba(38, 38, 38, 1);
          }
          .look {
            width: 90px;
            color: #33A5FF;
            font-size: 28px;
            background: url("./img/arrow_down_gray@2x.png") no-repeat center;
            background-size: 16px auto;
            background-position: right center;
          }
          .btn {
            width: 320px;
            height: 88px;
            background-color: rgb(51, 165, 255);
            border-radius: 44px;
            font-size: 30px;
            font-weight: 400;
            line-height: 88px;
            color: rgba(255, 255, 255, 1);
            text-align: center;
            position: fixed;
            z-index: 100;
            left: 50%;
            bottom: 10px;
            margin-left: -160px;
          }
        }

        .detail {
          margin: 32px;
          border-radius: 20px;
          flex-direction: column;
          background-color: #FFFFFF;
          border: 2px solid #EFF1F3;
          .detail-head {
            margin: 32px;
            margin-bottom: 0;
            align-items: flex-start;
            justify-content: center;
            position: relative;
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
              font-weight: 400;
              color: rgba(182, 184, 184, 1);
            }
            .mystatus {
              font-size: 32px;
              font-weight: 600;
              line-height: 40px;
              color: rgba(255, 182, 0, 1);
            }
            .vote-number {
              width: 80px;
              padding-left: 40px;
              margin-top: 10px;
              margin-left: 3px;
              color: #B6B8B8;
              font-size: 28px;
              background: url('./img/vote@2x.png') no-repeat left center;
              background-size: 26px auto;
            }
          }
          .detail-info {
            margin: 32px;
            font-size: 28px;
            font-weight: 400;
            line-height: 40px;
            color: rgba(38, 38, 39, 1);
            flex-direction: column;
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
            .formitem {
              flex-direction: column;
              align-items: center;
              margin-bottom: 10px;
              .label {
                width: 686px;
                height: 68px;
                font-size: 28px;
                font-weight: 800;
                line-height: 64px;
                color: rgba(38, 38, 39, 1);
                justify-content: space-between;
                align-items: center;
                .count {
                  font-size: 28px;
                  font-weight: 400;
                  line-height: 64px;
                  color: rgba(182, 184, 184, 1);
                }
                .tip {
                  font-size: 24px;
                  font-weight: 400;
                  line-height: 64px;
                  color: rgba(150, 152, 153, 1);
                  margin-left: 20px;
                }
              }
              .title {
                width: 686px;
                font-size: 28px;
                font-weight: 400;
                line-height: 64px;
                color: rgba(38, 38, 39, 1);
              }
              .inputbox {
                -webkit-appearance: none;
                outline: none;
                width: 570px;
                height: 88px;
                background: rgba(255, 255, 255, 1);
                border: 1px solid rgba(239, 241, 243, 1);
                opacity: 1;
                padding-left: 20px;
                padding-right: 32px;
                align-items: center;
                font-size: 28px;
                font-weight: 400;
                line-height: 64px;
                color: rgba(182, 184, 184, 1);
                .end {
                  text-align: center;
                }
                .select-icon {
                  color: #C7C7CC;
                  font-size: 25px;
                  width: 25px;
                  transform: rotate(-90deg);
                }
              }
              .radiobox {
                font-size: 28px;
                font-weight: 400;
                line-height: 64px;
                color: rgba(38, 38, 39, 1);
                text-align: center;
                align-self: start;
                input[type='radio'] {
                  display: none;
                  & + label::before {
                    content: '';
                    display: inline-block;
                    width: 10px;
                    height: 10px;
                    border: 14px solid rgba(239, 241, 243, 1);
                    border-radius: 50%;
                    position: relative;
                    top: 8px;
                    margin-right: 20px;
                  }
                  &:checked + label::before {
                    border: 14px solid rgba(51, 165, 255, 1);
                  }
                }
                label {
                  margin-right: 60px;
                }

              }
              .step-box {
                span {
                  display: inline-block;
                }
                .span-border {
                  cursor: pointer;
                  width: 60px;
                  height: 60px;
                  line-height: 55px;
                  color: #B6B8B8;
                  font-size: 40px;
                  font-weight: 600;
                  text-align: center;
                  border-radius: 8px;
                  border: 2px solid #B6B8B8;
                }
                .content {
                  width: 104px;
                  text-align: center;
                  color: #262627;
                  font-size: 28px;
                }
              }
            }
          }
        }

      }
    }
    .blue {
      color: #33A5FF;
      margin: 0 20px;
    }
    .more-icon {
      font-size: inherit;
      display: inline-block;
      transform: rotate(180deg);
    }
  }
</style>

