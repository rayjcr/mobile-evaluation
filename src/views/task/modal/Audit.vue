<template>
  <div class="modal-box">
    <div class="popup-bg flex alignCenter justifyCenter" v-if="acceptflg">
      <div class="popup">
        <!-- 待审核 -->
        <div class="popup-head border-bottom audit" v-if="info.status == 0">
          <div class="title">
            {{info.name}}
            <div class="close" @click="acceptflg = false"></div>
          </div>
          <div class="time">{{info.createTime}}</div>
        </div>
        <!-- 已审核 -->
        <div class="popup-head border-bottom audited" v-else>
          <div class="title">
            {{info.name}}
            <div class="close" @click="acceptflg = false"></div>
          </div>
        </div>

        <div class="popup-info border-bottom" v-if="info.itemInfoList && info.itemInfoList[0]">
          <p class="content">{{info.itemInfoList[0].content}}</p>
          <div class="imglist clear scrollY" v-if="info.itemInfoList[0].fileInfoVOS.length > 0">
            <div class="img fl a" v-for="(item,index) in info.itemInfoList[0].fileInfoVOS" :key="item.absolutePath+index"><img v-gallery:group8 :src="item.absolutePath"></div>
          </div>
        </div>

        <div class="popup-bottom">
          <div class="btn-box flex" v-if="info.status == 0">
            <div class="btn not-pass" @click="audit(-1,info.itemInfoList[0].id)">不通过</div>
            <div class="btn pass" @click="recordItemId = info.itemInfoList[0].id;submitflg = true">通过</div>
          </div>
          <div class="bottom-box" v-else>
            <div v-if="info.status == 1">
              <div class="wd" v-if="info.dimensionName">
                维度:
                <span>{{info.dimensionName}}</span>
              </div>
              <div class="jl">
                奖励:
                <span>{{info.itemInfoList[0].score ? '分数+' + info.itemInfoList[0].score : '勋章+' + info.itemInfoList[0].medal}}</span>
              </div>
            </div>
            <div class="tjsj">提交时间: {{info.itemInfoList[0].createTime}}</div>
            <div class="shsj">审核时间: {{info.itemInfoList[0].auditTime}}</div>

            <!-- 是否通过 -->
            <div class="btn-bg pass-bg" v-if="info.status == 1"></div>
            <div class="btn-bg nopass-bg" v-else></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 点击通过弹窗 -->
    <div class="popup-bg flex alignCenter justifyCenter" v-if="submitflg">
      <div class="popup">
        <div class="popup-head border-bottom audited">
          <div class="title">
            通过
            <div class="close" @click="submitflg = false"></div>
          </div>
        </div>
        <div class="popup-info">
          <div class="formitem">
            <div class="label">维度</div>
            <div class="inputbox flex justifySpaceBetween alignCenter border1px" @click="showWd">
              <span :class="{'color': dimensionName != ''}">{{dimensionName ? dimensionName : '请选择维度'}}</span>
              <i class="mintui mintui-back select-icon"></i>
            </div>
          </div>
          <div class="formitem">
            <div class="label">奖励类型</div>
            <div class="radiobox flex alignCenter">
              <input type="radio" name="type" v-model="typeselected" value="1" id="score"><label for="score">分数</label>
              <input type="radio" name="type" v-model="typeselected" value="2" id="metal"><label for="metal">勋章</label>
            </div>
          </div>
          <div class="formitem marginbottom0">
            <div class="title">分值</div>
            <div class="step-box">
              <span class="span-border reduce" @click="changeMark('reduce')">-</span>
              <span class="content">{{number}}</span>
              <span class="span-border add" @click="changeMark('add')">+</span>
            </div>
          </div>
        </div>
        <div class="popup-btn flex alignCenter border-top">
          <div class="gray btn flex_1 border-right" @click="submitflg = false;">取消</div>
          <div class="blue btn flex_1" v-preventReClick="1000" @click="submit($event)">提交</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Audit",
    props: {
      dimensionName: {
        type: String,
        default: ''
      },
      dimensionId: {
        type: String,
        default: ''
      },
      info: {
        type: Object,
        default: () => ({})
      },
    },
    data() {
      return {
        acceptflg: false,
        submitflg: false,
        typeselected: '1',
        number: 1,
        recordItemId: '',
        rewardMin: 0,
        rewardMax: 100
      }
    },
    methods: {
      showModal() {
        this.acceptflg = true;
      },
      hideModal() {
        this.acceptflg = false;
        this.submitflg = false;
      },
      audit(status,recordItemId) {
        let data = {
          status,
          recordItemId
        };
        this.$emit('audit',data)
      },
      showWd() {
        this.$emit('showWd')
      },
      changeMark(type) {
        let number = type == 'add' ? (this.number - 0)+(1 - 0) : (this.number - 0)-(1 - 0);
        number = number <= this.rewardMin ? this.rewardMin : number >= this.rewardMax ? this.rewardMax : number;
        this.number = number;
      },
      submit(event) {
        if (this.dimensionName == '') {
          this.$toast('请选择维度')
          return;
        }
        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }
        let data = {
          status: 1,
          recordItemId: this.recordItemId,
          dimensionId: this.dimensionId
        }
        if (this.typeselected == '1') {
          data['score'] = this.number;
        } else {
          data['metal'] = this.number;
        }
        this.$emit('audit',data)
      }
    }
  }
</script>

<style lang="less" scoped>
  .popup-bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2000;
    width: 100%;
    height: 100vh;
    background: rgba(0,0,0,.5);

    .popup {
      width: 686px;
      border-radius: 40px;
      background-color: #ffffff;
      .popup-head {
        width: 100%;
        border-bottom-color: #EFF1F3;
        .title {
          position: relative;
          color: #262627;
          font-size: 36px;
          font-weight: 600;
          text-align: center;
          .close {
            position: absolute;
            right: 0;
            top: 12px;
            width: 90px;
            height: 27px;
            background-image: url(/static/img/close.png);
            background-repeat: no-repeat;
            background-size: 26px auto;
            background-position: center;
          }
        }
        .time {
          color: #B6B8B8;
          font-size: 32px;
          text-align: center;
          margin-bottom: 18px;
        }
      }
      .audit {
        padding-top: 24px;
      }
      .audited {
        padding: 24px 0;
      }
      .popup-info {
        padding: 30px 32px 32px;
        border-bottom-color: #EFF1F3;
        .content {
          color: #262627;
          font-size: 28px;
          line-height: 40px;
        }
        .imglist {
          max-height: 400px;
          margin-top: 32px;
          .img{
            height: 190px;
            width: 190px;
            overflow: hidden;
            margin-right: 10px;
            margin-bottom: 10px;
            background-color: #EFF1F3;
            img{
              height: 100%;
              width: 100%;
              object-fit: cover;
            }
          }
        }
        .formitem {
          margin-bottom: 34px;
          .label {
            color: #262627;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .inputbox {
            height: 88px;
            color: #B6B8B8;
            padding: 0 20px;
            border-color: #EFF1F3;
            .color {
              color: #333333;
            }
            .select-icon{
              color: #C7C7CC;
              font-size: 25px;
              width: 25px;
              transform: rotate(-90deg);
            }
          }
          .radiobox {
            font-size: 28px;
            line-height: 64px;
            color: #262627;
            text-align: center;
            input[type='radio']{
              display: none;
              & + label::before{
                content: '';
                display: inline-block;
                width: 10px;
                height: 10px;
                border: 14px solid rgba(239,241,243,1);
                border-radius:50%;
                position: relative;
                top: 8px;
                margin-right: 20px;
              }
              &:checked + label::before{
                border: 14px solid rgba(51,165,255,1);
              }
            }
            label{
              margin-right: 60px;
            }
          }
          .title {
            color: #262627;
            font-size: 28px;
            margin-bottom: 12px;
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
        .marginbottom0 {
          margin-bottom: 0;
        }
      }
      .btn-box {
        padding: 20px 72px;
        .btn {
          width: 200px;
          height: 64px;
          line-height: 64px;
          text-align: center;
          font-size: 30px;
          border-radius: 44px;
        }
        .not-pass {
          color: #FF7B12;
          background-color: #EFF1F3;
        }
        .pass {
          color: #FFFFFF;
          background-color: #33A5FF;
          margin-left: 142px;
        }
      }
      .bottom-box {
        position: relative;
        padding: 32px;
        color: #B6B8B8;
        font-size: 28px;
        .wd ,.jl {
          margin-bottom: 20px;
          span {
            display: inline-block;
            color: #262727;
            font-size: 28px;
            margin-left: 68px;
          }
        }
        .tjsj {
          margin-bottom: 20px;
        }
        .btn-bg {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 140px;
          height: 140px;
          background-size: 140px auto;
          background-repeat: repeat;
          background-position: center;
        } 
        .pass-bg {
          background-image: url(../img/pass@2x.png);
        }
        .nopass-bg {
          background-image: url(../img/nopass@2x.png);
        }
      }
      .popup-btn{
        height: 88px;
        border-top-color: #EFF1F3;
        .btn{
          text-align: center;
          font-size: 32px;
          font-weight: 600;
          line-height: 88px;
        }
        
        .gray{
          color: #B6B8B8;
          border-right-color: #EFF1F3;
        }
        .blue{
          color:#33A5FF;
        }
      }
    }
  }
</style>
