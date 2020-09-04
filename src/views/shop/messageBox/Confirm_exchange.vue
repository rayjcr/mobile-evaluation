<template>
    <div class="confirm-wrapper">
      <transition name="msgbox-bounce">
        <div class="confirm-box" v-show="isShow">
          <div class="title">兑换确认</div>
          <div class="content">确认兑换<span>{{info.name}}</span>?</div>
          <div class="foot flex border-top">
            <div class="flex alignCenter justifyCenter flex_1 cancle-btn border-right" @click="_hide">取消</div>
            <div class="flex alignCenter justifyCenter flex_1 sure-btn" v-preventReClick="1000" @click.prevent="_sure($event)">确定</div>
          </div>
        </div>
      </transition>

      <div class="confirm-modal" v-if="isShow" @click="_hide"></div>
    </div>
</template>

<script>
  export default {
    name: 'Confirm_exchange',
    props: {
      info: {
        default: {
          name: ''
        }
      }
    },
    data() {
      return {
        isShow: false // 弹层的显示隐藏
      }
    },
    methods: {
      _show() {
        this.isShow = true;
      },
      _hide() {
        this.isShow = false;
      },
      _sure(event) {
        if (event.target.disabled) {
          this.$toast("请不要重复点击，耐心等待一秒哦");
          return;
        }
        this.$emit('sure')
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
      text-align: center;
      transform: translate3d(-50%,-50%,0);
      background-color: #ffffff;
      width: 85%;
      border-radius: 40px;
      transition: .2s;
      .title {
        color: #262627;
        font-size: 36px;
        font-weight: 600;
        margin-top: 24px;
      }
      .content {
        color: #262627;
        font-size: 28px;
        padding: 0 60px;
        margin: 60px 0;
        span {
          color: #33A5FF;
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
