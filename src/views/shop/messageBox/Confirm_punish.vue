<template>
  <div class="confirm-wrapper">
    <transition name="msgbox-bounce">
      <div class="confirm-box" v-show="isShow">
        <div class="head">
          <div class="title">惩罚卡</div>
          <div class="close" @click="_hide">×</div>
        </div>
        <div class="content scrollY">
          <ul class="clear">
            <li
              class="fl"
              :class="{'marginRight': (index+1)%2 != 0}"
              v-for="(item,index) in list"
              :key="index"
              @click="_canDeduction(index)"
            >
              <div class="top" :style="{'backgroundImage': 'url('+item.icon+')'}">
                <div :class="{'nonCanceling': item.canDeduction == 0,'countervailable': item.canDeduction == 1}"></div>
              </div>
              <div class="bottom flex justifySpaceBetween">
                <div class="name">{{item.name}}</div>
                <div class="num">{{item.number}}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </transition>

    <div class="confirm-modal" v-if="isShow" @click="_hide"></div>
  </div>
</template>

<script>
  export default {
    name: 'Confirm_punish',
    props: {
      list: {
        default: []
      }
    },
    data() {
      return {
        isShow: false // 弹层的显示隐藏
      }
    },
    methods: {
      _show() {
        this.isShow = true;
      },
      _hide() {
        this.isShow = false;
      },
      _canDeduction(key) {
        if(this.list[key].canDeduction == 0) {
          this.$toast('该惩罚项无法被抵消！');
          return;
        }
        this._hide();
        this.$emit('candeduction',this.list[key])
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
        position: relative;
        .title {
          color: #262627;
          font-size: 36px;
          font-weight: 600;
          margin-top: 24px;
        }
        .close {
          position: absolute;
          right: 0;
          top: 0;
          width: 105px;
          color: #C7C7CC;
          font-size: 40px;
        }
      }
      .content {
        height: 550px;
        padding: 40px;
        li {
          width: 264px;
          margin-bottom: 40px;
          &.marginRight {
            margin-right: 60px;
          }
          .top {
            height: 120px;
            border-radius: 4px;
            background-size: 264px auto;
            background-position: center;
            background-repeat: no-repeat;
            .countervailable {
              width: 76px;
              height: 32px;
              background: url('./img/countervailable@2x.png') no-repeat center;
              background-size: 76px auto;
            }
            .nonCanceling {
              width: 96px;
              height: 32px;
              background: url('./img/nonCanceling@2x.png') no-repeat center;
              background-size: 96px auto;
            }
          }
          .bottom {
            margin-top: 20px;
            .name {
              color: #262626;
              font-size: 28px;
            }
            .num {
              position: relative;
              color: #262727;
              font-size: 28px;
              &:before {
                content: 'x';
                position: absolute;
                left: -16px;
              }
            }
          }
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
