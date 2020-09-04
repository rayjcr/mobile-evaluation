<template>
    <div class="teacher-record">
        <div class="record-top">
            <div class="search-box" @click="popupVisible = true">
                <span>{{ rankTimeType == 1 ? "按周" : "按月" }}</span>
                <img src="/static/img/icon_down@2x.png" class="icon_down"/>
            </div>
        </div>
        <!--图表统计-->
        <div class="section record-echarts">
            <!--时间本周本月本学期-->
            <v-time ref="time" @getTimeWB="getTimeWB"></v-time>
            <div class="flex echarts-box alignCenter" v-if="countInfo">
                <div class="echarts-left">
                    <v-bar ref="bar"></v-bar>
                </div>
                <div class="echarts-right flex_1">
                    <div class="right-item marginBottom10">
                        <span class="name">已评价：</span>
                        <span class="number">{{ countInfo.totalCount }}</span>
                    </div>
                    <div v-if="countInfo.evaluationRewardCountList">
                        <div
                            class="right-item"
                            v-for="(item,
                            index) in countInfo.evaluationRewardCountList"
                            :key="index"
                        >
                            <div
                                class="flex alignCenter"
                                v-if="item.rewardType == 3"
                            >
                                <span class="dot add-dot"></span>
                                <span class="desc"
                                    >加分: {{ item.count }}次，共{{
                                        item.totalScore
                                    }}分</span
                                >
                            </div>
                            <div
                                class="flex alignCenter"
                                v-else-if="item.rewardType == 4"
                            >
                                <span class="dot reduce-dot"></span>
                                <span class="desc"
                                    >减分: {{ item.count }}次，共{{
                                        item.totalScore
                                    }}分</span
                                >
                            </div>
                            <div
                                class="flex alignCenter"
                                v-else-if="item.rewardType == 5"
                            >
                                <span class="dot reward-dot"></span>
                                <span class="desc"
                                    >奖励勋章: {{ item.count }}次，共{{ item.totalScore }}枚</span
                                >
                            </div>
                            <div class="flex alignCenter" v-else>
                                <span class="dot deduct-dot"></span>
                                <span class="desc"
                                    >扣除勋章: {{ item.count }}次，共{{ item.totalScore }}枚</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!--评价记录列表-->
        <v-record-list
            ref="recordList"
            :showTab="true"
            :origin="'record'"
            :pjTabList="pjTabList"
            :recordList="recordList"
            recordType="message"
            @getRewardType="getRewardType"
            @getEvaluationObject="getEvaluationObject"
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
                    <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
                    <div class="picker-title"></div>
                    <div class="picker-btn picker-sure" @click="onConfirm">完成</div>
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
import { PjApi as API } from "@/utils/api";

import RecordList from "@/components/pjRecord/RecordList.vue";
import Confirm from "@/components/confirm/confirm.vue"
import Bar from "@/components/echarts/Bar.vue";
import Time from "@/components/time/Time.vue";

export default {
    components: {
        "v-record-list": RecordList,
        "v-confirm": Confirm,
        "v-time": Time,
        "v-bar": Bar
    },
    data () {
        return {
            userId: this.$cookie.get("userId"),
            xxdm: this.$cookie.get("xxdm"), // 学校代码

            popupVisible: false,
            queryLoading: true,
            moreLoading: false,
            allLoaded: false,
            isbool: true, // 滚动到底部加载数据并且防止触发多次
            recordId: '', // 要撤销的记录项id
            page: 1, // 当前页码
            limit: 10, // 每页显示记录条数
            evaluationObject: 1, // 1,学生，2，班级，3，团队
            countInfo: null, // 评价记录次数统计
            rewardType: "",
            recordList: [], // 存放评价记录列表数据
            pjTabList: [
                { type: 0, name: "全部" },
                { type: 3, name: "加分" },
                { type: 4, name: "减分" },
                { type: 5, name: "奖励勋章" },
                { type: 6, name: "扣除勋章" }
            ],
            rankTimeType: 1, // 1 周 2 月
            startTime: "",
            endTime: "",
            timeList: [
                { type: 1, name: "按周" },
                { type: 2, name: "按月" }
            ],
            barData: [],
            confirm_tip: '撤销后该记录在教师端/学生端都不显示，学生增加/减少的分数或者勋章原路返回' // 学生撤销评价记录的提示语
        };
    },
    computed: {
        dataList () {
            let dateSlots = [
                {
                    flex: 1,
                    values: this.timeList,
                    className: "slot1",
                    textAlign: "center"
                }
            ];
            return dateSlots;
        }
    },
    watch: {
        startTime (newVal) {
            if (newVal) {
                let p1 = null;
                if (this.evaluationObject == 3) {
                    p1 = this.getTeamList;
                } else {
                    p1 = this.getRecordList;
                }
                Promise.all([
                    this.initData(),
                    this.getCountStatistics(),
                    p1 ? p1() : null
                ]).then(() => {
                }).catch((error) => {
                    console.log(error);
                });
            }
        },
        '$route' (to, from) {
            if (from.path == '/pjrecord') {
                // 避免多次触发
                this.$root.eventHub.$off("revokeRecord", this.revokeRecord);
                this.$root.eventHub.$off("getClassRevokeTip", this.getClassRevokeTip);
            }
        }
    },
    activated () {
        let p1 = null,
            p2 = this.initWeek,
            p3 = this.initData,
            p4 = null;

        if (this.rankTimeType == 1) { // 默认按周请求(watch监听会多请求一次)
            p1 = this.getCountStatistics;
            p4 = this.getRecordList;
        }
        this.evaluationObject = 1; // 学生
        this.$nextTick(() => {
            this.$refs.recordList.type = 1;
        });

        Promise.all([p1 ? p1() : null, p2(), p3(), p4 ? p4() : null]).then(() => {
        }).catch((error) => {
            console.log(error);
        });

        // 监听撤销评价记录事件
        this.$root.eventHub.$on("revokeRecord", this.revokeRecord);
        // 监听切换学生，班级，团队事件，获取班级撤销评价记录的提示语
        this.$root.eventHub.$on("getClassRevokeTip", this.getClassRevokeTip);
    },
    methods: {
        /*
        * 获取评价记录列表
        * */
        async getRecordList (page) {
            if (!this.startTime) return;
            this.page = page || this.page;
            this.$indicator.open("加载中...");
            let data = {
                type: '1,2',
                page: this.page,
                limit: this.limit,
                evaluationObject: this.evaluationObject,
                rewardType: this.rewardType,
                evaluator: this.userId,
                startTime: this.startTime.replace(/-/g, "/"),
                endTime: this.endTime.replace(/-/g, "/")
            };
            this.isbool = false;
            const res = await this.$req.get(API.getRecordList, data);
            let { resultCode, value } = res;
            if (resultCode == 1) {
                let list = value.dataList;
                let arr = list.filter((c) => {
                    return c.score || c.medal
                })
                this.recordList = page ? arr : [...this.recordList, ...arr];

                if (list.length >= this.limit) {
                    this.page++;
                } else {
                    this.allLoaded = true;
                }
                this.isbool = true;
            }
        },
        /*
        * 获取评价统计
        * */
        async getCountStatistics () {
            if (!this.startTime) return;
            let data = {
                evaluator: this.userId,
                evaluationObject: 1,
                startTime: this.startTime.replace(/-/g, "/"),
                endTime: this.endTime.replace(/-/g, "/")
            };
            const res = await this.$req.get(API.countStatistics, data);
            if (res.resultCode == 1) {
                this.barData = [];
                this.countInfo = res.value;
                res.value.evaluationRewardCountList.forEach((c) => {
                    this.barData.push({
                        name: c.rewardType == 3 ? "加分" : c.rewardType == 4 ? "减分" : c.rewardType == 5 ? "奖励勋章" : "扣除勋章",
                        type: "bar",
                        barGap: "100%", // 调整间距
                        data: [c.totalScore]
                    });
                });
                setTimeout(() => {
                    this.initBarCharts();
                }, 300);
            }
        },
        /*
        * 获取团队列表
        * */
        async getTeamList () {
            if (!this.startTime) return;
            this.$indicator.open("加载中...");
            let data = {
                page: this.page,
                limit: this.limit,
                evaluator: this.userId,
                schoolCode: this.xxdm,
                rewardType: this.rewardType,
                startTime: this.rankTimeType == 2 ? this.startTime + ' 00:00:00' : this.startTime,
                endTime: this.rankTimeType == 2 ? this.endTime + ' 23:59:59' : this.endTime
            };
            this.isbool = false;
            const res = await this.$req.post(API.getTeamRList, data);

            if (res.resultCode == 1) {
                let list = res.value.dataList;
                this.recordList = [...this.recordList, ...list];

                if (list.length >= this.limit) {
                    this.page++;
                } else {
                    this.allLoaded = true;
                }
                this.isbool = true;
            }
        },

        initBarCharts () {
            this.$refs.bar.clear();
            this.$refs.bar.barOption.series = this.barData;
            setTimeout(() => {
                this.$refs.bar.initChart();
            }, 300);
        },
        initData () {
            this.page = 1;
            this.allLoaded = false;
            this.popupVisible = false;
            this.recordList = [];
        },
        /*
        * 初始化周次信息
        * */
        initWeek () {
            this.rankTimeType = 1;
            this.$refs.time.type = 1;
            this.$refs.picker.setSlotValue(0, this.timeList[0])
        },
        /*
        * 奖惩项切换
        * */
        getRewardType (key) {
            this.rewardType = this.pjTabList[key].type;
            let p1 = this.initData,
                p2 = null;

            if (this.evaluationObject == 3) { // 团队
                p2 = this.getTeamList;
            } else {
                p2 = this.getRecordList;
            }
            Promise.all([p1(), p2 ? p2() : null]).then(() => {
            }).catch((error) => {
                console.log(error);
            });
        },
        /*
        * 切换学生/班级/团队
        * */
        getEvaluationObject (type) {
            if (this.evaluationObject == type) return;

            this.evaluationObject = type;
            this.rewardType = this.$refs.recordList.tab2_key; // 默认全部0,3加分
            let p1 = this.initData,
                p2 = null;

            if (type == 3) {
                // 团队
                p2 = this.getTeamList;
            } else {
                // 学生，班级
                p2 = this.getRecordList;
            }
            Promise.all([p1(), p2 ? p2() : null]).then(() => {
            }).catch((error) => {
                console.log(error);
            });
        },
        getTimeWB (data) {
            /*this.startTime = data.startTime ? data.startTime.replace(/-/g, "/") : null;
            this.endTime = data.endTime ? data.endTime.replace(/-/g, "/") : null;*/
            this.startTime = data.startTime;
            this.endTime = data.endTime
        },
        onConfirm () {
            let subjectSelected = this.$refs.picker.getValues()[0];
            this.rankTimeType = subjectSelected.type;
            this.$refs.time.type = subjectSelected.type;
            this.popupVisible = false;
        }
    }
};
</script>

<style lang="less" scoped>
.teacher-record {
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
        box-shadow: 0 6px 18px rgba(86, 104, 119, 0.15);
        .echarts-box {
            margin-top: 25px;
            padding-bottom: 20px;
        }
        .echarts-left {
            width: 240px;
            height: 220px;
            margin: 0 56px 0 32px;
            border-radius: 20px;
            background-color: #f3f5f7;
        }
        .echarts-right {
            padding-right: 20px;
            .marginBottom10 {
                margin-bottom: 10px;
            }
            .right-item {
                line-height: 40px;
                color: #b6b8b8;
                font-size: 24px;
                .name {
                    color: #262727;
                    font-size: 28px;
                }
                .number {
                    color: #262727;
                    font-size: 48px;
                    font-weight: 600;
                }
                .dot {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    margin-right: 10px;
                    border-radius: 100%;
                }
                .add-dot {
                    background-color: #33a5ff;
                }
                .reduce-dot {
                    background-color: #ff8829;
                }
                .reward-dot {
                    background-color: #8fea60;
                }
                .deduct-dot {
                    background-color: #fdce48;
                }
                .desc {
                    color: #b6b8b8;
                    font-size: 24px;
                }
            }
        }
    }

    .wait-list-loading {
        height: 80px;
        line-height: 80px;
        text-align: center;
    }
}
</style>
