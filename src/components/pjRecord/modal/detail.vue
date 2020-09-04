<template>
  <mt-popup v-model="isShow" v-roll:visible=isShow position="center" class="mint-popup">
    <div class="detail-box" v-if="info">
      <div class="head border-bottom">
        <div class="head-left" v-if="info.type == 1">
          <span class="revoke-btn" @click="_showConfirm" v-if="info.effectStatus == 0">撤销评价</span>
          <span v-else-if="info.effectStatus == 1">评价已撤销</span>
          <span v-else>评价已生效</span>
        </div>
        评价详情
        <span class="icon-close" @click="_hide"></span>
      </div>
      <div class="content scrollY">
        <div class="fs-box add-fs flex alignCenter justifyCenter" v-if="info.rewardType == 3 || info.rewardType == 5">
          <img v-show="info.rewardType == 5" :src="info.medalIcon || require('../img/medal@2x.png')">
          <div class="num-box clear">
            <span class="fr">{{info.score ? info.score : info.medal}}</span>
            <span class="fr add">{{info.score ? '+' : info.medal ? '+' : ''}}</span>
          </div>
        </div>
        <div class="fs-box reduce-fs flex alignCenter justifyCenter" v-else-if="info.rewardType == 4 || info.rewardType == 6">
          <img v-show="info.rewardType == 6" :src="info.medalIcon || require('../img/medal@2x.png')">
          <div class="num-box">
            <span>{{info.score ? info.score : info.medal}}</span>
          </div>
        </div>

        <div class="stu-info border-bottom flex justifySpaceBetween">
          <div class="stu-info-left">
            <div class="name">{{origin === 'class' ? info.className : info.name}}</div>
            <div class="bjmc" v-if="!origin">{{info.className}}</div>
          </div>
          <div class="stu-info-right">{{info.recordTimeStr}}</div>
        </div>

        <div class="info-detail">
          <div class="info-item flex alignCenter justifySpaceBetween" v-if="info.type == 1">
            <div class="info-item-left">评价项名称:</div>
            <div class="info-item-right">{{info.evaluationName}}</div>
          </div>
          <div class="info-item flex alignCenter justifySpaceBetween" v-else-if="info.type == 5">
            <div class="info-item-left">评价维度:</div>
            <div class="info-item-right">{{info.dimensionName || '无'}}</div>
          </div>
           <div v-else-if="info.type == 2">
             <div class="info-item flex alignCenter justifySpaceBetween" style="width: 100%;">
              <div class="info-item-left">任务名称:</div>
              <div class="info-item-right">{{info.evaluationName || '无'}}</div>
             </div>
             <div class="info-item flex alignCenter justifySpaceBetween" style="width: 100%;">
              <div class="info-item-left">奖励维度:</div>
              <div class="info-item-right">{{info.dimensionName || '无'}}</div>
             </div>
          </div>
          <div class="info-item flex alignCenter justifySpaceBetween">
            <div class="info-item-left">{{info.type == 2 ? '奖励形式:' : '奖惩:'}}</div>
            <div class="info-item-right" v-if="info.rewardType == 3">加分</div>
            <div class="info-item-right" v-else-if="info.rewardType == 4">减分</div>
            <div class="info-item-right" v-else-if="info.rewardType == 5">奖励勋章</div>
            <div class="info-item-right" v-else>扣除勋章</div>
          </div>
          <div class="info-item flex alignCenter justifySpaceBetween" v-if="info.type == 1 || info.type == 2">
            <div class="info-item-left">评价老师:</div>
            <div class="info-item-right">{{info.evaluatorName}}</div>
          </div>
           <div class="info-item flex alignCenter justifySpaceBetween" v-else-if="info.type == 5">
            <div class="info-item-left">班级荣誉:</div>
            <div class="info-item-right">{{info.remark}}</div>
          </div>
        </div>

        <div class="comment" v-if="itemInfo && itemInfo.content">{{itemInfo.content}}</div>
        <div class="clear" v-if="itemInfo">
          <div class="fl img" :class="{'marRight0': (index+1) %3 == 0}" v-for="(item,index) in itemInfo.fileInfoVOS"
               :key="item.absolutePath+index">
            <img v-gallery:group1 :src="item.absolutePath" alt="" >
          </div>
        </div>
      </div>
    </div>
  </mt-popup>
</template>

<script>
  export default {
    name: 'detail',
    props: ['info', 'itemInfo', 'origin'],
    data () {
      return {
        isShow: false
      }
    },
    watch: {
      isShow(nVal) {
        if(nVal) {
          this.$root.eventHub.$on('closeDetailModal',this._hide);
        } else {
          this.$root.eventHub.$off('closeDetailModal',this._hide);
        }
      },
    },
    methods: {
      _hide () {
        this.isShow = false
      },
      _showConfirm() {
        this.$root.eventHub.$emit('revokeRecord',this.info.id);
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
      .head-left {
        position: absolute;
        top: 0;
        left: 32px;
        color: #B6B8B8;
        font-size: 28px;
        font-weight: 400;
        .revoke-btn {
          color: #33A5FF;
        }
      }
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
