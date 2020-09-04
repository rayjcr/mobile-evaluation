<template>
  <div class="popup-bg flex alignCenter justifyCenter" v-if="popupVisible">
    <div class="popup">
      <div class="popup-head border-bottom">
        <div class="title">
            {{info.itemInfoList[taskKey].createTime}}
            <div class="close" @click="popupVisible = false"></div>
          </div>
      </div>
      <div class="popup-info border-bottom">
        <p class="content">{{info.itemInfoList[taskKey].content}}</p>
          <div class="imglist clear scrollY" v-if="info.itemInfoList[taskKey].fileInfoVOS.length > 0">
            <div class="img fl a" v-for="(item,index) in info.itemInfoList[taskKey].fileInfoVOS" :key="item.absolutePath+index"><img v-gallery:group9 :src="item.absolutePath"></div>
          </div>
      </div>
      <div class="popup-bottom" v-if="info.itemInfoList && info.itemInfoList[taskKey]">
        <div class="notps" v-if="info.itemInfoList[taskKey].status == 0">未审核</div>
        <div class="pass-box" v-else-if="info.itemInfoList[taskKey].status == 1">
          <div class="wd" v-if="info.dimensionName">
            维度:
            <span>{{info.dimensionName}}</span>
          </div>
          <div class="jl">
            奖励:
            <span>{{info.itemInfoList[taskKey].score ? '分数+' + info.itemInfoList[taskKey].score : '勋章+' + info.itemInfoList[taskKey].medal}}</span>
          </div>
          <div class="shsj">审核时间: {{info.itemInfoList[taskKey].auditTime}}</div>
          <div class="btn-bg pass-bg"></div>
        </div>
        <div class="nopass-box" v-else>
          <div class="shsj">审核时间: {{info.itemInfoList[taskKey].auditTime}}</div>
          <div class="btn-bg nopass-bg"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Detail",
    props: {
      taskKey: {
        type: Number,
        default: 0
      },
      info: {
        type: Object,
        default: () => ({})
      },
    },
    data() {
      return {
        popupVisible: false
      }
    },
    methods: {
      showModal() {
        this.popupVisible = true;
      },
      hideModal() {
        this.popupVisible = false;
      }
    }
  }
</script>

<style lang="less" scoped>
  .popup-bg {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 2000;
    width: 100%;
    height: 100vh;
    background: rgba(0,0,0,.5);

    .popup {
      width: 686px;
      border-radius: 40px;
      background-color: #ffffff;
      .popup-head {
        width: 100%;
        padding: 24px 0;
        border-bottom-color: #EFF1F3;
        .title {
          position: relative;
          color: #262627;
          font-size: 36px;
          font-weight: 600;
          text-align: center;
          .close {
            position: absolute;
            right: 0;
            top: 12px;
            width: 90px;
            height: 27px;
            background-image: url(/static/img/close.png);
            background-repeat: no-repeat;
            background-size: 26px auto;
            background-position: center;
          }
        }
      }
      .popup-info {
        padding: 30px 32px;
        border-bottom-color: #EFF1F3;
        .content {
          color: #262627;
          font-size: 28px;
          line-height: 40px;
        }
        .imglist {
          max-height: 400px;
          margin-top: 32px;
          .img{
            height: 190px;
            width: 190px;
            overflow: hidden;
            margin-right: 10px;
            margin-bottom: 10px;
            background-color: #EFF1F3;
            img{
              height: 100%;
              width: 100%;
              object-fit: cover;
            }
          }
        }
      }
      .popup-bottom {
        position: relative;
        padding-left: 32px;
        .notps {
          color: #B6B8B8;
          font-size: 28px;
          padding: 30px 0 32px;
        }
        .pass-box {
          font-size: 28px;
          padding-top: 30px;
          .wd, .jl {
            color: #B6B8B8;
          }
          .wd {
            margin-bottom: 20px;
          }
          .shsj {
            color: #B6B8B8;
            padding: 32px 0 34px 0;
          } 
          span {
            margin-left: 68px;
            color: #262727;
          }
        }
        .nopass-box {
          .shsj {
            color: #B6B8B8;
            padding: 30px 0 32px 0;
          } 
        }
        .btn-bg {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 140px;
          height: 140px;
          background-size: 140px auto;
          background-repeat: repeat;
          background-position: center;
        } 
        .pass-bg {
          background-image: url(../img/pass@2x.png);
        }
        .nopass-bg {
          background-image: url(../img/nopass@2x.png);
        }
      }
    }
  }
</style>
