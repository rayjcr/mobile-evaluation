<template>  
    <div class="success-box" v-show="show">
      <transition name="bounce">
      <div class="tip-box" v-show="show">
        <div class="tip-header">
          <img class="pj_top" src="/static/img/lq_sucess_top.png">
          <div class="icon_close" @click="hideModal"></div>
        </div>
        <div class="tip-content">
          <img src="/static/img/lq_sucess.png">
          <p>{{tip}}</p>
        </div>
        <div class="tip-bottom">
          <span class="tip-text">已添加至你的任务列表</span>
          <span class="text-btn" @click="jumpToPath">前去查看</span>        
        </div>
      </div>
      </transition>
    </div>    
</template>

<script>
  export default {
    name: "Modal_receive",
    props: ['tip'],
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
        this.$emit('jumpToPath')
      },
      _jump(path) {
        console.log(path,37)
        this.$router.push({
          path: path
        });
        this.hideModal();
      },
      _back() {
        this.$router.back();
        this.hideModal();
      },
      jumpToPath(){
        this.$emit('jumpToPath')
        this.hideModal();
      }
    }
  }
</script>

<style lang="less"  scoped>
  .success-box {
    position: absolute;
    z-index: 3000;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0,0,0,.2);

    .tip-box {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 510px;
      height: 550px;
      margin-left: -255px;
      margin-top: -340px;
      box-shadow: 0 6px 18px rgba(86,104,119,0.15);
      border-radius: 16px;
      background-color: #ffffff;

      .tip-header {
        position: relative;
        height: 80px;
        background-color: #FFB400;
        border-radius: 16px 16px 0 0;

        .pj_top {
          position: absolute;
          width: 214px;
          height: 134px;
          left: 0;
          top: -54px;
        }
        .icon_close {
          position: absolute;
          cursor: pointer;
          right: 20px;
          top: 50%;
          margin-top: -15px;
          width: 29px;
          height: 30px;
          background: url('./img/icon_close@2x.png') no-repeat center;
          background-size: 29px auto;
        }
      }
      .tip-content {
        text-align: center;
        img {
          width: 150px;
          height: 150px;
          margin-top: 80px;
        }
        p {
          color: #262627;
          font-size: 48px;
          font-weight: 600;
          margin-top: 20px;
        }
      }
      .tip-bottom {
        margin-top: 40px;
        text-align: center;
        span {
          display: inline-block;
          font-size: 30px;
        }
        .continue-btn {
          width: 200px;
          height: 72px;
          line-height: 72px;
          text-align: center;
          color: #FFFFFF;
          border-radius: 44px;
          background-color: #33A5FF;
        }
        .look-btn {
          color: #262727;
          margin-top: 36px;
        }
        .tip-text{
          font-size:24px;
          font-weight:400;
          color:rgba(174,182,193,1);
        }
        .text-btn{
          font-size:24px;
          font-weight:400;
          color:rgba(51,165,255,1);  
          margin-left: 20px;
          &::after{
            content: '';
            height: 18px;
            width: 11.59px;
            margin-left: 12px;
            position: relative;
            display: inline-block;
            background-image: url(img/Disclosure@2x.png);
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-position: 0 0;
          }
        }
      }
    }
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
