<template>
  <div class="success-box" v-if="show">
    <div class="tip-box">
      <div class="tip-header">
        <img class="pj_top" src="/static/img/pj_success_top.png" v-if="type == 1">
      </div>
      <div class="tip-content">
        <img src="/static/img/pj_success.png">
        <p>{{tip}}</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Modal",
    props: ['tip','type'],
    data() {
      return {
        show: false,
      }
    },
    methods: {
      showModal() {
        this.show = true;
        setTimeout(() => {
          this.show = false
        },2000)
      },
      hideModal() {
        this.show = false
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
      height: 520px;
      margin-left: -255px;
      margin-top: -260px;
      box-shadow: 0 6px 18px rgba(86,104,119,0.15);
      border-radius: 16px;

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
      }
      .tip-content {
        text-align: center;
        height: calc(100% - 80px);
        background-color: #ffffff;
        img {
          width: 150px;
          height: 150px;
          margin-top: 102px;
        }
        p {
          color: #262627;
          font-size: 48px;
          font-weight: 600;
        }
      }
    }
  }
</style>
