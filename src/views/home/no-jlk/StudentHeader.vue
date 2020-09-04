<template>
  <div class="header-box">
    <div class="header-fixed flex alignCenter" :style="{'opacity': opacity >= 1 ? 1 : opacity}">
      <div class="avatar" :style="{backgroundImage:  'url(' + userHeadImg + ')'}" v-if="userHeadImg"></div>
      <div class="avatar" :class="{'boy': sex == 1,'girl': sex != 1}" v-else></div>

      <div class="name">{{name}}</div>
      <div class="userLevel" v-if="userLevelIcon" :style="{backgroundImage:  'url(' + userLevelIcon + ')'}"></div>
      <div class="scan icon-scan-fixed" @click="scan">扫一扫</div>
    </div>
    <div class="header-bg flex" :style="{'opacity': scrollTop == 0 ? 1 : (1 - opacity) <= 0 ? 0 : (1 - opacity)}">
      <div class="avatar" :style="{backgroundImage:  'url(' + userHeadImg + ')'}" v-if="userHeadImg"></div>
      <div class="avatar" :class="{'boy': sex == 1,'girl': sex != 1}" v-else></div>
      <div class="right">
        <div class="right-top flex alignCenter">
          <div class="name">{{name}}</div>
          <div class="userLevel" v-if="userLevelIcon" :style="{backgroundImage:  'url(' + userLevelIcon + ')'}"></div>
        </div>
        <div class="right-bottom">{{className}}</div>
      </div>
      <div class="scan icon-scan" @click="scan">扫一扫</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "StudentHeader",
    props: ['scrollTop','userLevelIcon'],
    data() {
      return {
        name: this.$cookie.get('name'),
        sex: this.$cookie.get('sex'),
        userHeadImg: this.$cookie.get('userHeadImg')
      }
    },
    computed: {
      opacity() {
        let new_opacity = 0;
        new_opacity = (this.scrollTop / 100).toFixed(2);
        return new_opacity;
      },
      className() {
        let name = this.$cookie.get('className');
        return name;
      }
    },
    mounted() {
      setTimeout(() => {
        this.userHeadImg = this.$cookie.get('userHeadImg');
      },500)
    },
    activated() {
      this.userHeadImg = this.$cookie.get('userHeadImg');
    },
    methods: {
      scan() {
        this.$root.eventHub.$emit('scan')
      },
      _jump(path) {
        this.$router.push({
          path
        })
      },
    }
  }
</script>

<style lang="less" scoped>
  .header-box {
    position: relative;

    .header-fixed {
      position: fixed;
      z-index: 1005;
      top: 0;
      left: 0;
      width: 100%;
      height: 154px;
      background-color: #ffffff;

      .avatar {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        margin-left: 32px;
        background-repeat: repeat;
        background-size: 90px auto;
        background-position: center;
        background-color: #ccc;
      }
      .boy {
        background-image: url('/static/img/boy@2x.png');
        background-size: 90px auto;
      }
      .girl {
        background-image: url('/static/img/girl@2x.png');
        background-size: 90px auto;
      }
      .name {
        color: #262627;
        font-size: 48px;
        font-weight: 600;
        margin-left: 20px;
      }
      .userLevel {
        width: 48px;
        height: 48px;
        margin-left: 20px;
        background-size: 48px auto;
        background-repeat: no-repeat;
        background-position: center;
      }
    }

    .header-bg {
      position: relative;
      height: 320px;
      padding: 0 32px;
      background-image: url("../img/student_header_bg@2x.png");
      background-repeat: no-repeat;
      background-size: 100%;

      .avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin-top: 40px;
        background-repeat: repeat;
        background-size: 120px auto;
        background-position: center;
        background-color: #ccc;
      }
      .boy {
        background-image: url('/static/img/boy@2x.png');
        background-size: 120px auto;
      }
      .girl {
        background-image: url('/static/img/girl@2x.png');
        background-size: 120px auto;
      }
      .right {
        padding-top: 40px;
        margin-left: 20px;
        .right-top {
          height: 66px;
          .name {
            color: #ffffff;
            font-size: 48px;
            font-weight: 600;
          }
          .userLevel {
            width: 48px;
            height: 48px;
            margin-left: 20px;
            background-size: 48px auto;
            background-repeat: no-repeat;
            background-position: center;
          }
        }
        .right-bottom {
          color: #ffffff;
          font-size: 28px;
          margin-top: 14px;
        }
      }
    }

    .scan {
      position: absolute;
      right: 40px;
      top: 40px;
      width: 90px;
      height: 28px;
      padding-top: 58px;
      text-align: center;
      color: #ffffff;
      font-size: 20px;
    }
    .icon-scan {
      background: url('../img/icon_scan_stu@2x.png') no-repeat center top;
      background-size: 60px auto;
    }
    .icon-scan-fixed {
      color: #262627;
      background: url('../img/icon_scan2@2x.png') no-repeat center top;
      background-size: 60px auto;
    }
  }
</style>
