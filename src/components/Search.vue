<template>
  <div class="search-box flex alignCenter">
<!--    <i class="mintui mintui-search search-icon"></i>-->
    <div class="search-icon"></div>
    <input type="text" :class="{'hasClear': isClear}" :placeholder="placeholder" @blur="$blur" v-model="keyWord" @input="_input" />
    <div class="clear" v-if="isClear && keyWord != ''" @click="_clear"></div>
  </div>
</template>

<script>
  export default {
    name: 'Search',
    props: ['placeholder','isClear'],
    data () {
      return {
        keyWord: '',
        timer: null
      }
    },
    methods: {
      _clear() {
        this.keyWord = '';
        this.$emit('getSearch', this.keyWord)
      },
      _input () {
        !!this.timer && clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$emit('getSearch', this.keyWord)
        }, 500)
      }
    }
  }
</script>

<style lang="less" scoped>
  .search-box {
    width: 100%;
    height: 60px;
    background-color: #EFF1F3;
    border-radius: 30px;

    .search-icon {
      width: 29px;
      height: 29px;
      margin-left: 20px;
      margin-right: 10px;
      background: url('/static/img/icon_search@2x.png') no-repeat center;
      background-size: 29px auto;
    }

    .clear {
      width: 40px;
      height: 40px;
      cursor: pointer;
      color: #ffffff;
      margin-left: 10px;
      background: url('/static/img/icon_close@2x.png') no-repeat center;
      background-size: 40px auto;
    }

    input[type="text"] {
      width: 90%;
      font-size: 30px;
      line-height: 1.5;
      color: #262727;
      background-color: transparent;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      &.hasClear {
        width: 78%;
      }
    }
    input::-webkit-input-placeholder { /* WebKit browsers */
      color: #B6B8B8;
    }

    input:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
      color: #B6B8B8;
    }

    input::-moz-placeholder { /* Mozilla Firefox 19+ */
      color: #B6B8B8;
    }

    input:-ms-input-placeholder { /* Internet Explorer 10+ */
      color: #B6B8B8;
    }
  }
</style>
