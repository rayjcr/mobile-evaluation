<template>
    <div class="shop">
      <component :is="cmpName" v-if="cmpName"></component>
    </div>
</template>

<script>
  import TeaShop from './TeaShop.vue'
  import StuShop from './StuShop.vue'
  export default {
    name: 'Index',
    data() {
      return {
        cmpName: '',
        userType: ''
      }
    },
    components: {
      TeaShop,
      StuShop
    },
    watch: {
      userType(nVal) {
        this.cmpName = nVal <= 3 ? 'TeaShop' : 'StuShop'
      }
    },
    activated() {
      this.getUserInfo()
    },
    methods: {
      getUserInfo() {
        this.userType = this.$cookie.get('userType')
      },
    }
  }
</script>

<style lang="less" scoped>
  .shop {
    height: 100%;
  }
</style>
