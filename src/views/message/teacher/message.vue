<template>
    <div class="teacher-message">
        <div class="module-box">
            <div @click="checked(1)">
                <span class="tip-point" v-if="sysStatus === false && systemNum > 0"></span>
                <span :class="isActive === 1 ? 'active-module' : ''">系统消息</span>
                <span v-if="isActive === 1" class="active-line"></span>
            </div>
            <div @click="checked(2)">
                <span class="tip-point" v-if="myStatus === false && myNum > 0"></span>
                <span :class="isActive === 2 ? 'active-module' : ''">我的消息</span>
                <span v-if="isActive === 2" class="active-line"></span>
            </div>
        </div>
        <div class="scroll">
            <div v-for="(item, index) in systemMessage" :key="'system' + index">
                <div class="system-message-box" v-if="isActive === 1 && item.category === 1">
                    <div class="system-message-list" v-if="item.type === 1" @click="jumpPage('evaluation'); updateMessage(1)">                    
                        <img src="../img/evaluation.png" class="portrait"/>
                        <div class="info">
                            <div class="get-evaluation">
                                <span class="title">收到评价</span>
                                <div class="tip-num" v-if="item.readStatus === 0 && evaluationStatus === false">{{ item.count }}</div>
                            </div>
                            <span class="introduce distance">{{ item.content !== {} ? '最新查看：' + item.content.name + '家长 ' + item.content.createTime : '暂无被查看评价' }}</span>
                            <div class="introduce">
                                <img src="../img/view-icon.png"/>
                                <span class="view">{{ item.totalCount }}次查看</span>
                                <!-- <img src="../img/account-icon.png"/>
                                <span>占比{{ systemMessage.accountNum }}</span> -->
                            </div>
                        </div>
                    </div>
                    <div class="system-message-list"  v-if="item.type === 2" @click="jumpPage('task'); updateMessage(2)">                    
                        <img src="../img/audit.png"/>
                        <div class="info">
                            <div class="get-evaluation">
                                <span class="title">任务审核</span>
                                <div class="tip-num" v-if="item.readStatus === 0 && taskStatus === false">{{ item.count }}</div>
                            </div>
                            <span class="introduce">{{ item.content !== {} ?  '最新发布：' +  item.content.staffName + '老师 ' + item.content.createTime : '暂无教师发布任务'}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-for="(item, index) in myMessage" :key="'my' + index">
                <div 
                    class="my-message-box"
                    :class="index+1 === myMessage.length ? 'last-box': ''"
                    v-if="isActive === 2 && item.category === 2"
                >
                    <div class="my-message-list">
                        <img src="../img/man-photo.png" />
                        <div class="info">
                            <div class="info-top">
                                <span class="name">{{ item.content.record.name }}家长</span>
                                <span>{{ item.createTime }}</span>
                            </div>
                            <div class="info-middle" @click="jumpPage('detail', item.content.record.id)">
                                <div class="sketch">
                                    <span v-if="item.type === 3">{{ item.content.record.evaluationName }}</span>
                                    <div>
                                        <img
                                            :class="item.content.record.medal > 0 ? 'medal' : ''"
                                            :src="item.content.record.medalDimensionIdIcon"
                                        />
                                        <span :class="item.content.record.score > 0 ? 'addNum' : 'subNum'">{{ (item.content.record.score > 0 ? '+' : '-') + item.content.record.score }}</span>
                                    </div>
                                </div>
                                <span class="time split-line">{{ item.content.record.updateTime }}</span>
                                <div  v-for="(leaveChild, index) in item.content.feedbackVOS" :key="'leave' + index">
                                    <span class="leave-message"  v-if="leaveChild.type === 1">{{ leaveChild.content }}</span>
                                </div>
                            </div>
                            <div 
                                class="info-footer"
                                v-for="(replyChild, index) in item.content.feedbackVOS" 
                                :key="'reply' + index"
                            >
                                <div class="reply-title"  v-if="replyChild.type === 2">
                                    <span class="headline">我的回复</span>
                                    <span class="time">{{ replyChild.createTime }}</span>
                                </div>
                                <span v-if="replyChild.type === 2">{{ replyChild.content }}</span>
                            </div>
                        </div>
                    </div>
                    <div :class="myMessage.length > 1 && index+1 !== myMessage.length ? 'box-line' : ''"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Axios from 'axios';
import { MessageApi } from '@/utils/api';
import womanPhoto from '../img/woman-photo.png';
import medal from '../img/medal.png';
import Bus from '../component/bus';

export default {
    data () {
        return {
            userId: this.$cookie.get("userId"), // 学校代码
            userType: this.$cookie.get("userType"), // 用户类型
            isActive: 1,            // 1是“系统消息”，2是“我的消息”
            sysStatus: false,       // 系统消息状态,true是已读，false是未读
            systemNum: 0,           // 系统消息未读数量
            myStatus: false,        // 我的消息状态
            myNum: 0,               // 我的消息未读数量
            evaluationStatus: false,// 受到评价消息状态
            taskStatus: false,      // 任务审核消息状态
            systemMessage: [],     // 系统消息
            myMessage: [],          // 我的消息
        }
    },
    mounted () {
        this.getSystemMessage();
        this.getSysMessageNum();
        this.getMyMessageNum();
        this.read();
    },
    watch: { },
    methods: {
        checked (index) {
            this.isActive = index;
            if (this.isActive === 1) {
                this.getSystemMessage();
                this.getSysMessageNum();
            } else {
                this.getMyMessage();
                this.updateMessage(); // 点击我的消息留言、回复、收到评价都为已读状态
            }
        },
        // 页面跳转
        jumpPage (jupmType, id) {
            console.log("跳转==", id);
            if (jupmType === 'evaluation') {
                this.$router.push({
                    path: '/messageRecord',
                });
            } else if (jupmType === 'task') {
                this.$router.push({
                    path: '/taskPublishCheck',
                });
            } else {
                this.$router.push({
                    path: '/recordDetail',
                    query: {
                        id: id,
                        type: 'teacher',
                    }
                });
            }
        },
        // 获取系统消息
        getSystemMessage () {
            var data = {
                userId: this.userId,
                // userId: 122,
                userType: this.userType,
            };
            this.$req.get(MessageApi.getSystemList, data).then(res => {
                if (res.resultCode == 1) {
                    this.systemMessage = res.value;
                }
            })
        },
        // 获取系统消息未读数量
        getSysMessageNum () {
            let formData = new FormData();
            formData.append('userId', this.userId);
            formData.append('category', 1);
            Axios.post(MessageApi.getUnreadNumber, formData, null).then(res => {
                if (res.resultCode === 1) {
                    this.systemNum = res.value;
                    // 如果系统消息未读数量大于0，sysStatus就为false
                    if (this.systemNum > 0) {
                        this.sysStatus = false;
                    }
                }
            });            
        },
        // 获取我的消息
        getMyMessage () {
            var data = {
                userId: this.userId,
                // userId: 122,
                userType: this.userType,
            };
            this.$req.get(MessageApi.getMyList, data).then(res => {
                if (res.resultCode == 1) {
                    this.myMessage = res.value;
                }
            })
        },
        // 获取我的消息未读数量
        getMyMessageNum () {
            let formData = new FormData();
            formData.append('userId', this.userId);
            formData.append('category', 2);
            Axios.post(MessageApi.getUnreadNumber, formData, null).then(res => {
                if (res.resultCode === 1) {
                    this.myNum = res.value;
                    // 如果我的消息未读数量大于0，myStatus就为false
                    if (this.myNum > 0) {
                        this.myStatus = false;
                    }
                }
            });            
        },
        // 更新消息为已读状态
        async updateMessage (messageType) {
            let formData = new FormData();
            formData.append('userId', this.userId);
            if (messageType === 1) {  // 评价查看
                formData.append('type', messageType);
                var res = await this.$req.post(MessageApi.updateMessageReaded, formData, null);
                if (res.resultCode === 1) {
                    this.evaluationStatus = true;
                }
            } else if (messageType === 2) { // 任务审核
                formData.append('type', messageType);
                var res = await this.$req.post(MessageApi.updateMessageReaded, formData, null);
                if (res.resultCode === 1) {
                    this.taskStatus = true;
                }
            } else {
                formData.append('type', 3);
                let leaveRes = await this.$req.post(MessageApi.updateMessageReaded, formData, null);
                formData.append('type', 4);
                let replyRes = await this.$req.post(MessageApi.updateMessageReaded, formData, null);
                formData.append('type', 5);
                let evaluationRes = await this.$req.post(MessageApi.updateMessageReaded, formData, null);
                if (leaveRes.resultCode === 1 && replyRes.resultCode === 1 && evaluationRes.resultCode === 1) {
                    this.myStatus = true;
                }
            }
            if (this.evaluationStatus === true && this.taskStatus === true) {
                this.sysStatus = true;
                if (this.myStatus === true) {
                    this.read();
                }
            }
        },
        // 当“系统消息”和“我的消息”都已读，向主页面传递
        read () {
            console.log("教师消息已读===");
            Bus.$emit('read', true);
        }
    }
}
</script>

<style lang="less">
.teacher-message {
    height: 100%;
    font-family: PingFang SC;
    /* 头部固定 */
    .module-box {
        width: 100%;
        height: 1.18rem;
        display: flex;
        justify-content: space-around;
        align-items: center;
        color: #aeb6c1;
        font-size: 0.48rem;
        position: absolute;
        z-index: 999;

        .tip-point {
            width: 0.21rem;
            height: 0.21rem;
            background-color: #ff7b12;
            border-radius: 50%;
            position: fixed;
            margin-left: 1.76rem;
            margin-top: 0.05rem;
            z-index: 1000;
        }

        .active-module {
            display: block;
            color: #333;
            font-weight: 800;
        }

        .active-line {
            width: 0.53rem;
            height: 0.11rem;
            background-color: #168dff;
            border-radius: 3.6px;
            position: fixed;
            margin: 0.14rem 0.69rem 0;
        }
    }
    /* 滚动 */
    .scroll {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        overflow-x: auto;
        position: relative;
        top: 1.18rem;

        /* 系统消息 */
        .system-message-box {
            padding: 0 0.07rem;

            .middle-line {
                margin: 0.53rem 0.43rem 0.29rem;
                height: 0.01rem;
                background: #eff1f3;
            }
        }

        .system-message-list {
            display: flex;
            justify-content: start;
            align-items: flex-start;

            .portrait {
                position: relative;
                top: 0.3rem;
            }

            .info {
                line-height: 0.59rem;
                padding-top: 0.34rem;
                flex: 1;

                .get-evaluation {
                    display: flex;
                    justify-content: space-between;
                    padding-right: 0.43rem;

                    .title {
                        display: block;
                        color: #262627;
                        font-size: 0.43rem;
                        font-weight: 800;
                        line-height: 0.67rem;
                    }

                    .tip-num {
                        float: right;
                        width: 0.67rem;
                        height: 0.48rem;
                        line-height: 0.48rem;
                        color: #fff;
                        text-align: center;
                        font-size: 0.27rem;
                        background-color: #ff7b12;
                        border-radius: 0.293rem;
                        padding: 0.08rem 0.133rem;
                    }
                }

                .introduce {
                    width: 80%;
                    color: #aeb6c1;
                    display: flex;
                    align-items: center;
                    font-size: 0.37rem;
                    font-weight: 400;
                    padding-top: .1rem;

                    img {
                        width: 0.43rem;
                        height: 0.43rem;
                        margin-right: 0.16rem;
                    }

                    .view {
                        margin-right: 0.53rem;
                    }
                }

                .distance {
                    padding: 0.13rem 0;
                }
            }
        }
        /* 时间日期 */
        .time {
            color: #aeb6c1;
            font-size: 0.37rem;
            font-family: ALIBABA Font;
        }
        /* 我的消息 */
        .my-message-box {
            padding: 0.52rem 0.43rem 0;            
        }
        .last-box {
            margin-bottom: 1.3rem;
        }

        .my-message-list {
            display: flex;
            justify-content: start;
            align-items: flex-start;

            .info {
                color: #aeb6c1;
                font-size: 0.37rem;
                padding-left: 0.27rem;
                flex: 1;

                .info-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #aeb6c1;
                    font-size: 0.37rem;

                    .name {
                        color: #262627;
                        font-size: 0.43rem;
                        font-weight: 800;
                        line-height: 0.67rem;
                    }
                }

                .info-middle {
                    background-color: #eff1f3;
                    border-radius: 0.08rem;
                    margin-top: 0.27rem;
                    padding: 0.27rem;
                    position: relative;

                    .sketch {
                        font-size: 0.38rem;
                        font-weight: bold;
                        color: #707680;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0.27rem;

                        .medal {
                            width: 0.54rem;
                            height: 0.54rem;
                            margin-right: 0.27rem;
                        }

                        .addNum {
                            color: #168dff;
                            font-family: ALIBABA Font;
                        }

                        .subNum {
                            color: #ff7b12;
                            font-family: ALIBABA Font;
                        }
                    }

                    .split-line {
                        display: block;
                        border-bottom: 0.02rem solid #dadfe6;
                        padding-bottom: 0.27rem;
                        margin-bottom: 0.27rem;
                    }

                    .leave-message {
                        color: #707680;
                        font-weight: 500;
                    }
                }

                .info-footer {
                    font-size: 0.37rem;
                    color: #292d33;
                    font-weight: 500;
                    position: relative;
                    margin: 0.27rem 0;
                    padding-left: 0.27rem;
                    border-left: 0.06rem solid #168dff;

                    .reply-title {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .headline {
                            font-weight: bold;
                        }
                    }

                    span {
                        line-height: 0.59rem;
                    }
                }
            }
        }
        
        .box-line {
            flex: 1;
            margin-top: 0.54rem;
            height: 0.02rem;
            background-color: #eff1f3;
        }
    }
}
</style>
