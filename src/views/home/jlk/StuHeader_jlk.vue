<template>
  <div class="header-box">
    <div class="header-bg">
      <div class="scan-box" @click="scan">
        <span class="scan">扫一扫</span>
      </div>
      <div class="rank-box" @click="jump('/studetail')">
        <span class="rank">排行榜</span>
      </div>
      <div class="top flex" ref="headerTop">
        <div class="avatar" :style="{backgroundImage:  'url(' + userHeadImg + ')'}" v-if="userHeadImg"></div>
        <div class="avatar" :class="{'boy': sex == 1,'girl': sex != 1}" v-else></div>
        <div class="right">
          <div class="right-top flex alignCenter">
            <div class="name text-overflow">{{name}}</div>
            <div class="userLevel" v-if="userLevelIcon" :style="{backgroundImage:  'url(' + userLevelIcon + ')'}"></div>
          </div>
          <div class="right-bottom">{{className}}</div>
        </div>
      </div>
      <div class="label-box clear" ref="labelLists">
        <div class="label-item fl flex alignCenter justifyCenter" :class="[labelClassArr[index%3]]" v-for="(item,index) in medalList" :key="index">{{item.name}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "StuHeader_jlk",
    props: ['medalList','userLevelIcon'],
    data() {
      return {
        name: this.$cookie.get('name'),
        className: this.$cookie.get('className'),
        classCode: this.$cookie.get('classCode'),
        studentCode: this.$cookie.get('userId'),
        userHeadImg: this.$cookie.get('userHeadImg'),

        sex: this.$cookie.get('sex'),
        labelClassArr: ['label0','label1','label2'],
        labelHeight: 0,
        topHeight: 0,
      }
    },
    watch: {
      medalList() {
        this.$nextTick(() => {
          this.labelHeight = this.$refs.labelLists.clientHeight;
          let _height = (this.labelHeight + this.topHeight + 30) + 'px'
          this.$emit('getLabelH',_height)
        })
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.topHeight = this.$refs.headerTop.clientHeight;
      })
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
      jump(path) {
        this.$router.push({
          path,
          query: {
            isStu: 1,
            name: this.name,
            studentCode: this.studentCode,
            className: this.className,
            classCode: this.classCode
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .header-box {
    position: relative;

    .header-bg {
      height: 440px;
      padding: 0 32px;
      background-image: url("../img/stu_header_bg_jlk@2x.png");
      background-repeat: no-repeat;
      background-size: 100%;

      .scan-box {
        position: absolute;
        right: 120px;
        top: 40px;
        .scan {
          display: inline-block;
          width: 90px;
          color: #ffffff;
          font-size: 20px;
          padding-top: 60px;
          text-align: center;
          background: url('../img/icon_scan_stu@2x.png') no-repeat center top;
          background-size: 58px auto;
        }
      }
      .rank-box {
        position: absolute;
        right: 32px;
        top: 40px;
        .rank {
          display: inline-block;
          width: 90px;
          color: #ffffff;
          font-size: 20px;
          padding-top: 60px;
          text-align: center;
          background: url('../img/icon_rank@2x.png') no-repeat center top;
          background-size: 58px auto;
        }
      }
      .top {
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
          margin-top: 40px;
          margin-left: 20px;
          .right-top {
            height: 66px;
            .name {
              max-width: 280px;
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
      .label-box {
        margin-top: 16px;
        .label-item {
          width: 104px;
          height: 34px;
          border: 2px solid #ffffff;
          border-radius: 40px;
          margin-right: 6px;
          margin-bottom: 10px;
          font-size: 20px;
        }
        .label0 {
          color: #00CD86;
          background-color: rgba(229,255,246,0.8);
        }
        .label1 {
          color: #33A5FF;
          background-color: rgba(243,250,255,0.8);
        }
        .label2 {
          color: #AD5FFB;
          background-color: rgba(243,230,255,0.8);
        }
      }
    }
  }
</style>
