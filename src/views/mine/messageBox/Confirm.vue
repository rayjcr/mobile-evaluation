<template>
    <div class="confirm-wrapper">
      <transition name="msgbox-bounce">
        <div class="confirm-box" v-show="isShow">我是confirm</div>
      </transition>
      <div class="confirm-modal" v-if="isShow" @click="_hide"></div>
    </div>
</template>

<script>
  export default {
    name: 'Confirm',
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
      width: 85%;
      border-radius: 6px;
      transition: .2s;
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
