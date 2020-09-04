<template>
    <div class="class-task scrollY">
        <div class="navbar">
            <div class="navbar-title" v-if="source != 1">任务发布审核</div>
            <div class="navbar-title navbar-title-hide" v-if="source == 1"></div>
            <mt-navbar v-model="selected" class="mtnavbar">
                <mt-tab-item id="1"><span class="selectbar">待审核</span></mt-tab-item>
                <mt-tab-item id="2" class="selectbar"><span class="selectbar">已审核</span></mt-tab-item>
            </mt-navbar>
        </div>
        <div class="task-content" v-if="checkData.length">
            <div class="task-item flex" v-for="(item,index) in checkData" :key='index'>
                <div class="check-circle" :class="{'checked': item.checked}" @click="checkIcon(index)" v-if="selected == 1"></div>
                <div class="info" :style="selected == 2? 'width:100%': ''">
                    <div class="flex justifySpaceBetween">
                        <div class="flex">
                            <div class="avatar">
                                <img :src="sex==1?'../../../static/img/boy@2x.png':'../../../static/img/girl@2x.png'" alt="">
                            </div>
                            <div class="title">{{item.staffName}}的任务</div>
                        </div>
                        <div class="status" v-if="item.auditStatus == 1">待审核</div>
                        <div class="status pass-status" v-if="selected == 2 && item.auditStatus == 2">已通过</div>
                        <div class="status nopass-status" v-if="selected == 2 && item.auditStatus == 2">未通过</div>
                    </div>
                    <div class="desc item">{{item.name}}</div>
                    <div class="item" v-if="item.startTime">
                        <span class="type">时间: </span>
                        {{item.startTime.substr(0,10) + ' - '+item.endTime.substr(0,10)}}
                    </div>
                    <div class="item">
                        <span class="type">频次: </span>
                        {{item.frequencyName || '暂无'}}
                    </div>
                    <div class="item">
                        <span class="type">奖励: </span>
                        {{item.scoreName}}
                    </div>
                    <div class="item">
                        <span class="type">维度: </span>
                        {{item.dimensionName}}
                    </div>
                    <div class="item" v-if="selected == 2 && item.reason">
                        <span class="type">原因: </span>
                        {{item.reason}}
                    </div>
                </div>
            </div>
        </div>
        <div class="task-content" v-if="checkData.length == 0">
            <div class="empty">
                暂无数据
            </div>
        </div>
        <div v-if="selected == 1 && checkData.length" class="footer flex justifySpaceBetween">
            <div class="flex alignCenter">
                <div class="check check-circle" :class="{'checked': allChecked}" @click="checkIcon('all')"></div>
                <div>全选</div>
            </div>
            <div class="btn" @click="submitCheck">审核</div>
        </div>
        <van-popup 
            v-model="isShowPopup" 
            closeable
            round 
            class="modal"
            :style="isShowRemark?'height: 45%;':'height: 30%;'">
            <div style="width: calc(100vw - 60px);">
                <div class="modal-head">发布任务审核</div>
                <div class="modal-body" :style="isShowRemark?'height: calc(55vh - 134px);':'height: calc(30vh - 68px);'">
                    <div class="modal-content">
                        <div :class="isPass == 2?'modal-btn pass-active' : 'modal-btn'" @click="pass(2)">通过</div>
                        <div :class="isPass == 3?'modal-btn no-pass-active':'modal-btn no-pass'" @click="pass(3)">不通过</div>
                    </div>
                    <div class="modal-remark" v-if="isShowRemark">
                        <div class="remark-title">具体原因</div>
                        <van-field
                            v-model="remark"
                            rows="4"
                            autosize
                            type="textarea"
                            maxlength="100"
                            placeholder="请输入备注内容"
                            show-word-limit>
                        </van-field>
                    </div>
                </div>
                <div class="modal-foot flex">
                    <div class="foot-btn cancel-btn" @click="isShowPopup = false">取消</div>
                    <div class="foot-btn confirm-btn" @click="submit">提交</div>
                </div>
            </div>
        </van-popup>
    </div>
</template>
<script>
import { teacherCheckTask } from "@/utils/api";
export default {
    name: 'taskPublishCheck',
    data(){
        return {
            xxdm: this.$cookie.get('xxdm'),
            teacherId: this.$cookie.get('userId'),
            selected: '1',
            allChecked: false,
            isShowPopup: false,     //是否显示审核验证弹框
            isShowRemark: false,    //弹框中是否显示不通过的备注内容
            isPass: 0,              //审核是否通过， 0未选，2通过，3不通过
            remark: '',             //备注
            checkData: [],          //全部任务
            sex: '',
            checkList: [],      //选中的未审核任务
            source: '',         //来源  1：app   2:微信   3：钉钉   4:其他
        }
    },
    watch:{
        selected: function (val) {
            this.getData(val)
        },
        isShowPopup: function (value) {
            /**
             * lr
             * 当关闭弹框后，将审核是否通过字段设置为初始值0
             */
            if(!value){
                this.isPass = 0;
            }
        }
    },
    methods:{
        /**
         * lr 
         * 弹框中的是否通过审核事件
         * type 1:通过审核   2：不通过审核
         * 只有在不通过审核的情况下才显示备注输入框
         */
        pass(type){
            this.isPass = type;
            if(type==3){
                this.isShowRemark = true;
            }else{
                this.isShowRemark = false;
            }
        },
        //获取未审核和已审核的数据
        getData(type){
            let data={
                schoolCode: this.xxdm,
                teacherId: this.teacherId,
            }
            if(type == 1){
                this.$req.get(teacherCheckTask.taskPendingList, data).then((res)=>{
                    if(res.resultCode == 1){
                        //处理每一次的频次和奖励
                        this.checkData = this.handleFrequencyAward(res.value)
                    }
                })
            }else{
                this.$req.get(teacherCheckTask.taskAuditedList, data).then((res)=>{
                    if(res.resultCode == 1){
                        //处理每一次频次和奖励
                        this.checkData = this.handleFrequencyAward(res.value)
                    }
                })
            }
            console.log(this.checkData)
        },
        //处理频次和奖励
        handleFrequencyAward(data){
            data.forEach((item)=>{
                //处理频次
                if(item.evaluationItemRuleFrequency && item.evaluationItemRuleFrequency.type){
                    let freType = item.evaluationItemRuleFrequency.type
                    //类型 1.仅一次 2.每天 3.每周 4.每月 5.每学期
                    let frequencyName = ''
                    switch(freType){
                        case 1:
                            frequencyName = '仅一次'
                            break;
                        case 2:
                            frequencyName = '每天'+ item.evaluationItemRuleFrequency.count + '次'
                            break;
                        case 3:
                            frequencyName = '每周'+ item.evaluationItemRuleFrequency.count + '次'
                            break;
                        case 4:
                            frequencyName = '每月'+ item.evaluationItemRuleFrequency.count + '次'
                            break;
                        case 5:
                            frequencyName = '每学期'+ item.evaluationItemRuleFrequency.count + '次'
                            break;
                    }
                    item.frequencyName = frequencyName
                }
                //处理奖励
                if(item.evaluationItemRuleScoreList && item.evaluationItemRuleScoreList.length){
                    let arr = item.evaluationItemRuleScoreList;
                    let scoreName = ''
                    arr.forEach((item)=>{
                        //类型：1.每次 2.全部完成
                        if(item.type == 1){
                            scoreName = '每次 ' + item.score
                        }else{
                            scoreName = '全部完成 ' + item.score
                        }
                        //奖惩类型：1.分数 2.勋章 ,
                        if(item.rewardType == 1){
                            scoreName = scoreName + ' 分 '
                        }else{
                            scoreName = scoreName + ' 勋章 '
                        }
                    })
                    item.scoreName = scoreName;
                }
                item.checked = false
            })
            return data
        },
        //处理选中事件
        checkIcon(val){
            /**
             * 选中分2种，1是全选  2单选
             * 1：全选，点击全选时，要么全部选中要么全部不选中
             * 2：单选：将当前下标的的变量对应的那一项的checked改成与全选按钮allChecked相反的值，
             * 同时循环整个数组，判断是否全部选中，来给全选按钮
             */
            if(val == 'all'){
                this.allChecked = !this.allChecked;
                this.checkData.forEach((item)=>{
                    item.checked = this.allChecked
                })
            }else{
                this.checkData[val].checked = !this.allChecked
                let flag = true
                this.checkData.forEach((item)=>{
                    if(!item.checked){
                        flag = false;
                    }
                })
                this.allChecked = flag;
            }
        },
        //提交审核
        submitCheck(){
            let flag = false
            let list = []
            //设置标志位，判断是否选中至少一个任务，是：过滤所以选中的任务同时弹出是否通过的弹框；否：提示请选择任务
            this.checkData.forEach((item)=>{
                if(item.checked){
                    flag = true;
                    list.push({
                        recordId: item.id,
                    })
                }
            })
            if(flag){
                this.isShowPopup = true;
                this.checkList = list;
            }else{
                this.$toast('请先选择任务')
            }
        },
        //最终提交
        submit(){
            if(this.isPass == 0){
                this.$toast('选择是否通过');
                return false
            }
            //处理最终提交任务审核的数据，当审核状态为不通过的时候，添加不通过原因，审核状态为通过的时候，将原因置空
            this.checkList.forEach((item)=>{
                item.auditStatus = this.isPass;
                if(this.isPass == 3 && this.remark){
                    item.reason = this.remark;
                }else{
                    item.reason = ''
                }
            })
            let data = {
                schoolCode: this.xxdm,
                teacherId: this.teacherId,
                list: this.checkList
            }
            this.$req.post(teacherCheckTask.taskAuditList, data).then((res)=>{
                if(res.resultCode == 1){
                   this.$toast(res.value)
                   this.isShowPopup = false;
                   this.getData(1)
                }
            })
        },
        //判断页面来源
        getOrigin(){
            let self = this;
            let origin = this.$route.query.type || window.sessionStorage.getItem('origin') || ''; // 是否来源于微信公众号 1,公众号；3，企业号 2钉钉
            try{
                if (typeof(nativeJS) != "undefined"){
                    //走 app
                    return 1
                } else if(getIsWxClient()) { // 微信公众号，企业号
                    //微信来源
                    return 2
                } else if(origin && origin == 2) { // 钉钉
                    //钉钉来源
                    return 3
                }else {
                    return 4
                    // self.$toast('当前环境不支持扫一扫')
                }
            } catch(e){
                self.$toast(JSON.stringify(e))
            }
            /**
             * 判断是否是微信环境
             */
            function getIsWxClient() {
                var ua = navigator.userAgent.toLowerCase();
                // var origin = this.$route.query.type || ''; // 是否来源于微信公众号 1,公众号；3，企业号
                var origin = self.$route.query.type || self.$cookie.get('origin') || ''
                if (ua.match(/MicroMessenger/i) == "micromessenger" && origin && (origin == '1' || origin == '3')) {
                return true;
                }
                return false;
            }
        },
    },
    mounted(){
        this.source = this.getOrigin()
        this.getData(1);
        this.sex = this.$cookie.get('sex') || 1
    }
}
</script>
<style lang="less" scoped>
    .class-task{
        height: 100%;
        .navbar{
            position: fixed;
            top: 0;
            left: 0;
            z-index: 100;
            width: 100%;
            height: 148px;
            margin: 0 auto;
            background-color: #FFFFFF;
            .navbar-title{
                font-size: 30px;
                text-align: center;
                font-weight: 600;
                color: #262626;
            }
            .navbar-title-hide{
                height: 30px;
            }
            .mtnavbar {
                width: 430px;
                height: 68px;
                margin: 10px auto;
                background: rgba(239, 241, 243, 1);
                border-radius: 34px;
                color: rgba(182, 184, 184, 1);
                .selectbar {
                    font-size: 30px;
                    font-weight: bold;
                    line-height: 32px;
                }
                .mint-tab-item {
                    margin: 0;
                    line-height: 34px;
                }
                .is-selected {
                    width: 216px;
                    color: #fff;
                    background: rgba(51, 165, 255, 1);
                    opacity: 1;
                    border-radius: 34px;
                }
            }
        }
        .task-content{
            padding: 170px 32px 0;
            .empty{
                color: #AEB6C1;
                text-align: center;
            }
            .task-item{
                background: #FFFFFF;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
                .info{
                    width: 87%;
                }
                .avatar{
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    img{
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                    }
                }
                .title{
                    color: #292D33;
                    font-size: 30px;
                    font-weight: 600;
                    line-height: 80px;
                    padding-left: 20px;
                }
                .item{
                    padding-top: 10px;
                }
                .desc{
                    color: #292D33;
                    font-weight: 600;
                }
                .type{
                    color: #AEB6C1;
                    font-size: 20px;
                }
                .status{
                    color: #FFB600;
                    font-weight: 600;
                    line-height: 80px;
                }
                .pass-status{
                    color: #00CD86;
                }
                .nopass-status{
                    color: #FF7B12;
                }
            }
            .task-item:last-child{
                margin-bottom: 120px;
            }
        }
        .footer{
            background: #fff;
            position: fixed;
            bottom: 0;
            width: 100%;
            height: 100px;
            line-height: 100px;
            align-items: center;
            .check{
                margin-left: 32px;
            }
            .btn{
                background: #168DFF;
                color: #ffffff;
                margin-right: 32px;
                padding: 0 120px;
                border-radius: 40px;
                height: 80px;
                line-height: 80px;
                cursor: pointer;
            }
            .disable{
                background: #6EBFFF;
                color: #ffffff;
            }
        }
        .check-circle {
            position: relative;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            transform: scale(0.5);
            transform-origin: 0 center;
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
        .modal{
            .modal-head{
                padding: 10px 0;
                text-align: center;
                border-bottom: 1px solid #EFF1F3;
                font-size: 30px;
                font-weight: 600;
            }
            .modal-body{
                .modal-content{
                    padding: 20px 0;
                }
                .modal-btn{
                    width: 80%;
                    margin: 20px auto 0;
                    text-align: center;
                    background: #E9F5FF;;
                    padding: 20px 0;
                    border-radius: 50px;
                    color: #168DFF;
                }
                .modal-remark{
                    width: 80%;
                    margin: 0 auto;
                    .remark-title{
                        color: #292D33;
                        font-weight: 600;
                    }
                }
                .no-pass {
                    background: #FFF4EB;
                    color: #FF7B12;
                }
                .pass-active{
                    background: #168DFF;
                    color: #FFFFFF;
                }
                .no-pass-active{
                    background: #FF7B12;
                    color: #FFFFFF;
                }
            }
            .modal-foot{
                border-top: 1px solid #EFF1F3;
                .foot-btn{
                    height: 68px;
                    width: 50%;
                    text-align: center;
                    line-height: 68px;
                }
                .cancel-btn{
                    border-right: 1px solid #EFF1F3;
                    color: #B6B8B8;
                }
                .confirm-btn{
                    color: #168DFF;
                }
            }
        }
    }
</style>