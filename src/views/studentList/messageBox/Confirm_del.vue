<template>
  <div class="confirm-wrapper">
    <transition name="msgbox-bounce">
      <div class="confirm-box" v-show="isShow">
        <div class="head">删除</div>
        <div class="content">确认删除 <span>{{groupName}}</span>?</div>
        <div class="foot flex border-top">
          <div class="flex alignCenter justifyCenter flex_1 cancle-btn border-right" @click="_hide">取消</div>
          <div class="flex alignCenter justifyCenter flex_1 sure-btn" @click="_sure">确定</div>
        </div>
      </div>
    </transition>

    <div class="confirm-modal" v-if="isShow" @click="_hide"></div>
  </div>
</template>

<script>
  export default {
    name: 'Confirm_del',
    data() {
      return {
        isShow: false, // 弹层的显示隐藏,
        groupName: '',
        groupId: ''
      }
    },
    methods: {
      _show() {
        this.isShow = true;
      },
      _hide() {
        this.isShow = false;
      },
      _sure() {
        this.$emit('remove',this.groupId)
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

    .confirm-modal {
      position: fixed;
      z-index: 2017;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: .3;
      background: #000;
    }
    .confirm-box {
      position: fixed;
      left: 50%;
      top: 50%;
      z-index: 2018;
      text-align: center;
      transform: translate3d(-50%,-50%,0);
      background-color: #ffffff;
      width: 670px;
      border-radius: 40px;
      transition: .2s;
      .head {
        color: #262627;
        font-size: 36px;
        text-align: center;
        margin-top: 24px;
        font-weight: 600;
      }
      .content {
        padding: 60px 0;
        color: #262627;
        font-size: 28px;
        span {
          color: #33A5FF;
        }
      }
      .foot {
        height: 88px;
        border-color: #EFF1F3;
        div {
          height: 100%;
          font-size: 32px;
        }
        .cancle-btn {
          color: #B6B8B8;
          border-color: #EFF1F3;
        }
        .sure-btn {
          color: #33A5FF;
        }
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
  }
</style>
