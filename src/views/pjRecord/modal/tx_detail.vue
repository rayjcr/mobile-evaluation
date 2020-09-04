<template>
  <mt-popup v-model="isShow" v-roll:visible=isShow position="center" class="mint-popup">
    <div class="detail-box" v-if="info">
      <div class="head border-bottom">
        提醒详情
        <span class="icon-close" @click="_hide"></span>
      </div>
      <div class="content scrollY">
        <div class="stu-info border-bottom flex justifySpaceBetween">
          <div class="stu-info-left">
            <div class="name">{{info.studentName}}</div>
            <div class="bjmc">{{info.className}}</div>
          </div>
          <div class="stu-info-right">{{info.createTimeStr}}</div>
        </div>

        <div class="info-detail">
          <div class="info-item flex alignCenter justifySpaceBetween">
            <div class="info-item-left">是否通知家长:</div>
            <div class="info-item-right">{{info.sendMsg ? '是' : '否'}}</div>
          </div>
          <div class="info-item flex alignCenter justifySpaceBetween">
            <div class="info-item-left">评价老师:</div>
            <div class="info-item-right">{{info.teacherName}}</div>
          </div>
        </div>

        <div class="comment" v-if="info.content">{{info.content}}</div>
        <div class="clear">
          <div class="fl img" :class="{'marRight0': (index+1) %3 == 0}" v-for="(item,index) in info.fileInfoVOS"
               :key="item.absolutePath+index">
            <img v-gallery:group3 :src="item.absolutePath" alt="" >
          </div>
        </div>
      </div>
    </div>
  </mt-popup>
</template>

<script>
  export default {
    name: 'tx_detail',
    props: ['info'],
    data () {
      return {
        isShow: false
      }
    },
    methods: {
      _hide () {
        this.isShow = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .detail-box {
    .head {
      position: relative;
      height: 96px;
      line-height: 96px;
      text-align: center;
      color: #262627;
      font-weight: 600;
      font-size: 36px;
      border-bottom-color: #EFF1F3;
      .icon-close {
        position: absolute;
        right: 0;
        top: 0;
        width: 90px;
        height: 100%;
        background: url('/static/img/close.png') no-repeat center;
        background-size: 26px auto;
      }
    }
    .content {
      padding: 32px;
      max-height: 800px;

      .fs-box {
        height: 100%;
        font-size: 64px;
        font-weight: 600;

        .num-box {
          text-align: right;
          margin-left: 20px;
          .add {
            font-size: 40px;
            margin-top: 20px;
          }
        }
        img {
          width: 84px;
        }
      }
      .add-fs {
        color: #33A5FF;
      }
      .reduce-fs {
        color: #FFB600;
      }

      .stu-info {
        margin-top: 40px;
        padding-bottom: 20px;
        border-bottom-color: #EFF1F3;
        .stu-info-left {
          .name {
            color: #262727;
            font-size: 36px;
            font-weight: 600;
          }
          .bjmc {
            color: #B6B8B8;
            font-size: 24px;
            margin-top: 12px;
          }
        }
        .stu-info-right {
          color: #B6B8B8;
          font-size: 24px;
        }
      }

      .info-detail {
        margin-top: 20px;
        .info-item {
          margin-bottom: 12px;
        }
        .info-item-left {
          color: #969899;
          font-size: 28px;
        }
        .info-item-right {
          color: #262727;
          font-size: 28px;
        }
      }

      .comment {
        color: #262627;
        font-size: 28px;
        line-height: 40px;
        margin-top: 28px;
        margin-bottom: 20px;
      }
      .img {
        position: relative;
        width: 190px;
        height: 190px;
        overflow: hidden;
        margin-right: 24px;
        background-color: #EFF1F3;
        &.marRight0 {
          margin-right: 0;
        }
        img {
          position:absolute;
          top:50%;
          left:50%;
          transform: translate(-50%,-50%);
          min-width: 100%;  /* 针对小图标 */
          min-height: 100%;  /* 针对小图标 */
          max-width: 200%; /* 针对太宽的图 -可能变形 */
          max-height: 200%; /* 针对太高的图 -可能变形 */
        }
      }
    }
  }
</style>
