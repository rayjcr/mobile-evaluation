<template>
  <div>
    <van-popup v-model="$parent.showTimePicker" position="bottom" @click-overlay="pickerClose">
      <div class="toolbar flex justifySpaceBetween">
        <span class="btn-close" @click="pickerClose">取消</span>
        <span class="btn-sure" @click="handlerSure">确定</span>
      </div>

      <van-picker ref="timepicker" :columns="timeQuantum" @change="onChange" :default-index="showIndex" :swipe-duration="350"/>

    </van-popup>
  </div>
</template>

<script>
  export default {
    name: 'classPicker',
    data() {
      return {
        STATE_LIST: [],
        checkedDate: '',
        showIndex: 0,
        timeId:null,
      }
    },
    props: {
      current: {
        type: String
      },
      list: {
        type: Array
      },
      timeQuantum: {
        type: Array
      }
    },
    watch: {
      current(newVal) {
        if(newVal) {
          this.showIndex = this.timeQuantum.indexOf(newVal)
          
        }else {
          this.showIndex = 0
        }
      },
      timeQuantum(newVal) {
        if(newVal) {
          this.showIndex = this.timeQuantum.indexOf(this.current)
        }
      }
    },
    mounted() {
      this.showIndex = this.current ? this.timeQuantum.indexOf(this.current):0
    },
    methods: {
      onChange(picker, values) {
        this.checkedDate = values
      },
      /**
       * 确定按钮
       */
      handlerSure() {
        this.$refs.timepicker.confirm()
        this.$emit('sure',this.checkedDate?this.checkedDate:this.current)
        this.pickerClose()
      },
      /**
       * 关闭选择器
       */
      pickerClose() {
        this.$parent.showTimePicker = false
      },
    }
  }
</script>

<style lang="less" scoped>
.van-popup{
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.toolbar{
  width: 100%;
  .btn-close, .btn-sure, .toolbar-title{
    display: inline-block;
    padding: 12px 45px;
    font-size: 32px;
  }
  .btn-sure{
    color: #00cd86;
  }
  .toolbar-title{
    font-size: 36px;
  }
}
.tips-bar{
  box-sizing: border-box;
  width: 100%;
  padding: 0 45px;
  height: 72px;
  line-height: 72px;
  background:rgba(250, 181, 7, 0.986);
  color: #FF7B12;
  font-size: 24px;
}
</style>