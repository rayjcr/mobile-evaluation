/*
    日历 移动端组件
*/
<template>
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
        <div class="date-time" @touchmove.stop>
            <div class="date-time-box">
                <div class="btns">
                    <div class="close" @click="close">取消</div>
                    <div class="change" @click="sub">确定</div>
                </div>
                <div class="list-box flex">
                    <div class="item flex_1">
                        <ul class="list"
                            :style="yearStyle"
                            @touchstart="touchStart($event,'year')"
                            @touchmove="touchMove($event,'year')"
                            @touchend="touchEnd($event,'year')"
                        >
                            <li class="li_item" 
                                :class="{'z-active': item == currentDate.year}"
                                :id="item == currentDate.year ? 'yearActive' : ''"
                                v-for="(item,index) in yearList"
                                :key="index"
                            >{{item}}</li>
                        </ul>
                    </div>
                    <div class="item flex_1">
                        <ul class="list"
                            :style="monthStyle"
                            @touchstart="touchStart($event,'month')"
                            @touchmove="touchMove($event,'month')"
                            @touchend="touchEnd($event,'month')"
                        >
                            <li class="li_item" 
                                :class="{'z-active': item == currentDate.month}"
                                v-for="(item,index) in monthList"
                                :key="index"
                            >{{item}}</li>
                        </ul>
                    </div>
                    <div class="item flex_1">
                        <ul class="list"
                            :style="dateStyle"
                            @touchstart="touchStart($event,'date')"
                            @touchmove="touchMove($event,'date')"
                            @touchend="touchEnd($event,'date')"
                        >
                            <li class="li_item" 
                                :class="{'z-active': item == currentDate.date}"
                                v-for="(item,index) in dateList"
                                :key="index"
                            >{{item}}</li>
                        </ul>
                    </div>
                    <div class="item flex_1" v-if="type == 'datetime'">
                        <ul class="list"
                            :style="hourStyle"
                            @touchstart="touchStart($event,'hour')"
                            @touchmove="touchMove($event,'hour')"
                            @touchend="touchEnd($event,'hour')"
                        >
                            <li class="li_item" 
                                :class="{'z-active': item == currentDate.hour}"
                                v-for="(item,index) in hourList"
                                :key="index"
                            >{{item}}</li>
                        </ul>
                    </div>
                    <div class="item flex_1" v-if="type == 'datetime'">
                        <ul class="list"
                            :style="minuteStyle"
                            @touchstart="touchStart($event,'minute')"
                            @touchmove="touchMove($event,'minute')"
                            @touchend="touchEnd($event,'minute')"
                        >
                            <li class="li_item" 
                                :class="{'z-active': item == currentDate.minute}"
                                v-for="(item,index) in minuteList"
                                :key="index"
                            >{{item}}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </mt-popup>
</template>

<script>
    export default {
        name: 'dateTime',
        props: {
            startDate: {
                type: Date,
                default() {
                    return new Date(new Date().getFullYear() - 10, 0, 1);
                }
            },
            endDate: {
                type: Date,
                default() {
                    return new Date(new Date().getFullYear() + 10, 11, 31);
                }
            },
            value: { // 默认显示的日期
                default: ''
            },
            type: {
                type: String,
                default: 'date' // date显示年，月，日 datetime显示年，月，日，时，分 ps: (可自己扩展)
            }
        },
        data() {
            return {
                popupVisible: false,
                yearStyle: {
                   transform: 'translate3d(0px,0px,0px)'
                },
                monthStyle: {
                    transform: 'translate3d(0px,0px,0px)'
                },
                dateStyle: {
                    transform: 'translate3d(0px,0px,0px)'
                },
                hourStyle: {
                    transform: 'translate3d(0px,0px,0px)'
                },
                minuteStyle: {
                    transform: 'translate3d(0px,0px,0px)'
                },
                dateArr: [],
                currentValue: null,
                currentDate: {
                    year: '',
                    month: '',
                    date: '',
                    hour: '',
                    minute: '',
                },
                pageY: 0,
                translateY: 0,
                liHeight: 40,
            }
        },
        methods: {
            close() {
              this.popupVisible = false;  
            },

            open() {
              this.popupVisible = true;  
            },

            isLeapYear(year) {
                return (year % 400 === 0) || (year % 100 !== 0 && year % 4 === 0);
            },

            isShortMonth(month) {
                return [4, 6, 9, 11].indexOf(month) > -1;
            },

            getMonthEndDay(year, month) {
                if (this.isShortMonth(month)) {
                    return 30;
                } else if (month === 2) {
                    return this.isLeapYear(year) ? 29 : 28;
                } else {
                    return 31;
                }
            },

            isDateString(str) {
                return /\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/.test(str);
            },

            getYear(value) {
                return this.isDateString(value) ? value.split(' ')[0].split(/-|\/|\./)[0] : value.getFullYear();
            },

            getMonth(value) {
                return this.isDateString(value) ? value.split(' ')[0].split(/-|\/|\./)[1] : value.getMonth() + 1;
            },

            getDate(value) {
                return this.isDateString(value) ? value.split(' ')[0].split(/-|\/|\./)[2] : value.getDate();
            },

            setDate(val,date) {
                let arr = [];
                let monthEndDay = 31;
                monthEndDay = this.getMonthEndDay(this.getYear(val), parseInt(this.getMonth(val)));
                this.rims.date[1] = monthEndDay;
                for(let i = 1;i <= monthEndDay;i++){
                    if(i < 10) {
                        arr.push('0' + i);   
                    } else {
                        arr.push(i);
                    } 
                }
                
                this.dateArr = arr;

                if(monthEndDay < date) {
                    this.currentDate.date = arr[0];

                    this.autoScroll('date');
                }
            },

            touchStart(e,type) {
                e.preventDefault();
                this.pageY = e.targetTouches[0].pageY;
                switch (type){
                    case 'year':
                        this.translateY = parseInt(this.yearStyle.transform.slice(this.yearStyle.transform.indexOf(',') + 1, this.yearStyle.transform.lastIndexOf(',')));
                        break;
                    case 'month':
                        this.translateY = parseInt(this.monthStyle.transform.slice(this.monthStyle.transform.indexOf(',') + 1, this.monthStyle.transform.lastIndexOf(',')));
                        break;
                    case 'date':
                        this.translateY = parseInt(this.dateStyle.transform.slice(this.dateStyle.transform.indexOf(',') + 1, this.dateStyle.transform.lastIndexOf(',')));
                        break;
                    case 'hour':
                        this.translateY = parseInt(this.hourStyle.transform.slice(this.hourStyle.transform.indexOf(',') + 1, this.hourStyle.transform.lastIndexOf(',')));
                        break;
                    case 'minute':
                        this.translateY = parseInt(this.minuteStyle.transform.slice(this.minuteStyle.transform.indexOf(',') + 1, this.minuteStyle.transform.lastIndexOf(',')));
                        break;
                    default:
                        break;
                }
            },

            touchMove(e,type){
                e.preventDefault();
                let y = e.targetTouches[0].pageY - this.pageY;
                this.pageY = e.targetTouches[0].pageY;
                this.translateY = y+this.translateY;
                switch (type){
                    case 'year':
                        this.yearStyle.transform = `translate3d(0px,${this.translateY}px,0px)`;
                        break;
                    case 'month':
                        this.monthStyle.transform = `translate3d(0px,${this.translateY}px,0px)`;
                        break;
                    case 'date':
                        this.dateStyle.transform = `translate3d(0px,${this.translateY}px,0px)`;
                        break;
                    case 'hour':
                        this.hourStyle.transform = `translate3d(0px,${this.translateY}px,0px)`;
                        break;
                    case 'minute':
                        this.minuteStyle.transform = `translate3d(0px,${this.translateY}px,0px)`;
                        break;
                    default:
                        break;
                }
            },
            touchEnd(e,type){
                e.preventDefault();
                let y = 0;
                let max = 0;
                let liHeight = this.liHeight;

                if(this.translateY%liHeight>0.5){
                    y = parseInt(this.translateY/liHeight + 1)*liHeight;
                }else{
                    y = parseInt(this.translateY/liHeight)*liHeight;
                }
                
                switch (type){
                    case 'year':
                        max = -(this.yearList.length-1)*liHeight;
                        y = y > 0 ? 0 : y < max ? max : y;
                        this.currentDate.year = this.yearList[-parseInt(y/liHeight)] ? this.yearList[-parseInt(y/liHeight)] : '';
                        this.yearStyle.transform = `translate3d(0px,${y}px,0px)`;
                        break;
                    case 'month':
                        max = -(this.monthList.length-1)*liHeight;
                        y = y > 0 ? 0 : y < max ? max : y;
                        this.currentDate.month = this.monthList[-parseInt(y/liHeight)] ? this.monthList[-parseInt(y/liHeight)] : '';
                        this.monthStyle.transform = `translate3d(0px,${y}px,0px)`;
                        this.setDate(`${this.currentDate.year}-${this.currentDate.month}-01`,this.currentDate.date);
                        break;
                    case 'date':
                        max = -(this.dateList.length-1)*liHeight;
                        y = y > 0 ? 0 : y < max ? max : y;
                        this.currentDate.date = this.dateList[-parseInt(y/liHeight)] ? this.dateList[-parseInt(y/liHeight)] : '';
                        this.dateStyle.transform = `translate3d(0px,${y}px,0px)`;
                        break;
                    case 'hour':
                        max = -(this.hourList.length-1)*liHeight;
                        y = y > 0 ? 0 : y < max ? max : y;
                        this.currentDate.hour = this.hourList[-parseInt(y/liHeight)] ? this.hourList[-parseInt(y/liHeight)] : '';
                        this.hourStyle.transform = `translate3d(0px,${y}px,0px)`;
                        break;
                    case 'minute':
                        max = -(this.minuteList.length-1)*liHeight;
                        y = y > 0 ? 0 : y < max ? max : y;
                        this.currentDate.minute = this.minuteList[-parseInt(y/liHeight)] ? this.minuteList[-parseInt(y/liHeight)] : '';
                        this.minuteStyle.transform = `translate3d(0px,${y}px,0px)`;
                        break;
                    default:
                        break;
                }
            },

            autoScroll(type) {
                let y = 0;
                let liHeight = this.liHeight;
                switch (type){
                    case 'year':
                        for(let i=0;i<this.yearList.length;i++){
                            if(this.yearList[i] == this.currentDate.year){
                                y = -(i*liHeight)
                            }
                        }
                        this.yearStyle.transform = `translate3d(0px,${y}px,0px)`;
                        break;
                    case 'month':
                        for(let i=0;i<this.monthList.length;i++){
                            if(this.monthList[i] == this.currentDate.month){
                                y = -(i*liHeight)
                            }
                        }
                        this.monthStyle.transform = `translate3d(0px,${y}px,0px)`;
                        break;
                    case 'date':
                        for(let i=0;i<this.dateList.length;i++){
                            if(this.dateList[i] == this.currentDate.date){
                                y = -(i*liHeight)
                            }
                        }
                        this.dateStyle.transform = `translate3d(0px,${y}px,0px)`;
                        break;
                    case 'hour':
                        for(let i=0;i<this.hourList.length;i++){
                            if(this.hourList[i] == this.currentDate.hour){
                                y = -(i*liHeight)
                            }
                        }
                        this.hourStyle.transform = `translate3d(0px,${y}px,0px)`;
                        break;
                    case 'minute':
                        for(let i=0;i<this.minuteList.length;i++){
                            if(this.minuteList[i] == this.currentDate.minute){
                                y = -(i*liHeight)
                            }
                        }
                        this.minuteStyle.transform = `translate3d(0px,${y}px,0px)`;
                        break;
                    default:
                        break;
                }
            },

            sub() {
                let { year, month, date, hour, minute } = this.currentDate;

                month = month.toString().length == 1 ? '0' + month : month;
                date = date.toString().length == 1 ? '0' + date : date;
                hour = hour.toString().length == 1 ? '0' + hour : hour;
                minute = minute.toString().length == 1 ? '0' + minute : minute;

                let time = `${year}-${month}-${date}`;
                if(this.type == 'datetime') {
                    time += ` ${hour}:${minute}`;
                }
                this.$emit('sure',time)
                console.log(time)
            }
        },
        computed: {
            rims() {
                if (!this.currentValue) return { year: [], month: [], date: [], hour: [], minute: [] };
                let result;
                result = {
                    year: [this.startDate.getFullYear(), this.endDate.getFullYear()],
                    month: [1, 12],
                    date: [1, this.getMonthEndDay(this.getYear(this.currentValue), parseInt(this.getMonth(this.currentValue)))],
                    hour: [0,23],
                    minute: [0,59]
                };
                return result;
            },
            yearList() {
                let arr = [];
                for(let i = this.rims.year[0];i <= this.rims.year[1];i++){
                    arr.push(i);   
                }
                return arr;
            },
            monthList() {
                let arr = [];
                for(let i = this.rims.month[0];i <= this.rims.month[1];i++){
                    if(i < 10) {
                        arr.push('0' + i);   
                    } else {
                        arr.push(i);
                    }
                }
                return arr;
            },
            dateList() {
                let arr = [];
                for(let i = this.rims.date[0];i <= this.rims.date[1];i++){
                    if(i < 10) {
                        arr.push('0' + i);   
                    } else {
                        arr.push(i);
                    } 
                }
                this.dateArr = arr;
                return this.dateArr;
            },
            hourList() {
                let arr = [];
                for(let i = this.rims.hour[0];i <= this.rims.hour[1];i++){
                    if(i < 10) {
                        arr.push('0' + i);   
                    } else {
                        arr.push(i);
                    } 
                }
                return arr;
            },
            minuteList() {
                let arr = [];
                for(let i = this.rims.minute[0];i <= this.rims.minute[1];i++){
                    if(i < 10) {
                        arr.push('0' + i);   
                    } else {
                        arr.push(i);
                    } 
                }
                return arr;
            },
        },
        watch: {
            currentValue(nVal) {
                let year = new Date(nVal).getFullYear(),
                month = new Date(nVal).getMonth() + 1,
                date = new Date(nVal).getDate(),
                hour = new Date(nVal).getHours(),
                minute = new Date(nVal).getMinutes();

                this.currentDate.year = year;
                this.currentDate.month = month;
                this.currentDate.date = date;
                this.currentDate.hour = hour;
                this.currentDate.minute = minute;
            },
            popupVisible(nVal) {
                if(nVal) {
                    this.$nextTick(() => {
                        let height = document.getElementById('yearActive').offsetHeight
                        this.liHeight = height;
                        this.autoScroll('year');
                        this.autoScroll('month');
                        this.autoScroll('date');
                        if(this.type == 'datetime') {
                            this.autoScroll('hour');
                            this.autoScroll('minute');
                        }
                    })
                }
            }

        },
        mounted() {
            this.currentValue = this.value;

            if(!this.value) {
                this.currentValue = this.startDate;
            }
        }
    }
</script>

<style lang="less" scoped>
    .date-time {
        position: relative;
        width: 100%;

        .date-time-box {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #F7F7F7;

            .btns{
                height: 90px;
                line-height: 90px;
                background-color: #F0F1F3;
                font-size: 32px;

                .close{
                    padding: 0 30px;
                    color: #999;
                    float: left;
                }
                .change{
                    padding: 0 30px;
                    color: #F14936;
                    float: right;
                }
            }

            .list-box {
                position: relative;
                height: 400px;
                font-size: 32px;
                text-align: center;

                .item {
                    position: relative;
                    padding: 0 10px;
                    overflow: hidden;

                    .list {
                        position: absolute;
                        top: 90px;
                        left: 0;
                        width: 100%;
                        overflow: auto;
                        transform: translate3d(0,0,0);
                        transition: transform 0.18s ease-out;

                        .li_item{
                            height: 80px;
                            line-height: 80px;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            color: #B6B8B8;

                            &.z-active{
                                color: #262627;
                            }
                        }
                    }
                }
            }
        }
    }
</style>