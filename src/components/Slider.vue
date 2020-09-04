<template>
  <div class="swiper-container">
    <div class="swiper-wrapper">
      <slot></slot>
    </div>
    <!-- 如果需要分页器 -->
    <div class="swiper-pagination" v-if="pagination"></div>
  </div>
</template>

<script>
  import 'swiper/dist/css/swiper.css'
  import Swiper from 'swiper'
  export default {
    name: "Slider",
    props: {
      len: {},
      loop: {
        type: Boolean,
        default: true,
      },
      pagination: {
        type: Boolean,
        default: true,
      }
    },
    data() {
      return {
        swiper: null
      }
    },
    watch: {
      len() {
        this.swiper.destroy()   //先销毁
        this.$nextTick(() => {
          this.initSwiper();
        })
      }
    },
    mounted() {
      this.initSwiper();
    },
    methods: {
      initSwiper() {
        let self = this;
        this.swiper = new Swiper ('.swiper-container',{
          loop: this.loop,

          // 如果需要分页器
          pagination: '.swiper-pagination',

          onClick: function(e){
            let index = self.len >= e.clickedIndex ? e.clickedIndex-1 : 0
            self.$emit('getClickedIndex', index)
          },
          // pagination:{
          //   el: '.swiper-pagination',
          //   clickable: false,
          // },
          // on: {
          //   click: function(e){
          //     self.loopDom(e.target)
          //   }
          // }
        })
      },
      loopDom(e) {
        if (e.className.indexOf('swiper-pagination') > -1) {
          return;
        }
        let dataset = e.dataset
        if(typeof dataset == 'undefined' || typeof dataset.index == 'undefined') {
          this.loopDom(e.parentNode)
        } else {
          this.$emit('getClickedIndex', dataset.index)
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .swiper-container {
    width: 100%;
    height: 100%;
  }
</style>
