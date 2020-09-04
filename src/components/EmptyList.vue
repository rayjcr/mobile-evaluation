<template>
  <div class="empty-box flex flex-column justifyCenter alignCenter">
    <div class="img-box"></div>
    <div class="empty-bottom">{{text}}</div>
  </div>
</template>

<script>
  export default {
    name: "EmptyList",
    props: ['text'],
  }
</script>

<style lang="less" scoped>
  .empty-box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    .img-box {
      width: 440px;
      height: 300px;
      margin: 0 auto;
      background: url('../assets/img/empty@2x.png') no-repeat center;
      background-size: 440px auto;
    }
    img {
      width: 100%;
      height: 100%;
    }
    .empty-bottom {
      color: #B6B8B8;
      font-size: 28px;
    }
  }
</style>
