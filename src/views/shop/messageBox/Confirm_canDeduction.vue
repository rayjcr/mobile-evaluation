<template>
  <div class="confirm-wrapper">
    <transition name="msgbox-bounce">
      <div class="confirm-box" v-show="isShow">
        <div class="title">抵消确认</div>
        <div class="content">
          <div class="top">
            <div class="top-title" style="margin-bottom: 10px">抵消<span>[{{info.name}}]</span></div>
            <div class="flex alignCenter">
              <div class="top-title">数量</div>
              <div class="step-box">
                <span class="span-border reduce" @click="_changeMark('reduce',1)">-</span>
                <span class="step-content">{{number}}</span>
                <span class="span-border add" @click="_changeMark('add',1)">+</span>
              </div>
            </div>
          </div>
          <div class="bottom">
            需要消耗<span>{{info.number * number}}</span>枚勋章，确认抵消?
          </div>
        </div>
        <div class="foot flex border-top">
          <div class="flex alignCenter justifyCenter flex_1 cancle-btn border-right" @click="_showPunishConfirm">取消</div>
          <div class="flex alignCenter justifyCenter flex_1 sure-btn" v-preventReClick="1000" @click.prevent="_sure($event)">确定</div>
        </div>
      </div>
    </transition>

    <div class="confirm-modal" v-if="isShow" @click="_hide"></div>
  </div>
</template>

<script>
  export default {
    name: 'Confirm_canDeduction',
    props: {
      info: {
        default: {
          name: '',
          count: 0
        }
      }
    },
    data() {
      return {
        isShow: false, // 弹层的显示隐藏
        number: 1
      }
    },
    methods: {
      _show() {
        this.isShow = true;
      },
      _hide() {
        this.isShow = false;
      },
      _changeMark(type) {
        this.number = type == 'add' ? (this.number - 0)+(1 - 0) : (this.number - 0)-(1 - 0);
        //限制区间
        this.number = this.number < 1 ? 1 : this.number > this.info.count ? this.info.count : this.number;
      },
      _showPunishConfirm() {
        this._hide();
        this.$emit('showPunishConfirm')
      },
      _sure(event) {
        if (event.target.disabled) {
          this.$toast("请不要重复点击，耐心等待一秒哦");
          return;
        }
        this.$emit('sure',this.info,this.number)
      }
    }
  }
</script>

<style lang="less" scoped>
  .confirm-wrapper {
    position: absolute;
    z-index: 2016;
    top: 0;
    left: 0;

    .confirm-modal {
      position: fixed;
      z-index: 2017;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: .3;
      background: #000;
    }
    .confirm-box {
      position: fixed;
      left: 50%;
      top: 50%;
      z-index: 2018;
      transform: translate3d(-50%,-50%,0);
      background-color: #ffffff;
      width: 622px;
      border-radius: 40px;
      transition: .2s;
      .title {
        color: #262627;
        font-size: 36px;
        font-weight: 600;
        margin-top: 24px;
        text-align: center;
      }
      .content {
        padding: 40px 60px 40px 60px;
        .top {
          .top-title {
            color: #262627;
            font-size: 28px;
            span {
              color: #33A5FF;
            }
          }
          .step-box {
            margin-left: 40px;
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
            .step-content {
              width: 90px;
              text-align: center;
              color: #262627;
              font-size: 28px;
            }
          }
        }
        .bottom {
          margin-top: 20px;
          color: #262627;
          font-size: 28px;
          span {
            color: #33A5FF;
          }
        }
      }
      .foot {
        height: 88px;
        border-color: #EFF1F3;
        div {
          height: 100%;
          font-size: 32px;
        }
        .cancle-btn {
          color: #B6B8B8;
          border-color: #EFF1F3;
        }
        .sure-btn {
          color: #33A5FF;
        }
      }
    }

    .msgbox-bounce-enter {
      opacity: 0;
      transform: translate3d(-50%, -50%, 0) scale(0.7);
    }
    .msgbox-bounce-leave-active {
      opacity: 0;
      transform: translate3d(-50%, -50%, 0) scale(0.9);
    }
  }
</style>
