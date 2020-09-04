<template>
  <div style="height: 100%">
    <transition :name="transitionName" v-if="$route.meta.keepAlive">
      <keep-alive>
        <router-view class="transitionBody"  />
      </keep-alive>
    </transition>
    <transition :name="transitionName" v-if="!$route.meta.keepAlive">
      <router-view class="transitionBody" />
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'Index',
    data () {
      return {
        transitionName: 'transitionNone',
      }
    },
    watch: {
      '$route' (to, from) {
        if (from.meta.tree > to.meta.tree) {
          // 后退,想右滑动
          this.transitionName = 'transitionRight'
        } else if (from.meta.tree < to.meta.tree) {
          // 前进,想左滑动
          this.transitionName = 'transitionLeft'
        } else {
          // 同一层级,无动画
          this.transitionName = 'transitionNone'
        }
      }
    }
  }
</script>

<style scoped>
  .transitionBody {
    transition: all 0.3s ease; /*定义动画的时间和过渡效果*/
  }

  .transitionLeft-enter,
  .transitionRight-leave-active {
    -webkit-transform: translate(100%, 0);
    transform: translate(100%, 0);
    /*当左滑进入右滑进入过渡动画*/
  }

  .transitionLeft-leave-active,
  .transitionRight-enter {
    -webkit-transform: translate(-100%, 0);
    transform: translate(-100%, 0);
  }
</style>
