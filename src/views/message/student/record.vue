<template>
    <div class="student-record">
        <div class="record-top">
            <div class="search-box" @click="popupVisible = true">
                <span>{{ type == 1 ? "按周" : "按月" }}</span>
                <img src="/static/img/icon_down@2x.png" class="icon_down"/>
            </div>
        </div>
        <!--图表统计-->
        <div class="section record-echarts">
            <!--时间本周本月本学期-->
            <v-time ref="time" @getTimeWB="getTimeWB"></v-time>
            <div class="flex echarts-box">
                <v-line ref="lineChart"></v-line>
            </div>
        </div>

        <!--评价详情-->
        <v-record-list
            ref="recordList"
            :origin="'record'"
            :pjTabList="pjTabList"
            :recordList="recordList"
            recordType="message"
            @getRewardType="getRewardType"
        ></v-record-list>

        <!--选择器-->
        <mt-popup
            v-model="popupVisible"
            v-roll:visible="popupVisible"
            position="bottom"
            class="mint-popup"
        >
            <mt-picker
                :slots="dataList"
                :visible-item-count="5"
                :show-toolbar="true"
                ref="picker"
                value-key="name"
                :itemHeight="40"
            >
                <div class="flex">
                    <div
                        class="picker-btn picker-cancel"
                        @click="popupVisible = false"
                    >
                        取消
                    </div>
                    <div class="picker-title"></div>
                    <div class="picker-btn picker-sure" @click="onConfirm">
                        完成
                    </div>
                </div>
            </mt-picker>
        </mt-popup>

        <!--底部判断是加载图标还是提示“全部加载”-->
        <div
            class="wait-list-loading"
            v-show="queryLoading"
            v-if="recordList.length > 10"
        >
            <span v-show="moreLoading && !allLoaded">加载中...</span>
            <span v-show="allLoaded">已全部加载</span>
        </div>
    </div>
</template>

<script>
import { PjApi, CountApi } from '@/utils/api';
import RecordList from '@/components/pjRecord/RecordList.vue';
import LineChart from '@/components/echarts/Line.vue';
import Time from '@/components/time/Time.vue';

export default {
    components: {
        'v-record-list': RecordList,
        'v-time': Time,
        'v-line': LineChart,
    },
    data () {
        return {
            userId: this.$cookie.get('userId'),
            popupVisible: false,
            queryLoading: true,
            moreLoading: false,
            allLoaded: false,
            isbool: true, // 滚动到底部加载数据并且防止触发多次
            page: 1, // 当前页码
            limit: 10, // 每页显示记录条数
            evaluator: '', // 评价人
            rewardType: '',
            recordList: [], // 存放评价记录列表数据
            pjTabList: [
                { type: 0, name: '全部' },
                { type: 3, name: '加分' },
                { type: 4, name: '减分' },
                { type: 5, name: '奖励勋章' },
                { type: 6, name: '扣除勋章' }
            ], // 默认显示学生的评价详情
            date: '', // 周内/月内包含的日期 (yyyy/MM/dd)
            endTime: '',
            type: 1, // 按周，按月
            timeList: [
                { type: 1, name: '按周' },
                { type: 2, name: '按月' }
            ],
        }
    },
    computed: {
        dataList () {
            let dateSlots = [
                {
                    flex: 1,
                    values: this.timeList,
                    className: 'slot1',
                    textAlign: 'center'
                }
            ];
            return dateSlots
        },
    },
    watch: {
        date (newVal) {
            if (newVal) {
                Promise.all([this.initData(), this.getMedalTotalStatistics(), this.getRecordList()]).then((result) => { }).catch((error) => {
                    console.log(error)      // 失败了，打出 '失败'
                })
            }
        }
    },
    activated () {
        let p1 = null,
            p2 = this.initWeek,
            p3 = this.initData,
            p4 = null;

        if (this.type == 1) { // 默认按周在请求
            p1 = this.getMedalTotalStatistics;
            p4 = this.getRecordList;
        }

        Promise.all([p1 ? p1() : null, p2(), p3(), p4 ? p4() : null]).then(result => { }).catch((error) => {
            console.log(error)      // 失败了，打出 '失败'
        })
    },
    mounted() {  },
    methods: {      
        // 获取周charts信息
        async getMedalTotalStatistics () {
            if (!this.date) return;
            let data = {
                userId: this.userId,
                type: this.type,
                date: this.date
            };
            const res = await this.$req.get(CountApi.studentMedalTotalStatistics, data);
            let { resultCode, value } = res;
            if (resultCode == 1) {
                let xAxisData = [], seriesData = [];
                value.forEach((c) => {
                    xAxisData.push(c.tag);
                    seriesData.push(c.count);
                })
                this.$refs.lineChart.lineOptions.xAxis.data = xAxisData;
                this.$refs.lineChart.lineOptions.series[0].data = seriesData;
                this.$refs.lineChart.clear();
                setTimeout(() => {
                    this.$refs.lineChart.initChart()
                })
            }
        },
        async getRecordList () {
            if (!this.date) return;
            this.$indicator.open('加载中...')
            let data = {
                type: '1,2,5,7', // 1.录入型 2.任务型 3.学生上传 5.班级荣誉
                // status: 1,
                page: this.page,
                limit: this.limit,
                evaluationObject: 1,
                rewardType: this.rewardType,
                evaluator: this.evaluator,
                userId: this.userId,
                startTime: this.date,
                endTime: this.endTime
            };
            this.isbool = false;
            const res = await this.$req.get(PjApi.getRecordList, data);
            let { resultCode, value } = res;
            if (resultCode == 1) {
                let list = value.dataList;
                let arr = list.filter((c) => {
                    return c.score || c.medal
                })
                this.recordList = [...this.recordList, ...arr];

                if (list.length >= this.limit) {
                    this.page++;
                } else {
                    this.allLoaded = true;
                }
                this.isbool = true;
            }
        },
        initData () {
            this.page = 1;
            this.allLoaded = false;
            this.popupVisible = false;
            this.recordList = [];
        },
        initWeek () {
            this.type = 1
            this.$refs.time.type = 1
        },
        getTimeWB (data) {
            this.date = data.startTime ? data.startTime.replace(/-/g, "/") : null;
            this.endTime = data.endTime ? data.endTime.replace(/-/g, "/") : null;
        },
        getRewardType (key) {
            this.rewardType = this.pjTabList[key].type;
            Promise.all([this.initData(), this.getRecordList()]).then(result => {
                // console.log("result---",result)
            }).catch((error) => {
                console.log(error)      // 失败了，打出 '失败'
            })
        },
        onConfirm () {
            let subjectSelected = this.$refs.picker.getValues()[0];
            this.$refs.time.type = subjectSelected.type;
            this.type = subjectSelected.type;
            this.popupVisible = false;
        },
    }
}
</script>

<style lang="less" scoped>
.student-record {
    height: 100%;
    padding: 0 .43rem;    

    .record-top {
        padding: .27rem 0 .3rem;

        .search-box {
            width: 1.87rem;
            height: .75rem;
            line-height: .75rem;
            background-color: #fff;
            border-radius: .35rem;
            font-size: 0.38rem;
            text-align: center;
            color: #262727;
        }
        .icon_down {
            width: .44rem;
            height: .38rem;
            position: relative;
            top: -0.18rem;  
            margin-left: .1rem;
        }
    }

    .section {
        background-color: #ffffff;
        border-radius: 20px;
    }
    .record-echarts {
        padding-bottom: 20px;
        box-shadow: 0 6px 18px rgba(86, 104, 119, 0.15);
        .echarts-box {
            margin-top: 25px;
            height: 359px;
        }
    }

    .wait-list-loading {
        height: 80px;
        line-height: 80px;
        text-align: center;
    }
}
</style>
