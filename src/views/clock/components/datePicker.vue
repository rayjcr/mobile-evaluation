<template>
  <div>
    <van-popup v-model="$parent.showPicker" position="bottom" @click-overlay="pickerClose">
      <div class="toolbar flex justifySpaceBetween">
        <span class="btn-close" @click="pickerClose">取消</span>
        <span class="toolbar-title">选择时间</span>
        <span class="btn-sure" @click="handlerSure">确定</span>
      </div>
      <!-- 提示栏 -->
      <div class="tips-bar" v-if="message">{{message}}</div>
      <!-- 自定义选择 -->
      <div class="picker-type" v-if="isCustom">
        <div class="btn-type" @click="changePickerType">{{dateType === 0 ? '按日选择':'按月选择'}}<i class="icon-change"></i></div>
        <div class="date-bar flex justifySpaceBetween" v-if="dateType === 0">
          <span class="date-start" :class="{'date-checked': checkedDateType == 'start'}" @click="changeDateType('start')">{{dateStart}}</span>至<span class="date-end" :class="{'date-checked': checkedDateType == 'end'}" @click="changeDateType('end')">{{dateEnd}}</span>
        </div>
        <div class="date-bar flex justifySpaceBetween" v-else>
          <span class="date-start date-checked long-size">{{dateMonth}}</span>
        </div>
        <div class="date-now flex justifyFlexEnd"><span class="btn-now" @click="handlerDateNow">{{dateType === 0 ?'今天':'本月'}}</span></div>
      </div>
      <!-- 选择器 日期 -->
      <van-datetime-picker
        v-if="type == 'date'"
        v-model="pickerDate"
        :type="dateType === 0 ? 'date' : 'year-month'"
        :max-date="maxDate"
        :min-date="minDate == '9' ?MinDate9Month:MinDate18Month"
        :show-toolbar="false"
        :formatter="formatter"
        :swipe-duration="350"
        @change="changeDatePicker"
        ref="datepicker"
      />
      <!-- 选择器 星期 -->
      <van-picker :columns="weekColumns" @change="changeWeek" :default-index="weekIndex" :swipe-duration="350"  v-if="type == 'week'" ref="weekpicker"/>

    </van-popup>
  </div>
</template>

<script>
  import formatDate from '@/utils/formatDate/formatDate'
  /** 
   * 需要父级中包含showPicker 属性，父级可以通过改变 showPicker 为 true 来显示该选择器组件 
   * 调用 sure 事件来获取用户选择的信息
   */
  export default {
    name: 'datePicker',
    data() {
      let nowDate = new Date()
      return {
        myType: 'week',
        pickerDate: nowDate, // 当前选择器默认日期
        maxDate: nowDate, // 最大日期
        MinDate9Month: null, // 最小日期
        MinDate18Month: null, // 最小日期
        dateType: null, 
        dateStart: formatDate(nowDate,'yyyy-MM-dd'), // 按日 开始日期
        dateEnd: formatDate(nowDate,'yyyy-MM-dd'), // 按日 结束日期
        checkedDate: '', // 选择器滚动选择的日期
        checkedDateType: 'start', // 按日 当前选择器表示的日期，开始日期 or 结束日期
        dateMonth: formatDate(nowDate,'yyyy-MM'), // 按月 日期

        weekColumns: ['星期日','星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        currentWeek: 0,
        weekIndex: 0,
      }
    },
    props: {
      type:{ // 类型 week-星期，date-日期
        type: String,
        required: true
      },
      isCustom: { // 自定义日期选择
        type: Boolean,
      },
      message: { // 消息
        type: String
      },
      minDate: { // 最小日期，9-当前学年 18-18个月
        type: String
      },
      pickerType: { // 1-按月，0-按日
        type: Number,
        default: 1,
      },
      currentDate: { // 选中的数据
        type: String,
      }
    },
    watch: {
      currentDate(newVal) {
        if(newVal) {
          this.getDate()
        }
      },
      pickerType(newVal) {
        if(newVal) {
          this.dateType = this.pickerType
        }
      }
    },
    mounted() {
      
      this.getInit()
      
    },
    methods: {
      getInit() {
        let nowDate = new Date()
        this.dateType = this.pickerType
        this.MinDate9Month = (nowDate.getMonth()+1) < 9 ? new Date((nowDate.getFullYear()-1)+'/9'+'/1') : new Date(nowDate.getFullYear()+'/9'+'/1')
        this.MinDate18Month = (12+(nowDate.getMonth()+1 - 18)) > 0 ? new Date((nowDate.getFullYear() -1) +'/'+ (12+(nowDate.getMonth()+1 - 18)+'/1')): new Date((nowDate.getFullYear() -2) +'/'+ (12-(Math.abs(12+(nowDate.getMonth()+1 - 18)))+'/'+(nowDate.getDate()+1)))
        this.getDate()
      },
      getDate() {
        if(this.type == 'week') {
          this.weekIndex = this.weekColumns.indexOf(this.currentDate)
        }else {
          if(this.pickerType === 0) {
            if(this.isCustom) {
              this.dateType = this.pickerType
              this.dateStart = this.currentDate.split('~')[0]
              this.dateEnd = this.currentDate.split('~')[1]
              this.pickerDate = new Date(this.dateStart.replace(/\./g,'/'))
            }else {
              this.pickerDate = new Date(this.currentDate.replace(/\./g,'/'))
            }
          }else {
            this.pickerDate = new Date(this.currentDate.replace(/\./g,'/')+'/'+new Date().getDate())
          }
        }
        
      },
      /**
       * 确定按钮
       */
      handlerSure() {
        if(this.type == 'week') {
          // this.$refs.weekpicker.$children[0].getPicker().confirm()
          this.$emit('sure',this.currentWeek)
        }else {
          if(this.isCustom) { // 自定义
            if(this.dateType === 0) { //按日
              let date1 = new Date(this.dateStart.replace(/\./g, '/')).getTime()
              let date2 = new Date(this.dateEnd.replace(/\./g, '/')).getTime()
              if(date1 > date2) {
                this.$emit('sure',this.dateEnd.replace(/\./g, '/'),this.dateStart.replace(/\./g, '/'))
              }else {
                this.$emit('sure',this.dateStart.replace(/\./g, '/'),this.dateEnd.replace(/\./g, '/'))
              }
              
            }else {
              if(!this.checkedDate) {
                this.dateMonth = this.currentDate
              }
              this.$emit('sure',this.dateMonth.replace(/\./g, '/'))
            }
          }else {
            if(!this.checkedDate) {
              this.checkedDate = this.currentDate
            }
            this.$emit('sure',this.checkedDate.replace(/\./g, '-'))
          }
        }
        this.pickerClose()
        
      },
      changeWeek(ins,value,index) {
        this.currentWeek = index
      },
      /**
       * 关闭选择器
       */
      pickerClose() {
        this.$parent.showPicker = false
      },
      /**
       * 滚动选择器改变日期
       */
      changeDatePicker(pickerInstance) {
        this.checkedDate = pickerInstance.getValues().join().replace('年','').replace('月', '').replace('日', '').replace(/\,/g,'.')
        if(this.dateType === 0) {
          if(this.checkedDateType == 'start') {
            this.dateStart = this.checkedDate
          }else {
            this.dateEnd = this.checkedDate
          }
        }else {
          this.dateMonth = this.checkedDate
          
        }
        
      },
      /**
       * 改变选择器类型  0-按日 1-按月
       */
      changePickerType() {
        this.dateType = this.dateType === 0 ? 1 : 0
        if(this.dateType === 0) {
          if(this.checkedDateType == 'start') {
            this.pickerDate = new Date(this.dateStart.replace(/\./g,'/'))
          }else {
            this.pickerDate = new Date(this.dateEnd.replace(/\./g,'/'))
          }
        }else {
          this.pickerDate = new Date(this.dateMonth.replace(/\./g,'/')+'/'+new Date().getDate())
        }
      },
      /**
       * 改变当前调整的日期为开始日期还是结束日期
       */
      changeDateType(type) {
        this.checkedDateType = type == 'start' ? 'start' : 'end'
        this.pickerDate = type == 'start' ? new Date(this.dateStart.replace(/\./g,'/')): new Date(this.dateEnd.replace(/\./g,'/'))
      },
      /**
       * 获得今天的日期
       */
      handlerDateNow() {
        if(this.dateType === 0) {
          if(this.checkedDateType == 'start') {
            this.dateStart = formatDate(new Date(),'yyyy-MM-dd')
          }else {
            this.dateEnd = formatDate(new Date(),'yyyy-MM-dd')
          }
          this.pickerDate = new Date()
        }else {
          this.dateMonth = formatDate(new Date(),'yyyy-MM')
          this.pickerDate = new Date()
        }
        
      },
      /**
       * 时间选择器显示格式化
       */
      formatter(type, value) {
        if (type === 'year') {
          return `${value}年`;
        } else if (type === 'month') {
          return `${value}月`
        } else if (type === 'day') {
          return `${value}日`
        }
        return value;
      }
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
  height: 60px;
  line-height: 60px;
  background:rgba(250, 181, 7, 0.986);
  color: #FF7B12;
  font-size: 24px;
}
.picker-type{
  padding: 10px 16px;
  width: 100%;
  box-sizing: border-box;
  .btn-type{
    display: inline-block;
    padding: 3px 10px;
    font-size: 24px;
    border-width: 1.5px;
    border-style: solid;
    border-color: rgba(51,51,51,0.4);
    border-radius:4px;
    .icon-change{
      margin-left: 5px;
      display: inline-block;
      width: 10px;
      height: 8px;
      background-image: url('~@/assets/img/icon_change.png');
      background-size: contain;
      background-repeat: no-repeat;
    }
  }
  .date-bar{
    margin-top: 10px;
    width: 100%;
    height: 60px;
    line-height: 60px;
    font-size: 24px;
    text-align: center;
    .date-start, .date-end{
      display: inline-block;
      width:160px;
      height:56px;
      font-size: 28px;
      border:1.5px solid rgba(125,127,128,0.5);
      border-radius:4px;
    }
    .long-size{
      width: 100%;
    }
    .date-checked{
      background:rgba(0,205,134,0.05);
      border:1.5px solid rgba(0,205,134,0.5);
      color:#00cd86;
    }
  }
  .date-now{
    margin-top: 10px;
    width: 100%;
    .btn-now{
      display: inline-block;
      width:88px;
      height:48px;
      line-height: 48px;
      font-size: 24px;
      border:1.5px solid rgba(51,51,51,0.4);
      text-align: center;
      border-radius:4px;
    }
  }
}

</style>
<style>
.van-picker-column{
  font-size: 36px !important;
} 
</style>