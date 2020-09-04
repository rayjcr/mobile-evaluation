0<template>
  <div class="editForm">
    <form action="">
      <div class="formitem">
        <div class="label flex">
          <div>名称</div>
          <div class="count">{{name.length}}/30</div>
        </div>
        <div class="item border1px"><input type="text" placeholder="请输入任务名称" @blur="$blur" class="inputbox" v-model="name" maxlength="30" style="color: #333333"></div>
      </div>
      <div class="formitem" v-if="xxdm=='133'">
        <div class="label flex">
          <div>任务内容</div>
          <div class="count">{{summary.length}}/200</div>
        </div>
        <div class="item border1px"><textarea placeholder="请输入任务内容" @blur="$blur" class="inputbox" v-model="summary" maxlength="200" style="color: #333333;height: 200px;"></textarea></div>
      </div>
      <div class="formitem">
        <div class="label flex">
          <div>维度</div>
        </div>
        <div class="item border1px">
          <div class="inputbox flex" style="justify-content:space-between" @click="showWd">
            <span class="text-overflow" :class="{'color': dimensionName != ''}">{{dimensionName ? dimensionName : '请选择维度'}}</span>
            <i class="mintui mintui-back select-icon"></i>
          </div>
        </div>
      </div>
      <div class="formitem">
        <div class="label flex">
          <div>有效期</div>
        </div>
        <div class="item border1px">
          <div class="inputbox flex">
            <div class="start date flex_1" :class="{'color': startTime != ''}" @click="_startTime">{{startTime ? startTime : '请选择开始时间'}}</div>
            <span>~</span>
            <div class="end date flex_1" :class="{'color': endTime != ''}" @click="_endTime">{{endTime ? endTime : '请选择结束时间'}}</div>
            <img class="dateicon" src="../img/dateicon@2x.png" >
          </div>
        </div>
      </div>
      <div class="formitem">
        <div class="label flex">
          <div>频次</div>
        </div>
        <div class="item border1px">
          <div class="inputbox flex" style="justify-content:space-between" @click="pcVisible = true">
            <span class="color" v-if="selected == 1">仅一次</span>
            <span class="color" v-else-if="selected == 2">每天{{count}}次</span>
            <span class="color" v-else-if="selected == 3">每周{{count}}次</span>
            <span class="color" v-else-if="selected == 4">每月{{count}}次</span>
            <span class="color" v-else>每学期{{count}}次</span>
            <i class="mintui mintui-back select-icon"></i>
          </div>
          <mt-popup
            v-model="pcVisible"
            class="popup"
            position="bottom"
            v-roll:visible=[pcVisible,jlVisible,pTimeVisible]
          >
            <div class="pop-item flex">
              <div class="pop-title flex alignCenter">
                <div class="picker-btn picker-cancel" @click="pcVisible=false">取消</div>
                <div class="flex_1 title">选择频次</div>
                <div class="picker-btn picker-sure" @click="changePC">确定</div>
              </div>
              <div class="frequencySelect flex">
                <input type="radio" name="frequency" v-model="selected" value="1" id="1"><label for="1">仅一次</label>
                <input type="radio" name="frequency" v-model="selected" value="2" id="2"><label for="2">每天</label>
                <input type="radio" name="frequency" v-model="selected" value="3" id="3"><label for="3">每周</label>
                <input type="radio" name="frequency" v-model="selected" value="4" id="4"><label for="4">每月</label>
                <input type="radio" name="frequency" v-model="selected" value="5" id="5"><label for="5">每学期</label>
              </div>
              <mt-picker :slots="pcList" ref="pickerPC"></mt-picker>
            </div>
          </mt-popup>
        </div>
      </div>

      <div class="formitem">
        <div class="flex alignCenter item-top">
          <div class="left">奖励</div>
          <div class="right tip">至少填写一项奖励</div>
        </div>
        <div class="flex alignCenter item-bottom">
          <div class="check-circle" :class="{'checked': mc_checked}" @click="mc_checked = !mc_checked"></div>
          <div class="name">每次</div>
          <div class="right-box border1px flex_1 flex alignCenter" @click="jlVisible = true;jl_type = 1" v-if="mc_checked">
            <div class="left-type border-right">{{rewardType_mc == 1 ? '分数' : '勋章'}}</div>
            <div class="right-num flex_1 flex justifySpaceBetween">
              <span>+{{score1}}</span>
              <i class="mintui mintui-back select-icon"></i>
            </div>
          </div>
          <div class="right-box border1px flex_1 flex alignCenter" style="color:#B6B8B8;" @click="_toast('请先勾选每次')" v-else>
            <div class="left-type border-right">分数</div>
            <div class="right-num flex_1 flex justifySpaceBetween">
              <span>+1</span>
              <i class="mintui mintui-back select-icon"></i>
            </div>
          </div>
        </div>
        <div class="flex alignCenter item-bottom">
          <div class="check-circle" :class="{'checked': qb_checked}" @click="qb_checked = !qb_checked"></div>
          <div class="name">全部完成</div>
          <div class="right-box border1px flex_1 flex alignCenter" @click="jlVisible = true;jl_type = 2" v-if="qb_checked">
            <div class="left-type border-right">{{rewardType_qb == 1 ? '分数' : '勋章'}}</div>
            <div class="right-num flex_1 flex justifySpaceBetween">
              <span>+{{score2}}</span>
              <i class="mintui mintui-back select-icon"></i>
            </div>
          </div>
          <div class="right-box border1px flex_1 flex alignCenter" style="color:#B6B8B8;" @click="_toast('请先勾选全部完成')" v-else>
            <div class="left-type border-right">分数</div>
            <div class="right-num flex_1 flex justifySpaceBetween">
              <span>+1</span>
              <i class="mintui mintui-back select-icon"></i>
            </div>
          </div>
        </div>

        <mt-popup
          v-model="jlVisible"
          v-roll:visible=[pcVisible,jlVisible,pTimeVisible]
          class="popup"
          position="bottom">
          <div class="pop-item flex">
            <div class="pop-title flex alignCenter">
              <div class="picker-btn picker-cancel" @click="jlVisible=false">取消</div>
              <div class="flex_1 title">奖励选择</div>
              <div class="picker-btn picker-sure" @click="onValuesChangeJl">确定</div>
            </div>
            <mt-picker :slots="slot_jl" ref="pickerJL"></mt-picker>
          </div>
        </mt-popup>
      </div>

      <div class="line1px"></div>

      <div class="formitem">
        <div class="label flex justifySpaceBetween alignCenter">
          <div class="left">学生任务提交时默认需上传图片</div>
          <div class="right"><mt-switch v-model="characteristicList.uploadImg"></mt-switch></div>
        </div>
      </div>
      <div class="line1px"></div>
      <div class="formitem marginBottom120">
        <div class="label flex">
          <div>对象</div>
        </div>
        <div class="item border1px">
          <div class="inputbox flex" v-if="gcName.length > 0"  @click="showGrade">
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
      <div class="flex pj-bottom-box">
        <div class="flex_1 btn gray-btn" @click="back">取消</div>
        <div class="flex_1 btn blue-btn" v-preventReClick="1000" @click="submit($event)">提交</div>
      </div>
    </form>

    <!--维度选择器-->
    <v-wd-select ref="wd" :dimensionId="dimensionId" @getWdInfo="getWdInfo" @getWdName="getWdName"></v-wd-select>

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
      v-roll:visible=[pcVisible,jlVisible,pTimeVisible]
      @visible-change="handleVisibleChange"
      @confirm="handleConfirm"
    ></mt-datetime-picker>

    <!--添加成功提示-->
    <v-modal-success ref="success" :tip="'编辑成功'" :type="1"></v-modal-success>
  </div>
</template>

<script>
  import WdSelect from '@/components/wdSelect/WdSelect.vue'
  import GCSelect from '@/components/gcSelect/GCSelect.vue'
  import Modal from '@/components/modal/Modal.vue'
  import {TaskApi as API} from '@/utils/api'
  import formatDate from '@/utils/formatDate/formatDate'
  export default {
    name: 'EditTasks',
    components: {
      'v-wd-select': WdSelect,
      'v-gc-select': GCSelect,
      'v-modal-success': Modal
    },
    data() {
      return {
        xxdm: this.$cookie.get("xxdm"),
        id: this.$route.query.id,
        info: {}, // 存放任务详情信息
        name: '', // 任务名称
        dimensionId: '', // 维度编号
        dimensionName: '', // 维度名称
        value: '分数',
        type: 'start', // 默认选择开始时间
        pcVisible: false, // 选择频次
        jlVisible: false, // 奖励选择器
        pTimeVisible: false, // 时间选择器
        gradeVisible: false, // 选择年级班级
        submitHttp: true, // 控制提交请求频率，防止网络异常造成多次地点击请求
        startDate: '',
        startTime: '',
        endTime: '' ,
        dateVal: '', // 默认是当前日期
        selected: '1', // 频次 类型：1.仅一次 2.每天 3.每周 4.每月
        count: 1, // 次数
        mc_checked: false, // 奖励选择-每次默认未选中
        qb_checked: false, // 奖励选择-全部默认未选中
        jl_type: 0, // 奖励类型--1每次2全部
        rewardType_mc: '1', // 奖励选择-每次(1.分数 2.勋章)
        rewardType_qb: '1', // 奖励选择-全部(1.分数 2.勋章)
        id_mc: null,
        id_qb: null,
        score1: 1,
        score2: 1,
        gcName: [], // 选择的活动范围||任务对象名称
        activityType: 3, // 活动范围||任务对象 类型：1.全校 2.年级 3.班级
        gcInfo: [], // 存放选中的年级班级列表
        characteristicList: {
          uploadImg: false, //图片必填/选填开关
        }, // 评价项特性
        summary: '',//简介
      }
    },
    computed: {
      pcList() {
        let arr = this.setSlotValues();
        let dateSlots = [
          {
            flex: 1,
            values: arr,
            className: 'slot1',
            textAlign: 'center'
          }
        ];
        return  dateSlots
      },
      slot_jl() {
        let arr = this.setSlotValues();
        let dateSlots = [
          {
              flex: 1,
              values: ['分数','勋章'],
              className: 'slot1',
              textAlign: 'center'
          }, {
              divider: true,
              content: '-',
              className: 'slot2'
          }, {
              flex: 1,
              values: arr,
              className: 'slot3',
              textAlign: 'center'
          }
        ];
        return  dateSlots
      }
    },
    watch: {
      jlVisible(nVal) {
        let score = 1;
        let rewardType = '分数';
        if (nVal) {
          if(this.jl_type == 1) { // 奖励类型---点击了每次
            score = this.score1;
            rewardType = this.rewardType_mc == 1 ? '分数' : '勋章'
          } else {
            score = this.score2;
            rewardType = this.rewardType_qb == 1 ? '分数' : '勋章'
          }
          setTimeout(() => {
            this.$refs.pickerJL.setSlotValue(0,rewardType)
            this.$refs.pickerJL.setSlotValue(1,score)
          },100)
        }
      }
    },
    activated() {
      this.id = this.$route.query.id;

      Promise.all([this.hideWd(),this.closePicker(),this.hideGrade(),this.getTaskDetail(this.id)]).then(() => {}).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    methods: {
      async getTaskDetail(id) {
        const res = await this.$req.get_special(API.getDetail, id);
        if (res.resultCode == 1) {
          this.info = res.value;
          this.name = res.value.name;
          this.summary = res.value.summary;
          this.startTime = res.value.startTime;
          this.endTime = res.value.endTime;
          this.dimensionId = res.value.dimensionId;
          this.count = res.value.evaluationItemRuleFrequency ? res.value.evaluationItemRuleFrequency.count : 1;
          this.selected = res.value.evaluationItemRuleFrequency ? res.value.evaluationItemRuleFrequency.type : 1;
          this.activityType = res.value.activityRange ? res.value.activityRange.type : 2;
          this.gcInfo = res.value.activityRange ? res.value.activityRange.activityRangeList : [];
          this.characteristicList.uploadImg = res.value.characteristicList[0] == 1 ? true : false;
          let evaluationItemRuleScoreList = res.value.evaluationItemRuleScoreList;
          evaluationItemRuleScoreList.forEach(c => {
            if(c.type == 1) { // 每次
              this.id_mc = c.id;
              this.score1 = c.score;
              this.rewardType_mc = c.rewardType;
              this.mc_checked = true;
            } else {
              this.id_qb = c.id;
              this.score2 = c.score;
              this.rewardType_qb = c.rewardType;
              this.qb_checked = true;
            }
          })
          setTimeout(() => {
            this.$refs.gcSelect._checkedList()
          },300)
        }
      },
      changePC() { // 选择频次
        if(this.selected != '1') {
          let choose = this.$refs.pickerPC.getValues();
          this.count = choose[0]
        }
        this.pcVisible = false
      },
       /*
      * 设置频次，奖励选择的数值
      * */
      setSlotValues() {
        let arr = [];
        let xxdm = this.$cookie.get('xxdm');
        let _start = 1,
            _end = 99;
        
        if(xxdm && xxdm == '1575') { // 徐江小学
          _start = 1,
          _end = 2;
        }
        if(this.selected == '1' && this.pcVisible) {
          arr = [1]
        } else {
          for(let i=_start;i<=_end;i++){
            arr.push(i)
          }
        }
        return arr;
      },
      /*
      * 选择奖励
      * */
      onValuesChangeJl() {
        let values = this.$refs.pickerJL.getValues();
        if(this.jl_type == 1) { // 当前点击的是每次
          this.rewardType_mc = values[0] == '分数' ? 1 :2;
          this.score1 = values[1]
        } else { // 当前点击的是全部
          this.rewardType_qb = values[0] == '分数' ? 1 :2;
          this.score2 = values[1]
        }
        this.jlVisible = false
      },
      _toast(msg) {
        this.$toast(msg)
      },
      showWd() {
        this.$refs.wd.show();
      },
      hideWd() {
        this.$refs.wd.hide();
      },
      getWdInfo(info) {
        this.dimensionId = info.id;
      },
      getWdName(data) {
        this.dimensionName = '';
        data.forEach((c) => {
          this.dimensionName += c.name + '-'
        });
        this.dimensionName = this.dimensionName.substring(0,this.dimensionName.length-1)
      },
      showGrade() {
        this.$refs.gcSelect.show();
      },
      hideGrade() {
        this.$refs.gcSelect.hide()
      },
      getGCInfo(data) {
        this.gcName = [];
        this.gcInfo = data;
        data.forEach((c) => {
          this.gcName.push(c.name)
        })
      },
      handleVisibleChange(val) {
        this.pTimeVisible = val;
      },
      handleConfirm() {
        let time = formatDate(new Date(this.dateVal).getTime());
        if (this.type == 'start') {
          this.startTime = time
        } else {
          this.endTime = time
        }
      },
      _startTime() {
        this.type = 'start';
        if (this.startTime) {
          this.dateVal = this.startTime.replace(/-/g, '/');
        } else {
          this.dateVal = new Date()
        }
        this.openPicker();
      },
      _endTime() {
        this.type = 'end';
        if (this.endTime) {
          this.dateVal = this.endTime.replace(/-/g, '/');
        } else {
          this.dateVal = new Date()
        }
        this.openPicker();
      },
      openPicker() {
        this.$refs.picker.open();
      },
      closePicker() {
        this.$refs.picker.close()
      },
      async submit(event) {
        if(this.name == '') {
          this.$toast('请输入任务名称');
          return;
        }
        if(this.dimensionName == '') {
          this.$toast('请选择维度');
          return;
        }
        if (new Date(this.startTime).getTime() - new Date(this.endTime).getTime() >= 0) {
          this.$toast('结束时间要大于开始时间');
          return;
        }
        if(this.mc_checked == false && this.qb_checked == false) {
          this.$toast('请至少选择一种奖励');
          return;
        }
        if (this.gcName.length == 0) {
          this.$toast('请选择任务对象');
          return;
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
        let evaluationItemRuleFrequency = {
          count: this.count,
          type: this.selected,
          id: this.info.evaluationItemRuleFrequency.id || ''
        };// 频次
        let evaluationItemRuleScoreList = []; // 分值
        if (this.mc_checked) { // 奖励--每次完成选中
          evaluationItemRuleScoreList.push({
            type: 1,
            rewardType: this.rewardType_mc,
            score: this.score1,
            id: this.id_mc
          })
        }
        if (this.qb_checked) { // 奖励--全部完成选中
          evaluationItemRuleScoreList.push({
            type: 2,
            rewardType: this.rewardType_qb,
            score: this.score2,
            id: this.id_qb
          })
        }
        let activityRange = {
          activityRangeList: [],
          type: this.activityType
        }; // 活动范围
        this.gcInfo.forEach((c) => {
          activityRange.activityRangeList.push({
            classCode: c.classCode,
            gradeCode: c.gradeCode,
            id: c.id ? c.id : null
          })
        });
        let data = {
          type: 2,
          scope: 3,
          name: this.name,
          id: this.id,
          startTime: this.startTime + ':00',
          endTime: this.endTime + ':00',
          summary: this.summary,
          dimensionId: this.dimensionId,
          evaluationItemRuleFrequency,
          rewardType: 99,
          evaluationItemRuleScoreList,
          characteristicList: [this.characteristicList.uploadImg ? 1 : 0], // 评价项特性：1.提交任务必须上传图片
          activityRange
        };
        this.submitHttp = false;
        const res = await this.$req.put(API.submitTask, data);
        this.submitHttp = true;
        if (res.resultCode == 1) {
          this.$refs.success.showModal();
          setTimeout(()=>{
            this.back()
          },2000)
        }
      },
      back() {
        this.$router.go(-1);
      }
    }
  }
</script>

<style lang="less" scoped>
  .editForm {
    background-color: #ffffff;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    .formitem {
      margin-bottom: 20px;
      padding: 0 32px;
      &.marginBottom120 {
        margin-bottom: 120px;
      }
      .color {
        color: #333333;
      }
      .label {
        width: 100%;
        height: 68px;
        font-size: 28px;
        font-weight: 600;
        color: #333;
        justify-content: space-between;
        align-items: center;
        .count {
          font-size: 28px;
          color: #B6B8B8;
          font-weight: 400;
        }
      }
      .item-top {
        width: 100%;
        height: 58px;
        font-size: 28px;
        font-weight: 600;
        color: #333;
        .tip {
          color: #969899;
          font-size: 24px;
          margin-left: 20px;
        }
      }
      .item-bottom {
        margin-top: 20px;
        // 奖励类型
        .check-circle {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          transform: scale(0.5);
          transform-origin: 0 center;
          background-color: #EFF1F3;
          &:after {
            content: '';
            width: 8px;
            height: 18px;
            position: absolute;
            left: 33px;
            top: 25px;
            border: 4px solid transparent;
            border-top: 0;
            border-left: 0;
            border-color: #ffffff;
            transform: rotate(45deg) scale(1.5);
            transition: transform .2s;
          }
          &.checked {
            border-color: #ffffff;
            background-color: #33A5FF;
          }
        }
        .name {
          width: 120px;
          color: #262627;
          font-size: 28px;
          margin-left: -20px;
        }
        .right-box {
          height: 88px;
          border-color: #EFF1F3;
          margin-left: 20px;
          color: #262627;
          font-size: 28px;
          .left-type {
            width: 136px;
            height: 48px;
            line-height: 48px;
            padding-left: 20px;
            border-right-color: #EFF1F3;
          }
          .right-num {
            padding: 0 32px 0 18px;
            .select-icon {
              color: #C7C7CC;
              font-size: 25px;
              width: 25px;
              transform: rotate(-90deg);
            }
          }
        }
      }
      .title {
        width: 686px;
        font-size: 28px;
        font-weight: 400;
        line-height: 64px;
        color: rgba(38, 38, 39, 1);
      }
      .item {
        padding: 5px 32px 5px 20px;
        border: 1px solid rgba(239, 241, 243, 1);
      }
      .inputbox {
        -webkit-appearance: none;
        outline: none;
        width: 100%;
        height: 88px;
        background: rgba(255, 255, 255, 1);
        align-items: center;
        font-size: 28px;
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

      // popup
      .popup {
        width: 100%;
        height: 600px;
        background-color: #ffffff;
        .pop-item {
          width: 100%;
          flex-direction: column;
          align-items: center;
          .pop-title {
            width: 100%;
            height: 100px;
            .title {
              font-size: 36px;
              font-weight: 600;
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
            background-color: #ffffff;
            border: 2px solid rgba(239, 241, 243, 1);
            border-radius: 30px;
            text-align: center;
            align-items: center;
            input[type="radio"] {
              display: none;
              &:checked + label {
                width: 140px;
                height: 60px;
                background-color: rgba(51, 165, 255, 1);
                border-radius: 30px;
                line-height: 60px;
                color: #fff;
              }
            }
            label {
              flex: 1;
            }
          }
          .picker {
            width: 100%;
          }
        }
      }
    }
    .pj-bottom-box {
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
    .line1px {
      margin: 20px 32px;
      background-color: #EFF1F3;
    }
  }
</style>
