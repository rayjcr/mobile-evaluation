<template>
  <div class="medal-wall">
    <div class="wall-border"></div>
    <div class="wall-top"></div>
    <div class="wall-content">
      
      <div style="height: 100%" class="scrollY">
        <slot></slot>
      </div>

      <!-- 四个角的圆点 -->
      <div class="dot left-top-dot"></div>
      <div class="dot left-bottom-dot"></div>
      <div class="dot right-top-dot"></div>
      <div class="dot right-bottom-dot"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "MedalWall"
  }
</script>

<style lang="less" scoped>
  .medal-wall {
    position: relative;
    width: 100%;
    height: 612px;
    
    .wall-border {
      position: absolute;
      left: 14px;
      top: 0;
      right: 14px;
      bottom: 0;
      background: linear-gradient(180deg,rgba(255,215,87,1) 0%,rgba(255,164,25,1) 100%);
      border-radius: 40px;
    }

    .wall-top {
      position: absolute;
      top: -36px;
      width: 100%;
      height: 194px;
      background-image: url(/static/img/wall@2x.png);
      background-repeat: no-repeat;
      background-size: 100% 194px;
    }
    
    .wall-content {
      position: absolute;
      left: 30px;
      top: 40px;
      right: 30px;
      bottom: 16px;
      background-color: #ffffff;
      border-radius: 20px;

      .dot {
        position: absolute;
        width: 24px;
        height: 24px;
        background-color: #FFCD50;
        border-radius: 50%;
        transform: scale(.5)
      }
      .left-top-dot {
        left: 14px;
        top: 18px;
      }
      .right-top-dot {
        right: 14px;
        top: 18px;
      }
      .left-bottom-dot {
        left: 14px;
        bottom: 18px;
      }
      .right-bottom-dot {
        right: 14px;
        bottom: 18px;
      }
    }
  }
</style>
