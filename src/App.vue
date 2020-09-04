<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  import {gobalAPi} from '@/utils/api'
  export default {
    name: 'App',
    created() {
      let token = this.$cookie.get('authToken');
      if(token) {
        this.getGConfig() // mixins
      }
    }
  }
</script>

<style lang="less">
  @import '../static/less/app.less'; // 全局自定义的css样式
  @import '../static/less/transition.less';
</style>
