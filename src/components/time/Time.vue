<template>
  <div>
    <div class="time-box flex alignCenter">
      <i class="mintui mintui-back icon icon-left" :style="iconStyle" @click="pre"></i>
      <div class="flex_1 time text-overflow" :style="timeStyle" @click="_showModal">{{timeWB}}</div>
      <i class="mintui mintui-back icon icon-right" :style="iconStyle" @click="next"></i>
    </div>

    <mt-datetime-picker
      ref="picker"
      v-model="dateVal"
      type="date"
      year-format="{value} 年"
      month-format="{value} 月"
      v-roll:visible=pVisible
      @visible-change="handleVisibleChange"
      @confirm="handleConfirm"
    ></mt-datetime-picker>

    <time-choice ref="timeChoice" :isShowTab="false" :isGetHttp="false" :weekTime="timeWB" @sure="sure"></time-choice>
  </div>
</template>

<script>
  import {WeekApi,userInfoAPi} from '@/utils/api'

  import formatDate from '@/utils/formatDate/formatDate'

  import TimeChoice from '../timeChoice/timeChoice.vue'

  export default {
    name: "Time",
    props: {
      iconStyle: {
        type: Object,
        default: () => ({
          'color': '#C7C7CC'
        })
      },
      timeStyle: {
        type: Object,
        default: () => ({
          'color': '#262627'
        })
      },
      weekId: {
        default: ''
      }
    },
    components: {
      TimeChoice
    },
    data() {
      return {
        schoolYear: this.$cookie.get('schoolYear'),
        term: this.$cookie.get('term'),
        type: 0, // 默认按周（1，按周，2，按月,'term',按学期）
        timeWB: '', // 时间文本信息
        dateVal: '', // 默认是当前日期
        pVisible: false,
        nowMonth: new Date().getMonth()+1, // 当前月
        nowYear: new Date().getFullYear(), // 当前年
        weekKey: 0, // 当前显示第几周
        weekList: [], // 周次列表
        xqList: [],  // 学期列表
        xqKey: 0 // 当前学期
      }
    },
    watch: {
      type(nVal) {
        if (nVal == 1) {
          this.getWeekAll()
        } else if(nVal == 2) {
          this.getNowMonth()
        } else {
          this.getXnxqList()
        }
      }
    },
    methods: {
      async getWeekAll() {
        let data = {
          schoolYear: this.schoolYear,
          term: this.term
        };
        const res = await this.$req.get(WeekApi.getAll,data);

        if (res.resultCode == 1) {
          if(res.value && res.value.length == 0) {
            this.timeWB = '还没有设置周次信息'
            return
          };

          this.weekList = res.value;
          let _data = res.value;
          for(let i=0;i<_data.length;i++){
            // 判断当前是否有选中周次
            if(this.weekId && this.weekId == _data[i].weekId) {
              this.weekKey = i;
              this.timeWB = _data[i].weekTime;
              this.$emit('getTimeWB',_data[i])
              return;
            }
            // 当前周
            if(_data[i].flag) {
              this.weekKey = i;
              this.timeWB = _data[i].weekTime;
              this.$emit('getTimeWB',_data[i])
              return;
            }
          }

          this.weekKey = 0;
          this.timeWB = _data[0].weekTime;
          this.$emit('getTimeWB',_data[this.weekKey])
        }
      },
      /*
      * 获取当前学年学期
      **/
      async getXnxqList() {
        let data = {
          page: 1,
          limit: 100,
          xxdm: this.$cookie.get('xxdm')
        };
        const res = await this.$req.get(userInfoAPi.getCurrentXnxq,data);

        if (res.status == 200) {
          if(!res.data) {
            this.timeWB = '还没有设置学年学期';
            return;
          }
          let _data = res.data;
          if(_data.xq == '01') { // 上学期
            this.xqKey = 0;
            this.xqList.concat(_data);
          } else { // 下学期
            this.xqKey = 1;
            this.xqList = [
              {
                xn:_data.xn,
                xqmc: '上学期',
                xq: '01'
              },
              {
                xn:_data.xn,
                xqmc: '下学期',
                xq: '02'
              }
            ]
          }

          this.timeWB =  `(${_data.xn})${_data.xqmc}`;
          this.$emit('getTimeWB',_data);
        }
      },
      /*
      * 显示选择周或者月
      **/
      _showModal() {
        if(this.type == 1) { // 按周
          this.$refs.timeChoice.tab_key = 1;
          this.$refs.timeChoice._show();
          this.$refs.timeChoice._checkWeekTime()
        } else if (this.type == 2) { // 按月
          // 如果已经选过日期，则再次打开时间选择器时，日期回显（不需要回显的话可以去掉 这个判断）
          if (!this.dateVal) {
            this.dateVal = new Date()
          }
          this.openPicker()
        }
      },

      /*
      * 取月份的最后一天
      **/
      getCurrentMonthLast(time) {
        var date = new Date(time);
        var currentMonth = date.getMonth();
        var nextMonth = ++currentMonth;
        var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
        var oneDay = 1000 * 60 * 60 * 24;
        return new Date(nextMonthFirstDay - oneDay);
      },
      getNowMonth() {
        this.nowMonth = String(this.nowMonth).length > 1 ? this.nowMonth : '0'+this.nowMonth;
        this.timeWB = this.nowYear+'-'+this.nowMonth;
        let end = this.getCurrentMonthLast(new Date(this.timeWB).getTime());
        let endTime = formatDate(new Date(end).getTime(),'yyyy-MM-dd');
        let data = {
          startTime: this.timeWB + '-01',
          endTime: endTime,
          weekId: this.timeWB + '-01'
        };
        this.$emit('getTimeWB',data)
      },
      /*
      * 下一月和上一个月的切换
         @param type 1上一月 2下一月
      **/
      changeMonth(type) {
        let ss = new Date(this.timeWB);
        let year = ss.getFullYear();
        let month = ss.getMonth()+1;
        if(type == 1) {
          year = month == 1 ? year - 1 : year;
          month = month > 1 ? month - 1 : 12;
        } else {
          year = month == 12 ? year + 1 : year;
          month = month < 12 ? month + 1 : 1;
        }
        month = String(month).length > 1 ? month : '0' + month;
        this.timeWB = year + '-' + month;
        let end = this.getCurrentMonthLast(new Date(this.timeWB).getTime());
        let endTime = formatDate(new Date(end).getTime(),'yyyy-MM-dd');
        let data = {
          startTime: this.timeWB + '-01',
          endTime: endTime,
          weekId: this.timeWB + '-01'
        };
        this.dateVal = new Date(this.timeWB)
        this.$emit('getTimeWB',data)
      },
      pre() {
        if (this.type == 1) { // 按周
          if (this.weekList.length <= 1) return;
          if(this.weekKey == 0) {
            this.$toast("已经是第一周了哦");
            return;
          }
          this.weekKey = this.weekKey - 1;
          this.timeWB = this.weekList[this.weekKey].weekTime;
          this.$emit('getTimeWB',this.weekList[this.weekKey])
        } else if(this.type == 2){ // 按月
          this.changeMonth(1) 
        } else { // 按学期
          if (this.xqList.length <= 1) return;
          if(this.xqKey == 0) {
            this.$toast("已经是第一条了哦");
            return;
          }
          this.xqKey = this.xqKey - 1;
          this.timeWB = `(${this.xqList[this.xqKey].xn})${this.xqList[this.xqKey].xqmc}`;
          this.$emit('getTimeWB',this.xqList[this.xqKey]);
        }
      },
      next() {
        if (this.type == 1) { // 按周
          if (this.weekList.length <= 1) return;
          if(this.weekKey == this.weekList.length - 1) {
            this.$toast("已经是最后一周了哦");
            return;
          }
          this.weekKey = this.weekKey + 1;
          this.timeWB = this.weekList[this.weekKey].weekTime;
          this.$emit('getTimeWB',this.weekList[this.weekKey])
        } else if(this.type == 2){ // 按月
          this.changeMonth(2) 
        } else { // 按学期
          if (this.xqList.length <= 1) return;
          if(this.xqKey == this.xqList.length - 1) {
            this.$toast("已经是最后一条了哦");
            return;
          }
          this.xqKey = this.xqKey + 1;
          this.timeWB = `(${this.xqList[this.xqKey].xn})${this.xqList[this.xqKey].xqmc}`;
          this.$emit('getTimeWB',this.xqList[this.xqKey])
        }
      },
      openPicker() {
        this.$refs.picker.open();
        let a = document.getElementsByClassName('picker-slot');
        // 只显示年，月
        for(let i=0;i<a.length;i++){
          if (i == 2) {
            a[i].style.display = 'none';
          }
        }
      },
      handleVisibleChange(val) {
        this.pVisible = val;
      },
      handleConfirm() {
        let time = formatDate(new Date(this.dateVal).getTime(),'yyyy-MM');
        let end = this.getCurrentMonthLast(new Date(time).getTime());
        let endTime = formatDate(new Date(end).getTime(),'yyyy-MM-dd');
        this.timeWB = time;
        let data = {
          startTime: this.timeWB + '-01',
          endTime: endTime,
          weekId: this.timeWB + '-01'
        };
        this.$emit('getTimeWB',data)
      },
      sure(data) {
        if(this.type == 1) {
          this.weekList.forEach((c,i) => {
            if(c.weekTime == data.weekTime) {
              this.weekKey = i;
            }
          })
          this.timeWB = data.weekTime;
          this.$emit('getTimeWB',data)
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .time-box {
    height: 76px;
    .icon {
      display: inline-block;
      width: 80px;
      height: 100%;
      line-height: 76px;
      text-align: center;
      font-size: 30px;
    }
    .icon-right {
      transform: rotate(-180deg);
    }
    .time {
      font-size: 30px;
      text-align: center;
    }
  }
</style>
