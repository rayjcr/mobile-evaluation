<template>
  <div class="confirm-wrapper">
    <transition name="msgbox-bounce">
      <div class="confirm-box" v-show="isShow">
        <div class="title">{{title}}</div>

        <div class="content" :style="cStyle">{{content}}</div>

        <div class="foot flex border-top">
          <div class="flex alignCenter justifyCenter flex_1 cancle-btn border-right" @click="_hide">{{cancleText}}</div>
          <div class="flex alignCenter justifyCenter flex_1 sure-btn" v-preventReClick="1000" @click="_sure($event)">{{sureText}}</div>
        </div>
      </div>
    </transition>
    <div class="confirm-modal" v-if="isShow" @click="_hide"></div>
  </div>
</template>

<script>
  export default {
    name: 'Confirm_quit',
    props: {
      title: {
        default: '提示'
      },
      content: {
        default: '提示内容'
      },
      cancleText: {
        default: '否'
      },
      sureText: {
        default: '是'
      },
      cStyle: {
        type: Object,
        default:() => {}
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
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }
        this.$emit('sure')
      }
    }
  }
</script>

<style lang="less" scoped>
  .confirm-wrapper {
    position: absolute;
    z-index: 2026;
    top: 0;
    left: 0;
    background-color: rgba(0,0,0,0.5);

    .confirm-modal {
      position: fixed;
      z-index: 2017;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: .5;
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
        margin-bottom: 24px;
        text-align: center;
      }
      .content {
        margin: 20px;
        color: #999999;
        text-align: center;
        line-height: 40px;
        font-size: 28px;
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
