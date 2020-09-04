<template>
  <div class="taskDetail scrollY">
    <div class="head flex">
      <div class="detail">
        <div class="headtitle flex">
          <div class="taskName flex_1" :class="spreadflg?'':'text-overflow'">{{task.name}}</div>
          <div class="status">{{task.assignmentStatus == 3 ? '已截止' : task.assignmentStatus == 2 ?
            '进行中' : '未开始'}}
          </div>
        </div>
        <div class="content">
          <div >
            <p class="lineFeed" :class="spreadflg?'':'text-overflow-clamp2'">{{task.summary}}</p>
            <div class="imglist clear b" v-if="spreadflg">
              <div class="img fl" v-for="(img,index) in task.fileInfoVOS" :key="img.absolutePath+index"><img v-gallery:group5 :src="img.absolutePath"></div>
            </div>
            <div class="imglist clear a" v-else>
              <div class="img fl" v-if="index < 3" v-for="(img,index) in task.fileInfoVOS" :key="img.absolutePath+index"><img :src="img.absolutePath" v-gallery:group5></div>
            </div>
          </div>
          <div class="more" @click="spreadflg = !spreadflg" v-if="(task.summary && task.summary.length > 50) || (task.fileInfoVOS && task.fileInfoVOS.length>3)">
            <span>{{spreadflg?'收起全部':'展开全部'}}</span>
            <i class="mintui mintui-back" :class="spreadflg?'less-icon':'more-icon'"></i>
          </div>
        </div>
      </div>
      <div class="infolist flex">
        <div class="info flex"><img src="/static/img/time@2x.png"
                                    alt=""><span>{{task.startTime}}~{{task.endTime}}</span></div>
        <div class="info flex"><img src="/static/img/score@2x.png" alt=""><span>{{task.dimensionName}}</span></div>
      </div>
    </div>
    <div class="line"></div>
    <div class="body">
      <div class="detailList" v-if="classList.length > 0">
        <div class="title">
          <div class="flex" style="justify-content:space-between;">
            <div class="name">争卡情况</div>
            <div class="info">获卡人数：<span class="blue">{{task.totalRewardCount}}</span></div>
          </div>
          <div class="flex" style="align-items:center;width: 100px" @click="popupVisible=true"><span class="blue select">{{searchTime}}</span><img
            src="/static/img/icon_down@2x.png" class="icon_down" alt=""></div>
        </div>
        <ul style="margin-bottom:60px">
          <li class="detail flex" v-for="(aclass,ind) in classList" :key="ind"
              @click="jump('/MissionProgress',task.dimensionId,task.id,aclass.classCode)">
            <div class="className">{{aclass.className}}</div>
            <div class="count">争卡人数：<span class="blue">{{aclass.joinCardCount}}</span><i
              class="mintui mintui-back more-icon"></i></div>
          </li>
        </ul>
      </div>
      <div class="empty" v-if="classList.length == 0">
        <v-empty-list :text="'无数据'"></v-empty-list>
      </div>
      <div class="flex pj-bottom-box">
        <div class="flex_1 btn gray-btn" @click="acceptflg=true">删除</div>
        <div class="flex_1 btn blue-btn" @click="jump('/editTasks_jlk',id)">编辑</div>
      </div>
    </div>

    <!--选择器-->
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
      <mt-picker :slots="dataList" :visible-item-count="5" :show-toolbar="true" ref="picker" value-key="gradeName"
                 :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm">完成</div>
        </div>
      </mt-picker>
    </mt-popup>

    <!--删除成功提示-->
    <v-modal-success ref="success" :tip="'删除成功'" :type="1"></v-modal-success>

    <!-- 是否删除弹框 -->
    <div class="popup-bg flex" v-if="acceptflg">
      <div class="popup flex">
        <div class="popup-head flex">
          <div class="name"><span>提示</span></div>
        </div>
        <div class="popup-info alignCenter">
          <p>是否确认删除该任务？</p>
        </div>
        <div class="popup-foot flex">
          <div class="footbtn flex alignCenter">
            <div class="cancel btn flex_1" @click="acceptflg=false">取消</div>
            <div class="line"></div>
            <div class="confirm btn flex_1" @click="deleteTask()">删除</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {TaskApi, PjApi} from '@/utils/api'

  import Modal from '@/components/modal/Modal.vue'
  import EmptyList from '@/components/EmptyList.vue'

  export default {
    name: 'TaskDetail_jlk',
    components: {
      'v-modal-success': Modal,
      'v-empty-list': EmptyList,
    },
    data () {
      return {
        nowTime: new Date().getTime(),//当前时间
        spreadflg: false,//是否展开
        id: this.$route.query.id,//评价项id
        assignmentStatus: this.$route.query.assignmentStatus,//是否参与
        task: {},//任务详情
        popupVisible: false,//弹框可见
        searchTime: '全部年级',//时间
        timeList: [],
        acceptflg: false,//是否删除对话框
        classList: [],//班级列表
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
    activated () {
      this.id = this.$route.query.id;

      Promise.all([this.initData(),this.getJoinClassCount(this.id),this.getTaskDetail(this.id)]).then((result) => {
        // console.log("result---",result)
      }).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    methods: {
      //获取任务详情
      async getTaskDetail (id) {
        const res = await this.$req.get_special(TaskApi.stuDetail, id)
        if (res.resultCode == 1) {
          this.task = res.value
        }
      },
      //获取加入班级的记录
      async getJoinClassCount (id) {
        const res = await this.$req.get(PjApi.getJoinClassCount, {id})
        if (res.resultCode == 1) {
          res.value.forEach(element => {
            if (element.classList != null) {
              this.classList = this.classList.concat(element.classList)
            }
          })
          this.timeList = res.value
          this.timeList.unshift({
            gradeName: '全部年级',
            gradeCode: '',
            classList: this.classList
          })
        }
      },
      initData() {
        this.acceptflg = false;
        this.popupVisible = false;
        this.classList = []
      },
      //删除任务
      async deleteTask () {
        const res = await this.$req.delete_special(TaskApi.getDetail, this.id)
        if (res.resultCode == 1) {
          this.$refs.success.showModal()
          setTimeout(() => {
            this.back()
          }, 2000)
        }
      },
      //弹框确认
      onConfirm () {
        let subjectSelected = this.$refs.picker.getValues()[0]
        this.searchTime = subjectSelected.gradeName;
        this.classList = subjectSelected.classList ? subjectSelected.classList : []
        this.popupVisible = false
      },
      //跳转
      jump (path, id, evaluationId, classCode) {
        this.$router.push({
          path,
          query: {
            id,
            evaluationId,
            classCode
          }
        })
      },
      //返回上一页
      back () {
        this.$router.go(-1)
      }
    }
  }
</script>

<style lang="less" scoped>
  .taskDetail {
    height: 100%;
    background: #fff;
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
            margin-left: 50px;
          }
        }
        .content {
          // width:686px;
          margin: 32px;
          // margin-bottom: 0;
          font-size: 28px;
          font-weight: 400;
          line-height: 40px;
          color: rgba(38, 38, 39, 1);
          .lineFeed {
            word-break:break-all;
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
        font-size: 28px;
        font-weight: 400;
        line-height: 64px;
        color: rgba(182, 184, 184, 1);
        flex-direction: column;
        align-items: flex-start;
        .info {
          align-items: center;
          img {
            height: 30px;
            width: 30px;
            margin-right: 20px;
          }
        }
      }
    }
    .line {
      height: 6px;
      width: 100%;
      background: #EFF1F3;
    }
    .body {
      background: #fff;
      .empty {
        position: relative;
        height: 50vh;
      }
      .detailList {
        font-size: 28px;
        font-weight: 400;
        line-height: 64px;
        .title {
          height: 128px;
          width: 686px;
          margin: 0 auto;
          padding-top: 24px;
          .name {
            font-size: 32px;
            font-weight: 800;
            line-height: 64px;
            color: rgba(38, 38, 38, 1);
          }
          .info{
            line-height: 64px;
          }
          .select {
            margin: 0;
            margin-right: 16px;
          }
          .icon_down {
            width: 33px;
            height: 28px;
          }
        }
        .detail {
          width: 686px;
          height: 90px;
          margin: 0 auto;
          justify-content: space-between;
          align-items: center;
          .className {
            font-size: 32px;
            font-weight: 800;
            line-height: 64px;
            color: rgba(38, 38, 38, 1);
          }
          .count {
            color: #B6B8B8;
            line-height: 64px;
          }
        }
      }
      .pj-bottom-box {
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        height: 100px;
        padding-top: 10px;
        background-color: #ffffff;
        .btn {
          height: 88px;
          line-height: 88px;
          text-align: center;
          border-radius: 44px;
          font-size: 28px;
        }
        .gray-btn {
          margin-left: 32px;
          margin-right: 46px;
        }
        .blue-btn {
          margin-right: 32px;
        }
      }
    }
    .blue {
      color: #33A5FF;
      margin: 0 10px;
    }
    .more-icon {
      height: 64px;
      font-size: inherit;
      display: inline-block;
      transform: rotate(180deg);
      margin-top: -4px;
      position: relative;
      float: right;
    }

    .popup-bg {
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
        // height:692px;
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
              color: #FF7B12;
            }
          }
        }
      }
    }
    .alignCenter {
      text-align: center;
    }
  }
</style>

