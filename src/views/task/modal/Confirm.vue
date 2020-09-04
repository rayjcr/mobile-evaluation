<template>
  <div class="popup-bg flex" v-show="show">
    <transition name="bounce">
      <div class="popup flex" v-show="show">
        <div class="popup-head flex">
          <div class="name"><span>{{title}}</span></div>
          <div class="close" v-if="showClose" @click="cancel"></div>
        </div>
        <slot>
          <div class="popup-info alignCenter">
            <p>{{msg}}</p>
          </div>
        </slot>
        <slot name="footer">
          <div class="popup-foot flex">
            <div class="footbtn flex alignCenter">
              <div class="cancel btn flex_1" @click="cancel">{{btnText.cancel}}</div>
              <div class="line"></div>
              <div class="confirm btn flex_1" :style="{'color':activeColor}"  @click="confirm">{{btnText.confirm}}</div>
            </div>
          </div>
        </slot>
      </div>      
    </transition>
  </div>
</template>

<script>
  export default {
    name: "Confirm",
    props:{
      title:{
        type: String,
        default: '提示'
      },
      msg:{
        type: String,
        default: '是否确认？'
      },
      btnText:{
        type: Object,
        default() {
          return {
            cancel: '取消',
            confirm: '确认',
          }
        }
      },      
      activeColor:{
        type: String,
        default: '#FF7B12'
      },
      showClose:{
        type: Boolean,
        default: false
      },
      autoHide:{
        type:Boolean,
        default: true
      }
    },
    data() {
      return {
        show: false,
      }
    },
    methods: {
      showModal() {
        this.show = true
      },
      hideModal() {
        this.show = false
      },
      _jump(path) {
        this.$router.push({
          path: path
        });
        this.hideModal();
      },
      cancel() {
        this.$emit('choose',false)
        this.hideModal();
      },
      confirm() {
        this.$emit('choose',true)
        if(this.autoHide){
          this.hideModal();
        }        
      }
    }
  }
</script>

<style scoped lang="less">
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
          .close{
            height: 26px;
            width: 26px;
            background-image: url(../../../../static/img/close.png);
            background-repeat: no-repeat;
            background-size: 100% 100%;
            background-position: 0 0;
            transform: translateY(50%);
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
          margin: 60px 32px 80px 32px;
          font-size:36px;
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
    /deep/ .confirmBtn{
      height: 88px;
      line-height: 88px;
      border-radius: 44px;
      padding: 0 32px;
      background-color: #33A5FF;
      color: #fff;
      margin: 0 auto 40px auto;
      font-size:32px;
      font-family:PingFang SC;
    }
    
  
  .bounce-enter-active {
    animation: bounce-in .3s;
  }
  .bounce-leave-active {
    animation: bounce-in .3s reverse;
  }
  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    // 50% {
    //   transform: scale(1.5);
    // }
    100% {
      transform: scale(1);
    }
  }
</style>
