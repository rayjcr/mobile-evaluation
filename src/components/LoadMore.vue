<template>
  <!-- :topDistance="10"  -->
  <mt-loadmore :top-method="loadTop" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" ref="loadmore" :autoFill="isAutoFill">
    <slot></slot>
  </mt-loadmore>
</template>

<script>
    export default {
        name: "LoadMore",
        props: ['allLoaded'],
        data() {
          return {
            isAutoFill: false,
          }
        },
        methods: {
          loadTop() {
            this.$emit('loaded',1)
          },
          loadBottom () {
            this.$emit('loaded')
          },
          onTopLoaded() {
            this.$refs.loadmore.onTopLoaded()
          },
          onBottomLoaded() {
            this.$refs.loadmore.onBottomLoaded()
          }
        }
    }
</script>

<style scoped>

</style>
