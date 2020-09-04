<!--
  时间筛选
-->
<template>
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
        <div class="time-choice-box">
            <div class="time-header flex alignCenter">
                <div class="btn cancel" @click="popupVisible=false">取消</div>
                <div class="title flex_1">时间筛选</div>
                <div class="btn sure" @click="_sure">确定</div>
            </div>
            <div class="time-tab-box border1px" v-if="isShowTab">
                <span v-for="(item,index) in tab_list" :key="index" :class="{'active': tab_key == item.value}" @click="tab_key=item.value">{{item.name}}</span>
            </div>
            <!-- 按学期 -->
            <div class="picker-wrapper" v-if="tab_key == 3">
                <mt-picker ref="picker" :slots="slots_xq" @change="onValuesChangeXnXq"></mt-picker>
            </div>
            <!-- 按月 -->
            <div v-else-if="tab_key == 2">
                <mt-picker ref="pickerMonth" :slots="slots_month" @change="onValuesChangeMonth"></mt-picker>
            </div>
            <!-- 按周 -->
            <div v-else>
                <mt-picker ref="pickerWeek" :slots="slots_week" valueKey="weekTime" @change="onValuesChangeWeek"></mt-picker>
            </div>
        </div>
    </mt-popup>
</template>

<script>
    import { userInfoAPi,WeekApi } from '@/utils/api'
    import formatDate from '@/utils/formatDate/formatDate'
    export default {
        name: "TimeChoice",
        props: {
            isShowTab: {
                type: Boolean,
                default: true
            },
            isGetHttp: { // 引用该组件时是否默认请求数据
                type: Boolean,
                default: true
            },
            weekTime: {
                type: String,
                default: ''
            },
            isWuyi: { //武义职校的学期为春学期和秋学期
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                popupVisible: false,
                tab_key: 3, // 默认按学期
                current_xn: this.$cookie.get('schoolYear'), // 当前学年
                current_xqmc: '', // 当前学期名称
                xnxqValue: [], // 当前选中的学年学期
                xnxqlist: [], // 学年学期列表
                weekValue: [], // 当前选中的周次
                monthValue: [], // 当前选中的月份
                tab_list: [
                    {'name': '按周', 'value': 1},
                    {'name': '按月', 'value': 2},
                    {'name': '按学期', 'value': 3},
                ],
                slots_xq: [
                    {
                        flex: 1,
                        values: [],
                        className: 'slot1',
                        textAlign: 'center'
                    }, {
                        divider: true,
                        content: '-',
                        className: 'slot2'
                    }, {
                        flex: 1,
                        values: [],
                        className: 'slot3',
                        textAlign: 'center'
                    }
                ], // picker（学年学期）
                slots_week: [
                    {
                        flex: 1,
                        values: [],
                        className: 'slot1',
                        textAlign: 'center'
                    }
                ], // picker（本学期的周次）
                slots_month: [
                    {
                        flex: 1,
                        values: [],
                        className: 'slot1',
                        textAlign: 'center'
                    }
                ], // picker（本学期的其他月）
                sj: {
                    gzkssj: '',
                    gzjssj: ''
                }, // 当前学年学期的开始结束时间
                current_sj: {
                    gzkssj: '',
                    gzjssj: ''
                } // 当前选中的学年学期的开始结束时间
            }
        },
        watch: {
            tab_key(nVal) {
                let _target = {
                    '1': ()=> {
                        this.getWeekAll()
                    },
                    '2': ()=> {
                        this._setMonth(this.sj.gzkssj,this.sj.gzjssj);
                    },
                    '3': ()=> {
                        this.getXnxqList();
                    }
                };
                _target[nVal]();
            }
        },
        mounted() {
            if(!this.isGetHttp) return;
            this.getXnxqList()
        },
        activated() {
            if(!this.isGetHttp) return;
            this.tab_key = 3
            this.getXnxqList()
        },
        methods: {
            _show() {
                this.popupVisible = true;
            },
            _hide() {
                this.popupVisible = false;
            },
            /*
            * 获取学年学期列表
            * */
            async getXnxqList() {
                let data = {
                    page: 1,
                    limit: 20,
                    xxdm: this.$cookie.get('xxdm')
                };
                const res = await this.$req.get(userInfoAPi.getXnxqList,data);
                this.slots_xq[0].values = [];
                this.slots_xq[2].values = [];
                if (res.status == 200) {
                    let { rows } = res.data;
                    if(this.isWuyi){
                      rows.map(c=>{
                        this.$set(c,'yxqmc',c.xqmc);
                        this.$set(c,'xqmc',(c.xqmc=='上学期'?'秋学期':'春学期'));
                        this.$set(c,'yxn',c.xn);
                        this.$set(c,'xn',(c.xn.split('-')[c.xq == '02'?1:0]));
                      });
                    }
                    this.xnxqlist = rows;
                    rows.forEach(c => {
                        if(this.slots_xq[0].values.indexOf(c.xn+'学年') == -1) { // 去重学年
                            this.slots_xq[0].values.push(c.xn + '学年');
                        }
                        if(this.slots_xq[2].values.indexOf(c.xqmc) == -1) { // 去重学期
                          this.slots_xq[2].values.push(c.xqmc);                         
                        }
                        if(c.dqxnxq == 1) { // 默认显示当前学年学期
                            this.current_xn = c.xn + '学年';
                            this.current_xqmc = this.isWuyi?(c.xqmc=='上学期'?'秋学期':'春学期'):c.xqmc;
                            this.sj.gzkssj = c.gzkssj;
                            this.sj.gzjssj = c.gzjssj;
                            this._setSlotXnXqValues(0);
                            this._setSlotXnXqValues(1);
                            
                        }
                    });
                }
            },
            /*
            * 设定给定 slot 的默认选中值
               @params index 指定slot索引
            * */
            _setSlotXnXqValues(index) {
                this.$nextTick(() => {
                    this.$refs.picker.setSlotValue(index,index == 0 ? this.current_xn : this.current_xqmc)
                })
            },
            /*
            * 获取选中的学年学期
            * */
            onValuesChangeXnXq(picker, values) {
                let arr = [];
                let temp;
                this.xnxqlist.forEach(c => {
                    if(values[0] == c.xn + '学年') {
                        arr.push(c.xqmc); // 对应学年的学期信息(上学期，下学期)
                    }
                    if(values[0] == c.xn + '学年' && values[1] == c.xqmc) {
                        this.current_sj.gzjssj = c.gzjssj;
                        this.current_sj.gzkssj = c.gzkssj;
                        temp = c;
                    }
                })
                picker.setSlotValues(1,arr)
                if(this.isWuyi && temp){
                  this.xnxqValue = [temp.yxn,values[1]];
                } else {
                  this.xnxqValue = values;
                }                
                this.$cookie.set("startTime",this.current_sj.gzkssj);
                this.$cookie.set("endTime",this.current_sj.gzjssj)
            },
            /*
            * 获取当前学期的周次列表
            * */
            async getWeekAll() {
                let data = {
                    schoolYear: this.current_xn.split('学年')[0],
                    term: this.current_xqmc == '上学期' || this.current_xqmc == '秋学期' ? '01' : '02'
                };
                const res = await this.$req.get(WeekApi.getAll,data);
                if(res.resultCode == 1) {
                    let _data = res.value;
                    this.slots_week[0].values = _data;
                    for(let i = 0;i < _data.length; i++) {
                        if(this.weekTime && this.weekTime == _data[i].weekTime) {
                             this._setSlotWeekValues(0,_data[i])
                             return;
                         }
                         if(_data[i].flag) { // 默认显示当前周
                            this._setSlotWeekValues(0,_data[i])
                         }
                    }
                }
            },
            /*
            * 设定给定 slot 的默认选中值
              @params index 指定slot索引
            * */
            _setSlotWeekValues(index,value) {
                this.$nextTick(() => {
                    this.$refs.pickerWeek.setSlotValue(index,value)
                })
            },
             /*
            * 检查weekTime是否存在，如果存在周次跟随
            * */
            _checkWeekTime() {
                if(this.weekTime) {
                    this.slots_week[0].values.forEach(c => {
                        if(this.weekTime == c.weekTime) {
                            this._setSlotWeekValues(0,c)
                        }
                    })
                }
            },
            /*
            * 获取选中的周次
            * */
            onValuesChangeWeek(picker, values) {
                this.weekValue = values;
            },
            /*
            * 本学期的其他月
              @params gzkssj 本学期的开始时间
              @params gzjssj 本学期的结束时间
            * */
            _setMonth(gzkssj,gzjssj) {
                if(!gzkssj) return;

                //用-分成数组
                var date1 = gzkssj.split("-");
                var date2 = gzjssj.split("-");
                //获取年,月数
                var year1 = parseInt(date1[0]) ,
                month1 = parseInt(date1[1]) ,
                year2 = parseInt(date2[0]) ,
                month2 = parseInt(date2[1]) ,
                //通过年,月差计算月份差
                months = (year2 - year1) * 12 + (month2-month1) + 1;
                let startTime = year1 + '/' + (String(month1).length > 1 ? month1 : '0' + month1) + '/01';//增加日期否则ios生成日期会失败
                // let startTime = year1 + '-' + (month1 > 9 ? month1 : '0' + month1);
                let arr = [];

                for(var i=1;i<=months;i++) {                  
                    // alert(new Date('2019/02'))
                    arr.push(formatDate(new Date(startTime).setMonth((new Date(startTime).getMonth()-1) + i),'yyyy/MM'))
                }
                this.slots_month[0].values = arr;
                this._setSlotMonthValues(0,arr)
            },
            /*
            * 设定给定 slot 的默认选中值
              @params index 指定slot索引
            * */
            _setSlotMonthValues(index,arr) {
                let nowMonth = new Date().getMonth() + 1,
                    nowYear = new Date().getFullYear();
                
                nowMonth = String(nowMonth).length > 1 ? nowMonth : '0' + nowMonth;
                arr.forEach(c => {
                    if(c == nowYear+'/'+nowMonth) {
                        this.$nextTick(() => {
                            this.$refs.pickerMonth.setSlotValue(index,c)
                        })
                    }
                })
                
            },
            /*
            * 获取选中的月份
            * */
            onValuesChangeMonth(picker, values) {
                this.monthValue = values;
            },
            _sure() {
                let _obj = {};
                if(this.tab_key == 3) { // 按学期
                    if(!this.xnxqValue[0]) {
                        this.$toast('请选择学年')
                        return;
                    }
                    if(!this.xnxqValue[1]) {
                        this.$toast('请选择学期')
                        return;
                    }
                    _obj = {
                        type: this.tab_key,
                        xn: this.xnxqValue[0].split('学年')[0],
                        xq: this.xnxqValue[1] == '上学期' || this.xnxqValue[1] == '秋学期' ? '01' : '02',
                        gzjssj: this.current_sj.gzjssj,
                        gzkssj: this.current_sj.gzkssj
                    }
                } else if(this.tab_key == 2) { // 按月
                    if(!this.monthValue[0]) {
                        this.$toast('请选择月份')
                        return;
                    }
                    _obj = {
                        type: this.tab_key,
                        month: this.monthValue[0]
                    }
                } else { // 按周
                    if(!this.weekValue[0]) {
                        this.$toast('请选择周次')
                        return;
                    }
                    _obj = {
                        type: this.tab_key,
                        weekId: this.weekValue[0].weekId,
                        weekTime: this.weekValue[0].weekTime,
                        startTime: this.weekValue[0].startTime,
                        endTime: this.weekValue[0].endTime
                    }
                }
                this.$emit('sure',_obj);
                this._hide();
            }
        }
    }
</script>

<style lang="less" scoped>
    .time-choice-box {
        background-color: #ffffff;
        border-radius: 40px 40px 0 0;
        .time-header {
            height: 98px;
            color: #262627;
            font-size: 36px;
            .btn {
                width: 210px;
                font-size: 32px;
                text-align: center;
            }
            .cancel {
                color: #B6B8B8;
            }
            .sure {
                color: #33A5FF;
            }
            .title {
                font-weight: 600;
                text-align: center;
            }
        }
        .time-tab-box {
            width: 620px;
            margin: 0 auto;
            color: #262727;
            font-size: 28px;
            border-color: #EFF1F3;
            border-radius: 30px;
            span {
                display: inline-block;
                width: 140px;
                height: 60px;
                line-height: 60px;
                text-align: center;
                border-radius: 30px;
                &.active {
                    background-color: #33A5FF;
                    color: #ffffff;
                }
            }
            span:nth-child(1),
            span:nth-child(2) {
                margin-right: 100px
            }
        }
    }
</style>