<template>
    <div class="task">
        <div class="subTaskBox">
            <div class="tit">{{curClassTask.className}} 任务完成情况</div>
            <div class="info"><span>参与度: 占涉及班级人数{{curClassTask.percentParticipate}}%</span><span>完成度: 占涉及班级人数{{curClassTask.percentComplete}}%</span></div>
        </div>
        <div class="detailInfoBox">
            <div class="tit">完成详情</div>
            <table cellspacing="0" cellpadding="0" class="taskClassTable">
                <tr><th style="width:25%">学生姓名</th><th style="width:65%">参与任务</th><th style="width:20%">完成度</th></tr>
                <tr v-for="(item,index) in studentList">
                    <td>{{item.studentName}}</td>
                    <td :class="{'mult':item.subTaskNames.length>1}">
                        <div class="subTaskName" v-for="(sitem,sindex) in item.subTaskNames">{{sitem}}</div>

                        <div class="noTask" v-if="item.subTaskNames.length==0">
                            未领取
                        </div>

                    </td>
                    <td>
                        <span v-if="item.percentComplete!=-1">{{item.percentComplete}}%</span>
                        <span v-if="item.percentComplete==-1">--</span>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import {RewardTaskApi as API} from '@/utils/api'
export default {
    data(){
        return {
            curClassTask:{},
            curTask:{},
            studentList:[],
        }
    },
    mounted(){
        this.init();
    },
    methods:{
        init(){
            this.curClassTask = JSON.parse(window.sessionStorage.getItem('curClassTask'))
            this.curTask = JSON.parse(window.sessionStorage.getItem("curTask"));
            this.getDetailList();
        },
        async getDetailList(){
            let params = {};
            params.id = this.curTask.categoryId;
            params.classId = this.curClassTask.classId;
            let res = await this.$req.get(API.classStatisticsDetail,params);
            if(res.resultCode==1){
                this.studentList = res.value
            }
        },
    }
}
</script>

<style lang='less' scoped>
.task{
    width: 100%;
    height: 100%;
    overflow: auto;
    background: #FFF;
}
.subTaskBox{
    padding: 32px;
    .tit{
        font-size: 36px;
        color: #292D33;
        font-weight: 700;
    }
    .info{
        margin-top: 20px;
        font-size: 28px;
        color: #AEB6C1;
        span{
            margin-right: 40px;
        }
    }
}
.detailInfoBox{
    padding: 32px;
    .tit{
        font-size: 36px;
        color: #292D33;
        font-weight: 700;
    }
}
.taskClassTable{
    width: 100%;
    margin-top: 20px;
    table-layout: fixed;
    th,td{
        border: none;
        border-collapse: collapse;
        font-size: 28px;
    }
    th{
        background: #EFF1F3;
        height: 60px;
        line-height: 60px;
        color: #262727;
        text-align: left;
        padding-left: 15px;
    }
    td{
        line-height: 30px;
        padding: 25px 0;
        padding-left: 15px;
        border-bottom: 1px solid #EFF1F3;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    td.mult{
        // padding: 0px 0;
        padding-top: 0;
        padding-bottom: 0;
    }
    .opt{
        color: #168DFF;
    }
    .subTaskName{
        width: 90%;
        padding: 20px 0 20px 20px;
        border-bottom: 1px solid #EFF1F3;
    }
    .noTask{
        padding-left: 20px;
        color: #b2b2b2;
    }
    .subTaskName:last-child{
        border-bottom: none;
    }
}
</style>