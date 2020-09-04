<template>
  <div class="editForm scrollY">
    <form action="">
      <div class="formitem flex" v-if="name">
        <div class="label flex">
          <div>活动名称</div>
          <div class="count" >{{name.length}}/30</div>
        </div>
        <div class="item">
          <input
            type="text"
            v-model="name"
            @blur="$blur"
            placeholder="请输入任务名称"
            maxlength="30"
            class="inputbox"
            style="color: #333333"
          ></div>
      </div>
      <div class="formitem flex">
        <div class="label flex">
          <div>活动时间</div>
        </div>
        <div class="item">
          <div class="inputbox flex">
            <div class="start date flex_1" :class="{'color': startTime != ''}" @click="_startTime">{{startTime ? startTime : '请选择开始时间'}}
            </div>
            <span>~</span>
            <div class="end date flex_1" :class="{'color': endTime != ''}" @click="_endTime">{{endTime ? endTime : '请选择结束时间'}}
            </div>
            <img class="dateicon" src="../img/dateicon@2x.png">
          </div>
        </div>
      </div>
      <div class="formitem flex">
        <div class="label flex">
          <div>获卡人数</div>
        </div>
        <div class="item">
          <input
            type="text"
            @blur="$blur"
            @input="totalRewardCount=totalRewardCount.replace(/[^\d]/g,'')"
            maxlength="4"
            placeholder="请输入获卡人数"
            v-model="totalRewardCount"
            class="inputbox"
            style="color: #333"
          >
        </div>
      </div>
      <div class="formitem flex">
        <div class="label flex">
          <div>活动频次</div>
        </div>
        <div class="item">
          <div class="inputbox flex" >
            <span class="color">仅一次</span>
          </div>
        </div>
      </div>
      <div class="formitem flex">
        <div class="label flex">
          <div>活动范围</div>
        </div>
        <div class="item">
          <div class="inputbox flex" v-if="gcName.length > 0" @click="showGrade">
            <div class="flex flex-wrap flex_1">
              <span class="color" v-for="(item,index) in gcName" :key="index">{{item}}{{(index + 1) == gcName.length ? '' : ','}}</span>
            </div>
            <i class="mintui mintui-back select-icon"></i>
          </div>
          <div class="inputbox flex" style="justify-content:space-between" v-if="gcName.length == 0" @click="showGrade">
            <span>请选择任务对象</span>
            <i class="mintui mintui-back select-icon"></i>
          </div>
        </div>
      </div>
      <div class="formitem flex">
        <div class="label flex" style="justify-content: flex-start;height: 20px;">
          <div>选择奖励</div>
        </div>
        <div class="radiobox clear">
          <div class="radio fl" v-for="(item,index) in cardList" :key="index">
            <input type="radio" name="type" v-model="dimensionId" :value="item.dimensionId" :id="item.dimensionId">
            <label :for="item.dimensionId"><img :src="item.icon" alt=""></label>
            <div class="cardName text-overflow">{{item.name}}</div>
          </div>
        </div>
      </div>
      <div class="formitem flex">
        <div class="label flex">
          <div>活动介绍</div>
          <div class="count">{{taskIntro.length}}/200</div>
        </div>
        <div class="py-box">
          <div class="flex">
            <textarea class="flex_1 textarea" placeholder="请输入活动介绍" @blur="$blur" v-model="taskIntro" maxlength="200"></textarea>
          </div>
        </div>
      </div>
      <div class="formitem flex">
        <div class="label flex">
          <div>图片</div>
        </div>
        <div class="clear img-box">
          <div class="fl img-item flex alignCenter justifyCenter" v-for="(item,index) in imgs" :key="item.absolutePath+index">
            <div class="del-img-btn" @click="delImg(index)" v-if="item.absolutePath">
              <img src="@/assets/img/del.png">
            </div>
            <img class="img" v-if="item.absolutePath" :src="item.absolutePath">
            <div class="progress-box" :style="{'height': item.progress}" v-show="item.progress != '100.00%'"></div>
            <div class="progress-num" v-show="item.progress != '100.00%'">{{item.progress}}</div>
          </div>
          <div class="fl upload" @click="upload" v-show="imgs.length < 9">
            <div class="jiahao"></div>
            <div class="tianjia-txt">添加照片</div>
          </div>
        </div>
      </div>
      <div class="formitem flex">
        <div class="label flex justifySpaceBetween alignCenter">
          <div class="left">学生任务提交时默认需上传图片</div>
          <div class="right"><mt-switch v-model="characteristicList.uploadImg"></mt-switch></div>
        </div>
      </div>
      <div class="formitem flex marginBottom160">
        <div class="open-vote clear">
          <div class="title fl">开放学生投票</div>
          <div class="fl switch"><mt-switch v-model="openVote"></mt-switch></div>
        </div>
        <div class="vote-num flex alignCenter" v-if="openVote">
          <div class="title">每个学生可投</div>
          <div class="step-box">
            <span class="span-border reduce" @click="changeMark('reduce',1)">-</span>
            <span class="content">{{voteNumber}}</span>
            <span class="span-border add" @click="changeMark('add',1)">+</span>
          </div>
        </div>
      </div>
      <div class="flex task-bottom-box">
        <div class="flex_1 btn gray-btn" @click="back">取消</div>
        <div class="flex_1 btn blue-btn" v-preventReClick="1000" @click="submit($event)">提交</div>
      </div>
    </form>
    <!--上传图片-->
    <v-upload-img ref="upload" :imgs="imgs" :maxNumber="maxNumber" @getUplaodFile="getUplaodFile"></v-upload-img>

    <!--年级班级选择器-->
    <v-gc-select
      ref="gcSelect"
      :activityType="activityType"
      :gcInfo="gcInfo"
      @getGCInfo="getGCInfo"></v-gc-select>

    <!--时间选择器-->
    <mt-datetime-picker
      ref="picker"
      v-model="dateVal"
      type="datetime"
      year-format="{value} 年"
      month-format="{value} 月"
      date-format="{value} 日"
      hour-format="{value} 时"
      minute-format="{value} 分"
      v-roll:visible=pTimeVisible
      @visible-change="handleVisibleChange"
      @confirm="handleConfirm"
    ></mt-datetime-picker>

    <!--添加成功提示-->
    <v-modal-success ref="success" :tip="'修改成功'" :type="1"></v-modal-success>
  </div>
</template>

<script>
  import {TaskApi, PjApi, MedalApi} from '@/utils/api'

  import WdSelect from '@/components/wdSelect/WdSelect.vue'
  import GCSelect from '@/components/gcSelect/GCSelect.vue'
  import UploadImg from '@/components/UploadImg.vue'
  import Modal from '@/components/modal/Modal.vue'

  import formatDate from '@/utils/formatDate/formatDate'

  export default {
    name: 'EditTasks_jlk',
    components: {
      'v-wd-select': WdSelect,
      'v-gc-select': GCSelect,
      'v-modal-success': Modal,
      'v-upload-img': UploadImg,
    },
    data () {
      return {
        id: this.$route.query.id,
        info: {}, // 存放任务详情信息
        name: '', // 任务名称
        dimensionId: '', // 维度编号
        dimensionName: '', // 维度名称
        value: '分数',
        type: 'start', // 默认选择开始时间
        pTimeVisible: false, // 时间选择器
        gradeVisible: false, // 选择年级班级
        openVote: false, // 开放学生投票
        submitHttp: true, // 控制提交请求频率，防止网络异常造成多次地点击请求
        startDate: '',
        startTime: '',
        endTime: '',
        dateVal: '', // 默认是当前日期
        selected: '1', // 频次 类型：1.仅一次 2.每天 3.每周 4.每月
        count: 1, // 次数
        rewardType: 2,  // 奖励类型 2 激励卡勋章
        score1: 0,
        score2: 0,
        gcName: [], // 选择的活动范围||任务对象名称
        activityType: 3, // 活动范围||任务对象 类型：1.全校 2.年级 3.班级
        gcInfo: [], // 存放选中的年级班级列表,
        cardList: [], // 激励卡列表
        imgs: [],//图片列表
        maxNumber: 9, //最大支持上传多少张图片
        taskIntro: '',//活动介绍
        totalRewardCount: '',//可获得奖励人数数量
        voteNumber: 1, // 每个学生可投票数
        voteId: '', // 投票id
        characteristicList: {
          uploadImg: false, //图片必填/选填开关
        }, // 评价项特性
      }
    },
    activated () {
      // 获取任务详情
      this.id = this.$route.query.id;

      Promise.all([this.closePicker(),this.hideGrade(),this.getTaskDetail(this.id)]).then(() => {}).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    mounted () {
      this.getMedalDetailsByLevel()
    },
    methods: {
      async getMedalDetailsByLevel () {
        const res = await this.$req.get_special(MedalApi.getMedalDetailsByLevel, 1)
        if (res.resultCode == 1) {
          this.cardList = res.value.medalDimensionDetailsList || []
        }
      },
      async getTaskDetail (id) {
        const res = await this.$req.get_special(TaskApi.getDetail, id)
        if (res.resultCode == 1) {
          this.info = res.value
          this.name = res.value.name
          this.startTime = res.value.startTime
          this.endTime = res.value.endTime
          this.rewardType = res.value.rewardType
          this.dimensionId = res.value.dimensionId
          this.totalRewardCount = res.value.totalRewardCount
          this.taskIntro = res.value.summary || ''
          this.imgs = res.value.fileInfoVOS ? res.value.fileInfoVOS : this.imgs
          this.count = res.value.evaluationItemRuleFrequency ? res.value.evaluationItemRuleFrequency.count : 1
          this.selected = res.value.evaluationItemRuleFrequency ? res.value.evaluationItemRuleFrequency.type : 1
          this.activityType = res.value.activityRange ? res.value.activityRange.type : 2
          this.gcInfo = res.value.activityRange ? res.value.activityRange.activityRangeList : []
          this.openVote = res.value.voteSetting ? res.value.voteSetting.status : false;
          this.voteNumber = res.value.voteSetting ? (res.value.voteSetting.number || 1) : 1;
          this.voteId = res.value.voteSetting ? res.value.voteSetting.id : '';
          this.characteristicList.uploadImg = res.value.characteristicList[0] == 1 ? true : false;
          setTimeout(() => {
            this.$refs.gcSelect._checkedList()
          },300)
        }
      },
      showGrade () {
        this.$refs.gcSelect.show()
      },
      hideGrade() {
        this.$refs.gcSelect.hide()
      },
      getGCInfo (data) {
        this.gcName = [];
        this.gcInfo = data;
        data.forEach((c) => {
          this.gcName.push(c.name)
        })
      },
      handleVisibleChange (val) {
        this.pTimeVisible = val
      },
      handleConfirm () {
        let time = formatDate(new Date(this.dateVal).getTime())
        if (this.type == 'start') {
          this.startTime = time
        } else {
          this.endTime = time
        }
      },
      _startTime () {
        this.type = 'start'
        if (this.startTime) {
          this.dateVal = this.startTime.replace(/-/g, '/')
        } else {
          this.dateVal = new Date()
        }
        this.openPicker()
      },
      _endTime () {
        this.type = 'end'
        if (this.endTime) {
          this.dateVal = this.endTime.replace(/-/g, '/')
        } else {
          this.dateVal = new Date()
        }
        this.openPicker()
      },
      openPicker () {
        this.$refs.picker.open()
      },
      closePicker() {
        this.$refs.picker.close()
      },
      changeMark(type) {
        this.voteNumber = type == 'add' ? (this.voteNumber - 0)+(1 - 0) : (this.voteNumber - 0)-(1 - 0);
        this.voteNumber = this.voteNumber <= 1 ? 1 : this.voteNumber >= 99 ? 99 : this.voteNumber;
      },
      async submit (event) {
        if (this.name == '') {
          this.$toast('请输入任务名称')
          return
        }
        if (new Date(this.startTime).getTime() - new Date(this.endTime).getTime() >= 0) {
          this.$toast('结束时间要大于开始时间');
          return;
        }
        if (this.totalRewardCount == '') {
          this.$toast('请输入获卡人数')
          return
        }
        if (this.gcName.length == 0) {
          this.$toast('请选择活动范围');
          return;
        }
        if (this.dimensionId == '') {
          this.$toast('请选择奖励')
          return
        }
        if(this.imgs.length > 0) { // 如果图片存在要判断图片是否已加载出来
          for(let i = 0,imgs = this.imgs;i<imgs.length;i++){
            if(imgs[i].absolutePath == '') {
              this.$toast('还有图片未加载，请耐心等待')
              return;
            }
            if(imgs[i].fileId == '') {
              this.$toast('数据异常')
              return;
            }
          }
        }
        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }
        if(!this.submitHttp) {
          this.$toast('当前网络异常，请耐心等待')
          return
        }
        this.$indicator.open('提交中，请稍后')
        let evaluationItemRuleFrequency = { count: this.count, type: this.selected } // 频次
        let evaluationItemRuleScoreList = [] // 分值
        evaluationItemRuleScoreList.push({ type: 1, score: 1 }) //每次1分
        let activityRange = { activityRangeList: [], type: this.activityType } // 活动范围
        this.gcInfo.forEach((c) => {
          activityRange.activityRangeList.push({
            classCode: c.classCode,
            gradeCode: c.gradeCode
          })
        })
        // 投票
        let voteSetting = {
          id: this.voteId,
          number: this.voteNumber,
          status: this.openVote
        }
        let data = {
          type: 2,
          scope: 3,
          name: this.name,
          id: this.id,
          startTime: this.startTime + ':00',
          endTime: this.endTime + ':00',
          dimensionId: this.dimensionId,
          totalRewardCount: this.totalRewardCount,
          summary: this.taskIntro,
          evaluationItemRuleFrequency,
          rewardType: this.rewardType,
          evaluationItemRuleScoreList,
          fileInfoVOS: this.imgs,
          characteristicList: [this.characteristicList.uploadImg ? 1 : 0], // 评价项特性：1.提交任务必须上传图片
          activityRange,
          voteSetting
        }
        this.submitHttp = false;
        const res = await this.$req.put(TaskApi.submitTask, data)
        this.submitHttp = true;
        if (res.resultCode == 1) {
          this.$refs.success.showModal();
          setTimeout(() => {
            this.back();
          }, 2000)
        }
      },
      back () {
        this.$router.go(-1)
      },
      upload () {
        this.$refs.upload.fileClick()
      },
      getUplaodFile (data) {
        this.imgs = data
      },
      delImg (key) {
        this.imgs.splice(key, 1)
      },

    },
  }
</script>

<style lang="less" scoped>
  .editForm {
    background-color: #ffffff;
    height: 100%;
    .formitem {
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
      .color {
        color: #333333;
      }
      .label {
        width: 686px;
        height: 68px;
        font-size: 28px;
        font-weight: 600;
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
      .inputbox {
        -webkit-appearance: none;
        outline: none;
        width: 634px;
        min-height: 88px;
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
        .dateicon {
          width: 32px;
          height: 35px;
        }
        .select-icon {
          color: #C7C7CC;
          font-size: 25px;
          width: 25px;
          transform: rotate(180deg);
        }
      }
      .radiobox {
        width: 686px;
        font-size: 28px;
        font-weight: 400;
        line-height: 64px;
        color: rgba(38, 38, 39, 1);
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
            top: -30px;
            margin-right: 20px;
          }
          &:checked + label::before {
            border: 14px solid rgba(51, 165, 255, 1);
          }
        }
        label {
          img {
            width: 216px;
            height: 100px;
            margin-left: 20px;
          }
        }
        .radio {
          margin-right: 44px;
          margin-top: 10px;
          .cardName {
            width: 280px;
            font-size: 28px;
            line-height: 64px;
            color: rgba(38, 39, 39, 1);
            text-align: center;
            margin-top: -10px;
          }
        }
      }
      .item {
        .popup {
          width: 750px;
          height: 674px;
          background: rgba(255, 255, 255, 1);
          opacity: 1;
          border-radius: 40px 40px 0px 0px;
          .pop-item {
            width: 100%;
            flex-direction: column;
            align-items: center;
            .pop-title {
              width: 100%;
              height: 100px;
              .title {
                font-size: 36px;
                font-weight: 800;
                text-align: center;
              }
              .picker-btn {
                width: 180px;
                font-size: 32px;
                text-align: center;
              }
              .picker-cancel {
                color: #B6B8B8;
              }
              .picker-sure {
                color: #33A5FF;
              }
            }
            .frequencySelect {
              width: 624px;
              height: 60px;
              background: rgba(255, 255, 255, 1);
              border: 2px solid rgba(239, 241, 243, 1);
              opacity: 1;
              border-radius: 30px;
              text-align: center;
              align-items: center;
              input[type="radio"] {
                display: none;
                &:checked + label {
                  width: 140px;
                  height: 60px;
                  background: rgba(51, 165, 255, 1);
                  opacity: 1;
                  border-radius: 30px;
                  line-height: 60px;
                  color: #fff;
                }
              }
              label {
                flex: 1;
              }
            }
          }
        }
      }
      .py-box {
        width: 686px;
        height: 356px;
        border: 2px solid #EFF1F3;
        .textarea {
          outline: none;
          resize: none;
          border: none;
          width: 100%;
          height: 300px;
          padding: 14px 20px;
        }
      }
      .img-box {
        padding-top: 20px;
        width: 686px;
        .upload {
          width: 200px;
          height: 200px;
          cursor: pointer;
          text-align: center;
          border: 1px solid #EFF1F3;
          .jiahao {
            position: relative;
            width: 60px;
            height: 60px;
            top: 38px;
            left: 50%;
            margin-left: -30px;
            &:before {
              content: '';
              position: absolute;
              width: 60px;
              height: 4px;
              top: 50%;
              left: 0;
              margin-top: -2px;
              background-color: #EFF1F3;
            }
            &:after {
              content: '';
              position: absolute;
              height: 60px;
              width: 4px;
              top: 0;
              left: 50%;
              margin-left: -2px;
              background-color: #EFF1F3;
            }
          }
          .tianjia-txt {
            color: #B6B8B8;
            font-size: 24px;
            margin-top: 70px;
          }
          .img-item {
            position: relative;
            width: 190px;
            height: 190px;
            margin-right: 30px;
            text-align: center;
            .img {
              max-height: 190px;
              max-width: 190px;
            }
            .del-img-btn {
              position: absolute;
              z-index: 100;
              width: 40px;
              height: 40px;
              right: -12px;
              top: -12px;
              cursor: pointer;
              img {
                width: 100%;
                height: 100%;
              }
            }
            .progress-box {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              background-color: rgba(0, 0, 0, 0.5);
            }
            .progress-num {
              position: absolute;
              width: 100px;
              height: 100px;
              line-height: 100px;
              text-align: center;
              top: 50%;
              left: 50%;
              margin-left: -50px;
              margin-top: -50px;
            }
          }
        }
        .img-item {
          position: relative;
          width: 200px;
          height: 200px;
          margin-right: 22px;
          .img {
            position: absolute;
            max-height: 200px;
            max-width: 200px;
          }
          .del-img-btn {
            position: absolute;
            z-index: 100;
            width: 40px;
            height: 40px;
            right: -12px;
            top: -12px;
            cursor: pointer;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .progress-box {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: rgba(0, 0, 0, 0.5);
          }
          .progress-num {
            position: absolute;
            width: 100px;
            height: 100px;
            line-height: 100px;
            text-align: center;
            top: 50%;
            left: 50%;
            margin-left: -50px;
            margin-top: -50px;
          }
        }
      }
      .open-vote {
        width: 686px;
        .title {
          color: #262627;
          font-size: 28px;
          margin-right: 20px;
        }
      }
      .vote-num {
        width: 686px;
        margin-top: 40px;
        .title {
          color: #262627;
          font-size: 28px;
          margin-right: 20px;
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
    .marginBottom160 {
      margin-bottom: 160px;
    }
    .task-bottom-box {
      position: fixed;
      z-index: 200;
      width: 100%;
      bottom: 0;
      left: 0;
      height: 100px;
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
    .line {
      width: 686px;
      height: 1px;
      background: rgba(239, 241, 243, 1);
      opacity: 1;
      align-items: center;
      margin: 0 auto;
      margin-top: 38px;
    }
  }
</style>
