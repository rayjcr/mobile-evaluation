<template> 
    <div :class="show === true ? 'record-detail' : 'show-none'" >        
        <div class="top">
            <img :src="topDetail.medalDimensionIdIcon " class="medal"/>
            <span class="score">{{ (topDetail.score > 0 ? '+' : '-') + topDetail.score }}</span>
            <img 
                src="./img/take-effect.png" 
                v-if="middleDetail.status !== 0 && dateCompare === 'no'" 
                class="take-effect"
            />
        </div>
        <div class="middle">
            <div class="personal">
                <div class="name-time">
                    <span class="name">{{topDetail.name}}</span>
                    <span class="time">{{topDetail.createTime}}</span>
                </div>
                <span>{{topDetail.className}}</span>
            </div>
            <div class="sketch">
                <div class="sketch-item">
                    <span class="small-title">奖励项名称：</span>
                    <span>{{topDetail.evaluationName}}</span>
                </div>
                <div class="sketch-item">
                    <span class="small-title">奖惩：</span>
                    <span>{{topDetail.rewardName}}</span>
                </div>
                <div class="sketch-item">
                    <span class="small-title">评价老师：</span>
                    <span>{{topDetail.evaluatorName}}</span>
                </div>
            </div>
            <div class="information">
                <div class="describe">{{middleDetail.content}}</div>
                <div 
                    class="voice"
                    v-for="(voi, index) in middleDetail.fileInfoVOS"
                    :key="index + 1"
                > 
                    <audio-component 
                        v-if="voi.contentType.match('audio')"
                        :audioInfo="voi" 
                        :index="0" 
                        :audioPlay="audioPlay" 
                        @audioclick="handlerAudioClick">
                    </audio-component>
                    <amr-audio 
                        v-if="voi.contentType.match('application')"
                        :urls='voi.absolutePath' 
                        :clear="false"
                    ></amr-audio>
                    <button class="transfer-btn" @click="transfer">转文字</button>
                    <div v-if="textVisible === true && middleDetail.audioWord" class="transfer-text">{{middleDetail.audioWord}}</div>
                </div>
                <div class="imgList" v-for="(item, index) in middleDetail.fileInfoVOS" :key="'info' + index">
                    <div 
                        class="img-item" 
                        v-if="item.contentType.match('video')"
                        @click="toVideo(item.absolutePath)" 
                    >
                        <img src="./img/play-btn.png" class="player-btn"/>
                        <video :controls='false' ref="myVideo">
                            <source :src="item.absolutePath" />
                        </video>
                    </div>    
                    <div class="img-item" v-if="item.contentType.match('image')">
                        <img v-gallery="'imgs'+ topDetail.id" :src="item.absolutePath" alt="" class="img-detail">
                    </div>
                </div> 
            </div>
        </div>
        <div class="footer">
            <button 
                class="btn" 
                @click="revokeRecord(recordId)" 
                v-if="type === 'teacher' && dateCompare === 'no'"
            >撤销评价</button>
            <button class="btn" @click="openLeaveMessage(topDetail.userId)" v-if="type === 'student' && leaveMessageList.length === 0">留言</button>
            <div :class="leaveMessageList.length > 0 ? 'leaveMessage-reply' : ''">
                <div v-for="(item, index) in leaveMessageList" :key="'leaveReply' + index">                
                    <div v-if="type === 'teacher'" class="teacher">
                        <img src="./img/man-photo.png" class="portrait"/>
                        <div class="message">
                            <span class="name">{{topDetail.name}}家长</span>
                            <div class="already-read">
                                <span>家长已读</span>
                                <img class="sign" src="./img/already-icon.png"/>
                            </div>
                            <div class="leave-message" v-if="item.type === 1">
                                <div class="line">
                                    <span>学生留言：</span>
                                    <span class="time">{{item.createTime}}</span>
                                </div>
                                <span>{{item.content}}</span>
                            </div>
                            <button 
                                class="reply-btn" 
                                @click="openReply(topDetail.evaluator, item.id)"
                                v-if="item.type !== 2"
                            >回复</button>
                            <div class="reply" v-if="item.type === 2">
                                <div class="line">
                                    <span>我的回复</span>
                                    <span class="time">{{item.createTime}}</span>
                                </div>
                                <span class="content">{{item.content}}</span>
                            </div>
                        </div>
                    </div>
                    <div  v-if="type === 'student'" class="student">
                        <div class="leave-message" v-if="item.type === 1">
                            <div class="line">
                                <span>我的留言：</span>
                                <span class="time">{{item.createTime}}</span>
                            </div>
                            <span>{{item.content}}</span>
                        </div>
                        <div class="reply" v-if="item.type === 2">
                            <div class="line">
                                <span>老师回复</span>
                                <span class="time">{{item.createTime}}</span>
                            </div>
                            <span class="content">{{item.content}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 撤销评价记录 -->
        <cancelRecord
            ref="confirm"
            :content="tip"
            @sure="undoRecord"
        ></cancelRecord>
        <!-- 留言弹窗 -->
        <mt-popup
            v-model="leaveVisible"
            v-roll:visible="leaveVisible"
            position="bottom"
            class="mint-popup"
        >
            <leaveMessage      
                :recordId="recordId"     
                :studentId="personId" 
                v-on:closeLeaveMessage="closeLeaveMessage"
            ></leaveMessage>
        </mt-popup>
        <!-- 回复弹窗 -->
        <mt-popup
            v-model="replyVisible"
            v-roll:visible="replyVisible"
            position="bottom"
            class="mint-popup"
        >
            <replyMessage      
                :recordId="recordId"     
                :teacherId="personId" 
                :feedbackId="feedbackId"
                v-on:closeReply="closeReply"
            ></replyMessage>
        </mt-popup>
    </div>
</template>

<script>
import { PjApi } from "@/utils/api";
import { MessageApi } from '@/utils/api';
import cancelRecord from '@/components/confirm/confirm.vue';
import leaveMessage from './component/leaveMessage.vue';
import replyMessage from './component/replyMessage.vue';
import playAmr from '@/components/playAmr.vue';
import audioComponent from '@/components/audioComponent';
export default {
    components: {
        cancelRecord,
        leaveMessage,
        replyMessage,
        audioComponent,
        'amr-audio': playAmr,
    },
    name: 'detail',
    props: ['info', 'itemInfo', 'origin'],
    data () {
        return {
            loginId: this.$cookie.get('userId'),
            schoolCode: this.$cookie.get('xxdm'),
            id: '',               // 获取详情对应id
            type: '',             // 人物类型：学生、教师
            show: false,          // 判断是否有详情数据
            leaveVisible: false,  // 留言弹窗
            replyVisible: false,  // 回复弹窗
            dateCompare: '',      // yes是当前日期比撤回日期大，no是当前日期比撤回日期小
            topDetail: {},
            middleDetail: {},
            rewardList: [         // 奖惩列表
                {
                    value: 3,
                    label: '加分'
                },
                {
                    value: 4,
                    label: '减分'
                },
                {
                    value: 5,
                    label: '加勋章'
                },
                {
                    value: 6,
                    label: '减勋章'
                },
            ],
            leaveMessageList: [],
            recordId: '',         // 要撤销的记录项id
            personId: '',         // 学生或者教师的id
            feedbackId: '',       // 回复对应留言的id
            evaluationObject: 1,  // 1.学生，2.班级，3.团队
            tip: '撤销后该记录在教师端/学生端都不显示，学生增加/减少的分数或者勋章原路返回', // 学生撤销评价记录的提示语  
            audioPlay: false,
            textVisible: false,   // 语言转文字展示  
        }
    },
    watch: {      
        '$route' (to, from) {
            if (from.path == '/recordDetail') {
                // 避免多次触发
                this.$root.eventHub.$off("revokeRecord", this.revokeRecord);
                this.$root.eventHub.$off("getClassRevokeTip", this.getClassRevokeTip);
            }
        },        
    },
    mounted () { },
    activated() {      
        this.id = this.$route.query.id;    
        this.type = this.$route.query.type;  
        this.getDetail();
        this.getLeaveMessage();    
        // 监听撤销评价记录事件
        this.$root.eventHub.$on("revokeRecord", this.revokeRecord);
        // 监听切换学生，班级，团队事件，获取班级撤销评价记录的提示语
        this.$root.eventHub.$on("getClassRevokeTip", this.getClassRevokeTip);
    },
    mounted () { },
    methods: {
        // 获取详情数据
        getDetail () {      
            this.$indicator.open("加载中...");
            var data = { id: this.id };    
            this.$req.get(MessageApi.getRecordDetail, data).then(res => {
                if (res.resultCode === 1) {
                    this.show = true;
                    this.topDetail = res.value ? res.value : {};
                    this.middleDetail = this.topDetail.itemInfoList[0] ? this.topDetail.itemInfoList[0] : [];
                    // 日期比较
                    this.dateCompare = Date.parse(new Date()) > Date.parse(this.middleDetail.auditTime) ? 'yes' : 'no';
                    // 奖罚类型匹配
                    this.rewardList.map(child => {
                        if(this.topDetail.rewardType === child.value) {
                            this.topDetail.rewardName = child.label;
                        }
                        return child;
                    })
                    this.recordId = this.id;
                } else {
                    return
                }
            })
        },
        // 获取留言列表
        getLeaveMessage () {
            var data = {
                recordId: this.id,
                schoolCode: this.schoolCode,
            };
            this.$req.get(MessageApi.leaveMessgeList, data).then(res => {
                if(res.resultCode == 1) {
                    this.leaveMessageList = res.value ? res.value : [];
                }                                
            });
        },
        /**
       * 组件音频播放
       */
        handlerAudioClick(item,index) {
            console.log(item,index,'audio')
            this.audioPlay = !this.audioPlay
            // this.taskAudios.forEach((itm,inx) => {
            //     if(index === inx) {
            //         this.$set(itm, 'audioPlay', !item.audioPlay)
            //     }else {
            //         this.$set(itm, 'audioPlay', false)
            //     }
            // })
        },
        // 视频播放
        toVideo(src){
            this.$router.push({
                path: '/fullScreenVideo',
                query:{
                    src
                }
            })
        },
        // 留言
        openLeaveMessage (leaveId) {
            if (leaveId === this.loginId) {                
                this.leaveVisible = true; 
                this.personId = this.loginId;  
            } else {
                this.$toast('当前留言的学生账号与登录账号不匹配！');
            }
        },
        closeLeaveMessage: function (childValue) {
            this.leaveVisible = childValue;            
            setTimeout(
                this.getDetail(),
                this.getLeaveMessage(),
             1000);
        },
        // 回复
        openReply (replyId, feedbackId) {
            if (replyId === this.loginId) {                
                this.replyVisible = true; 
                this.personId = this.loginId;  
                this.feedbackId = feedbackId;
            } else {
                this.$toast('当前回复的教师账号与登录账号不匹配！');
            }
        },
        closeReply: function (childValue) {
            this.replyVisible = childValue;
            setTimeout(
                this.getDetail(),
                this.getLeaveMessage(),
            1000);
        },
        // 撤销评价记录        
        async undoRecord () {
            const res = await this.$req.put(PjApi.undoRecord + this.id);
            if (res.resultCode == 1) {
                this.$toast('撤销成功');
                this.$refs.confirm._hide();
                this.$root.eventHub.$emit('closeDetailModal');
                // Promise.all([p1(), p2 ? p2() : null]).then(() => {
                // }).catch((error) => {
                //     console.log(error);
                // });
            } else {
                this.$toast('该记录不可撤销')
                this.$refs.confirm._hide();
                return false;
            }
        },
        // 是否撤销评价记录
        revokeRecord (id) {
            this.recordId = id;
            this.$refs.confirm._show();
        },
        // 班级撤销评价提示语
        getClassRevokeTip (type) {
            this.tip = `撤销后该记录在教师端/学生端都不显示，${type == 2 ? '班级' : '学生'}增加/减少的分数或者勋章原路返回`;
        },
         //苹果播放audio
        iosPlayAudio(){
            console.log(this.$refs)
            this.$refs.audio.play()
        },
        // 语音转文字
        transfer () {
            this.textVisible = true;
            console.log("123456", this.textVisible);
        }
    }
}
</script>

<style lang="less" scoped>
.show-none {
    display: none;
}
// 有详情记录
.record-detail {
    width: 100%;
    height: 100%;
    font-family: PingFang SC;
    background-color: #fff;
    position: absolute;
    overflow-y: scroll;
    overflow-x: hidden;  

    .top {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: .56rem 0;
        position: relative;

        .medal {
            width: 1.07rem;
            height: 1.07rem;
            margin-right: .27rem;
        }
        .score {
            color: #262727;
            font-size: 0.85rem;
            font-family: ALIBABA Font;
            font-weight:  bold;
            line-height: 0.85rem;
        }
        .take-effect {
            width: 1.6rem;
            height: 1.6rem;
            position: absolute;
            right: .43rem;
        }
    }

    .middle {
        padding: 0 .43rem;
        display: block;        

        .personal {
            font-size: .32rem;
            color: #B6B8B8;
            padding-bottom: .27rem;
            border-bottom: .04rem solid #EFF1F3;

            .name-time {
                display: flex;
                justify-content: space-between;
                align-items: center;       
                margin-bottom: .16rem;                  
            }

            .name {
                color: #262727;
                font-size: .48rem;
                font-weight: bold;
                line-height: .48rem;
            }

            .time {
                font-size: .37rem;
                font-family: ALIBABA Font;
            }
        }

        .sketch {
            display: block;
            color: #262727;
            font-size: .37rem;
            padding: .21rem 0;

            .sketch-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: .08rem 0;
            }

            .small-title {
                color: #969899;
            }
        }   
        
        .information {
            display: block;
            color: #262627;
            font-size: .37rem;

            .describe {
                margin: .32rem 0 .53rem;
            }

            .voice {
                display: block;

                .audio {
                    width: 100%;
                    height: 1.17rem;
                }

                .transfer-btn {
                    background-color: transparent;
                    position: relative;
                    top: -1.13rem;
                    right: .53rem;
                    float: right;
                    font-size: 0.37rem;
                    color: #168DFF;
                }
                .transfer-text {                    
                    font-size: 0.37rem;
                    font-weight: 500;
                    color: #292D33;
                }
            }

            .imgList {
                display: inline-block;
                flex-wrap: wrap;
                margin-right: -0.56rem;
                padding: .53rem 0 .2rem;

                .img-item {
                    width: 2.67rem;
                    height: 2.67rem;
                    border-radius: .2rem;
                    position: relative;
                    margin: 0 .56rem .27rem 0;
                    float: left;

                    .img-detail {
                        width: 100%;
                        height: 100%;
                        border-radius: .24rem;
                    }
                }

                video {
                    border-radius: .24rem;
                }

                .player-btn {
                    height: 1.33rem;
                    width: 1.33rem;
                    z-index: 999;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%,-50%);
                }
            }            
        }
    }

    .footer {
        width: 100%;
        display: block;
        text-align: center;

        .btn {
            width: 4.26rem;
            height: 1.17rem;
            border: .02rem solid #168DFF;
            border-radius: .55rem;
            color: #168DFF;
            font-size: .42rem;
            background-color: #fff;
            margin-bottom: .27rem;
        }

        .leaveMessage-reply {
            border-top: .27rem solid #EFF1F3;            
            padding: .53rem .37rem .26rem;

            .teacher {
                display: flex;
                justify-content: start;
                align-items: start;

                .portrait {
                    position: relative;
                    margin-right: .27rem;
                }

                .message {                      
                    flex: 1;       
                    text-align: left;   
                    color: #292D33;  
                    font-size: .37rem;

                    .name {
                        color: #262627;
                        font-size: .43rem;  
                        font-weight: 800;
                    }

                    .already-read {
                        color: #B6B8B8;
                        display: flex;   
                        justify-content: start;
                        align-items: center;                     
                        padding: .35rem 0 .27rem;
                        
                        .sign {
                            width: .33rem;
                            height: .33rem;
                            padding: .05rem .13rem 0;
                        }
                    }

                    .reply-btn {
                        color: #168DFF;
                        font-size:0.37rem;
                        font-weight:500;
                        background: transparent;
                        padding: .27rem 0;
                    }
                }
            }          
            
            .student {
                display: block;
                text-align: left;
                font-weight: 500;

                .line {
                    font-size: .37rem;
                    font-weight: bold;
                    padding-bottom: .16rem;
                }
            }            
            /* 学生老师公共样式 */
            .leave-message {
                color: #292D33;
                font-size: .37rem;                    
            }

            .line {
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                padding-bottom: .16rem;
            }

            .time {
                font-size: .37rem;
                font-family: ALIBABA Font;
                font-weight: 400;
                color: #AEB6C1;
            }

            .reply {
                font-size: 0.37rem;
                color: #292d33;
                font-weight: 500;
                position: relative;
                margin: 0.27rem 0;
                padding-left: 0.27rem;
                border-left: 0.06rem solid #168dff;

                .content {
                    line-height: 0.59rem;
                    color: #AEB6C1;
                }
            }            
        }
    }     
}
</style>
