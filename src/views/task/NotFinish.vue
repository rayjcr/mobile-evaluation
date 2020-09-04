<template>
    <div class="list-box">
        <div style="height: 100%;" v-if="list.length > 0">
            <div class="head-box flex alignCenter">
                <div class="sort-box flex alignCenter" @click="sort_type == 'desc' ? sort_type = 'asc' : sort_type = 'desc'">
                    <span>{{sort_type == 'desc' ? '提交次数最多' : '提交次数最少'}}</span>
                    <div class="icon_sort"></div>
                </div>
            </div>
            <div class="list scrollY" :class="{'height': !pushResultToParents.enable}">
                <ul class="clear">
                    <li class="fl" v-for="(item,index) in list" :key="index" :class="{'marginLeft30' : (index+1)%2 == 0}" @click="check(index)">
                        <div class="name text-overflow">{{item.studentName}}</div>
                        <div class="tjcs">提交次数: &nbsp;{{item.completeTimes}}</div>
                        <div class="right" v-if="pushResultToParents.enable">
                            <div class="check-circle" :class="{'checked': item.checked}"></div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="bottom-box flex alignCenter justifySpaceBetween" v-if="pushResultToParents.enable">
                <div class="flex alignCenter" @click="selectedAll">
                    <div class="check-circle" :class="{'checked': check_all}"></div>
                    <span class="selected-all">全选</span>
                </div>
                <div class="btn-box flex alignCenter">
                    <span class="send-tx" :class="{'disabled': checked_list.length == 0}" @click="confirm">发送提醒</span>
                </div>
            </div>
        </div>
        <div class="empty" v-else>
            <v-empty-list :text="'无数据'"></v-empty-list>
        </div>

        <!-- 提醒确认弹窗 -->
        <v-confirm ref="confirm" 
            :cStyle="{'color': '#262627'}" 
            sureText="确定" 
            cancleText="取消" 
            title="提醒内容:" 
            :content="tx_content" 
            @sure="sendRemind2Student"
        ></v-confirm>
    </div>
</template>

<script>
    import Confirm from "@/components/confirm/confirm.vue"

    import EmptyList from '@/components/EmptyList.vue'

    import {TaskApi,gobalAPi} from '@/utils/api'

    export default {
        name: 'NotFinish',
        components: {
            "v-confirm": Confirm,
            'v-empty-list': EmptyList
        },
        data() {
            return {
                sort_type: 'desc', // 排序 asc升序,desc降序 默认降序
                check_all: true, // 是否全选，默认全选
                id: this.$route.query.id,
                taskName: this.$route.query.name,
                tx_content: '',
                pushResultToParents: {}, // 评价结果和提醒推送到家长
                class_list: [],
                list: [],
                checked_list: [], // 存放选中列表
            }
        },
        watch: {
            sort_type(nVal) {
                let _target = {
                    'desc': () => {
                        this.list.sort(function (a,b) {
                            return b.completeTimes - a.completeTimes;
                        })
                    },
                    'asc': () => {
                        this.list.sort(function (a,b) {
                            return a.completeTimes - b.completeTimes;
                        })
                    }
                }
                _target[nVal]();
            }
        },
        mounted() {
            this.getConfig();
            this.getClassesList();
        },
        methods: {
            /*
			* 获取学校全局配置
			* */
			async getConfig() {
				const res = await this.$req.get(gobalAPi.getConfig2);
				if (res.resultCode == 1) {
					this.pushResultToParents = res.value.pushResultToParents
				}
			},
            /*
			* 获取评价项相关班级
			* */
			async getClassesList() {
                let data = {
                    evaluationId: this.id
                };
				const res = await this.$req.get(TaskApi.getClassesList,data);
				if (res.resultCode == 1) {
                    res.value.forEach((c,i) => {
                        this.class_list = this.class_list + c.classCode + (i == res.value.length - 1 ? '' : ',');

                    })
                    this.getUnfinishedStuList();
				}
			},
            /*
			* 查看任务未完成的学生
			* */
			async getUnfinishedStuList() {
                let data = {
                    evaluationId: this.id,
                    classCode: this.class_list
                };
				const res = await this.$req.get(TaskApi.getUnfinishedStuList,data);
				if (res.resultCode == 1) {
                    this.list = res.value.stuList || [];
                    // this.list.sort(function (a,b) {
                    //     return b.completeTimes - a.completeTimes;
                    // })
                    this.checked_list = JSON.parse(JSON.stringify(this.list))
                    this.list.forEach(c => {
                        this.$set(c,'checked',true)
                    })
				}
            },
            /*
			* 提醒任务未完成的学生
			* */
			async sendRemind2Student() {
                let stuList = {};
                this.checked_list.forEach(c => {
                    stuList[c.studentCode] = c.studentName
                })
                let data = {
                    evaluationId: this.id,
                    stuList
                };
                this.$indicator.open('请稍后')
				const res = await this.$req.post(TaskApi.sendRemind2Student,data);
				if (res.resultCode == 1) {
                    this.$toast('已发送提醒');
                    this.$refs.confirm._hide();
				}
			},
            selectedAll() {
                this.check_all = !this.check_all;
                this.checked_list = [];
                this.list.forEach(c => {
                    c.checked = this.check_all;
                    if(c.checked) {
                        this.checked_list.push(c)
                    }
                })
            },
            check(key) {
                if(!this.pushResultToParents.enable) return; // 后台开关未开启
                this.list[key].checked = !this.list[key].checked;
                this.checked_list = [];
                this.list.forEach(c => {
                    if(c.checked) {
                        this.checked_list.push(c)
                    }
                })
                if(this.checked_list.length == this.list.length) {
                    this.check_all = true;
                } else {
                    this.check_all = false;
                }
            },
            // 提醒二次确认操作
            confirm() {
                if(!this.checked_list.length) {
                    this.$toast('请选择要提醒的学生')
                    return;
                }
                this.tx_content = '';
                if(this.checked_list.length > 3) {
                    this.tx_content += this.checked_list[0].studentName + '、' + this.checked_list[1].studentName + '、' + this.checked_list[2].studentName + '...';
                } else if(this.checked_list.length == 3) {
                    this.tx_content += this.checked_list[0].studentName + '、' + this.checked_list[1].studentName + '、' + this.checked_list[2].studentName
                }else if(this.checked_list.length == 2) {
                    this.tx_content += this.checked_list[0].studentName + '、' + this.checked_list[1].studentName
                } else {
                    this.tx_content += this.checked_list[0].studentName
                }
                this.tx_content += `家长，您的孩子还未完成“${this.taskName}”任务，请提醒孩子及时完成`;
                this.$refs.confirm._show();
            }
        }
    }
</script>

<style lang="less" scoped>
    .list-box {
        height: 100%;
        background-color: #EFF1F3;
        .empty {
            position: relative;
            height: 100%;
        }
        .head-box {
            height: 96px;
            padding: 0 32px;
            .sort-box {
                width: 228px;
                height: 56px;
                color: #262727;
                font-size: 28px;
                padding-left: 20px;
                background-color: #ffffff;
                border-radius: 28px;
                .icon_sort {
                    width: 28px;
                    height: 28px;
                    margin-left: 12px;
                    background-image: url(./img/icon_sort@2x.png);
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 28px auto;
                }
            }
        }
        .list {
            padding: 0 32px;
            height: calc(100% - 204px);
            &.height {
                height: calc(100% - 96px);
            }
            li {
                position: relative;
                width: 308px;
                height: 134px;
                padding-left: 20px;
                margin-bottom: 40px;
                background-color: #ffffff;
                border-radius: 20px;
                &.marginLeft30 {
                    margin-left: 30px;
                }
                .name {
                    width: 248px;
                    color: #262626;
                    font-size: 28px;
                    margin: 20px 0;
                    font-weight: 600;
                }
                .tjcs {
                    width: 248px;
                    color: #B6B8B8;
                    font-size: 24px;
                }
                .right {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    top: 48px;
                    right: 20px;
                }
            }
        }
        .bottom-box {
            height: 108px;
            padding: 0 32px;
            background-color: #FFFFFF;
            .check-circle {
                transform-origin: center center;
            }
            .selected-all {
                color: #262727;
                font-size: 28px;
            }
            .btn-box {
                font-size: 32px;
                .send-tx {
                    width: 200px;
                    height: 88px;
                    line-height: 88px;
                    text-align: center;
                    color: #ffffff;
                    background-color: #33A5FF;
                    border-radius: 44px; 
                }
                .disabled {
                    color: #B6B8B8;
                    background-color: #EFF1F3;
                }
            }
        }

        .check-circle {
            position: relative;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            transform: scale(0.5);
            transform-origin: 0 0;
            background-color: #EFF1F3;
            &:after {
                content: '';
                width: 8px;
                height: 18px;
                position: absolute;
                left: 33px;
                top: 25px;
                border: 4px solid transparent;
                border-top: 0;
                border-left: 0;
                border-color: #ffffff;
                transform: rotate(45deg) scale(1.5);
                transition: transform .2s;
            }
            &.checked {
                border-color: #ffffff;
                background-color: #33A5FF;
            }
        }
    }
</style>