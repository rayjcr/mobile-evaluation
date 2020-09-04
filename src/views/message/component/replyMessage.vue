<template>
        <div class="reply-dialog">
            <div class="header">
                <button class="cancel-btn" @click="closeReply">取消</button>
                <span class="title">回复</span>
                <button class="submit-btn" @click="replySubmit">提交</button>
            </div>
            <div class="box">
                <div class="top">
                    <span class="small-title">回复内容</span>
                    <span class="limit">{{ message.length }}/100</span>
                </div>
                <textarea
                    v-model="message"
                    placeholder="请输入内容"
                    class="content"
                    maxlength="100"
                ></textarea>
            </div>
        </div>
</template>

<script>
import { MessageApi } from '@/utils/api';
import Axios from 'axios';

export default {
    props: {
        visible: Boolean,
        recordId: String,
        teacherId: String,
        feedbackId: String,
        studentId: String,
    },
    data () {
        return {
            popupVisible: false,
            message: '',
        }
    },
    watch: {
        visible: {
            handler (newVal, oldVal) {
                this.popupVisible = newVal;
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        // 关闭
        closeReply() {
            this.popupVisible = false;
            this.$emit("closeReply", false);
        },
        // 提交
        async replySubmit () {
            let formData = new FormData();
            formData.append('recordId', this.recordId);
            formData.append('teacherId', this.teacherId);
            formData.append('feedbackId', this.feedbackId);
            formData.append('content', this.message);
            formData.append('schoolCode', this.$cookie.get('xxdm'));
            console.log("回复回复=", formData);
            this.$req.post(MessageApi.teacherReply, formData, null).then(res => {
                if (res.resultCode == 1) {
                    this.$toast('回复成功！')
                } else {
                    this.$toast('只能对自己的评价回复!')
                    return false;
                }
            });  
            this.closeReply();
        },
    }
}
</script>

<style lang="less">
.reply-dialog {
    display: block;
    font-family: PingFang SC;
    padding: 0.27rem 0.43rem;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 1.2rem;
        font-size: 0.43rem;

        .cancel-btn {
            height: 0.59rem;
            color: #dadfe6;
            background: transparent;
            text-align: left;
            margin-left: 0.42rem;
        }
        .title {
            color: #262627;
            font-size: 0.48rem;
            font-weight: 800;
            text-align: center;
        }
        .submit-btn {
            height: 0.59rem;
            color: #168dff;
            background: transparent;
            text-align: right;
            margin-right: 0.42rem;
        }
    }

    .box {
        font-size: 0.37rem;
        color: #262627;

        .top {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .small-title {
                font-weight: 800;
            }

            .limit {
                font-family: ALIBABA Font;
                color: #dadfe6;
            }
        }

        .content {
            min-width: 8.55rem;
            min-height: 2.77rem;
            padding: 0.16rem 0.27rem;
            border: 0.01rem solid #d5d8d8;
            margin-top: 0.27rem;
        }
    }
}
</style>