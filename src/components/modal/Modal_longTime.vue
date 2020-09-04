<template>
  <div class="success-box" v-if="show">
    <div class="tip-box">
      <div class="tip-header">
        <img class="pj_top" src="/static/img/pj_success_top.png">
        <div class="icon_close" @click="_back"></div>
      </div>
      <div class="tip-content">
        <img src="/static/img/pj_success.png">
        <p>{{tip}}</p>
      </div>
      <div class="tip-bottom">
        <span class="continue-btn" @click="_back">继续评价</span>
        <br />
        <span class="look-btn" @click="_jump('/pjrecord')">查看记录</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Modal_success",
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
      },
      _jump(path) {
        this.$router.push({
          path: path
        });
        this.hideModal();
      },
      _back() {
        this.$router.back();
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
      height: 680px;
      margin-left: -255px;
      margin-top: -340px;
      box-shadow: 0 6px 18px rgba(86,104,119,0.15);
      border-radius: 16px;
      background-color: #ffffff;

      .tip-header {
        position: relative;
        height: 80px;
        background-color: #CFEAFF;
        border-radius: 16px 16px 0 0;

        .pj_top {
          position: absolute;
          width: 290px;
          height: 120px;
          left: 0;
          top: -40px;
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
        }
      }
      .tip-bottom {
        margin-top: 80px;
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
      }
    }
  }
</style>
