<template>
  <transition name="msgbox-bounce">
    <div class="message" :class="type" v-if="visible">
      <div class="flex alignCenter justifyCenter">
        <i class="icon-type" :class="'icon-'+type"></i>
        <div class="tip">{{tip}}</div>
      </div>
      <div class="content" v-if="content" v-html="content"></div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'Message',
    data() {
      return {
        tip: '',
        content: '',
        time: 3000,
        visible: false,
        type: 'success', //'success','error'
      }
    },
    mounted() {
      this.close()
    },
    methods: {
      close() {
        window.setTimeout(() =>{
          this.visible = false
        }, this.time);
      }
    }
  }
</script>

<style lang="less" scoped>
  .message {
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: 2018;
    padding: 75px 50px;
    transform: translate3d(-50%,-50%,0);
    width: 550px;
    transition: .2s;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 8px 30px rgba(0,0,0,0.16);
    .icon-type {
      display: inline-block;
      width: 47px;
      height: 47px;
      margin-right: 20px;
    }
    .icon-success {
      background: url('./img/icon_success@2x.png') no-repeat center;
      background-size: 47px auto;
    }
    .icon-error {
      background: url('./img/icon_error@2x.png') no-repeat center;
      background-size: 47px auto;
    }
    .tip {
      color: #262727;
      font-size: 31px;
    }
    .content {
      text-align: center;
      font-size: 28px;
      margin-top: 39px;
      color: #262727;
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
</style>
