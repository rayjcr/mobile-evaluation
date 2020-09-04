<template>
    <div class="task">
        <div class="subTaskBox">
            <div class="tit">{{curTask.subTaskName}} 任务完成情况</div>
            <div class="info">
            <span>参与度: 占涉及班级人数{{curTask.percentParticipate}}%</span>
            <span>完成度: 占涉及班级人数{{curTask.percentComplete}}%</span></div>
        </div>
        <div class="detailInfoBox">
            <div class="tit">完成详情</div>
            <table cellspacing="0" cellpadding="0" class="taskClassTable">
                <tr><th style="width:30%">班级</th><th style="width:20%">参与度</th><th style="width:20%">完成度</th><th style="width:30%">操作</th></tr>
                <tr v-for="(item,index) in taskClassList">
                    <td :class="{'master':checkMaster(item)}">{{item.className}}</td>
                    <td>{{item.percentParticipate}}%</td>
                    <td>{{item.percentComplete}}%</td>
                    <td><span class="opt" @click="checkDetail(item)">审核/查看</span></td>
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
            taskClassList:[],
            classMasterList:[],
            // subTaskList:[],
        }
    },
    mounted(){
        this.init();
    },
    methods:{
        async init(){
            // 获取缓存中的当前子任务的对象
            this.curClassTask = JSON.parse(window.sessionStorage.getItem('curClassTask'))
            // this.curTask = JSON.parse(window.sessionStorage.getItem("curTask"));
            this.curTask = await this.getCurTaskInfo();
            await this.getClassMasterList();
            await this.getTaskDetail();
            
        },
        /**
         * 获取当前子任务的统计信息
         * 1.获取当前主任务下 子任务列表
         * 2.查询当前子任务id返回子任务统计信息
         */
        async getCurTaskInfo(){
            let params = {};
            params.id = this.curClassTask.categoryId;
            let res = await this.$req.get(API.taskStatistics,params);
            if(res.resultCode==1){
                let subTaskList = res.value;
                return _.find(subTaskList,{"subTaskId":this.curClassTask.id})
            }else{
                return false
            }
        },
        /**
       * 获取班主任列表
       */
      async getClassMasterList(){
        let params = {};
        params.schoolCode = this.$cookie.get('xxdm');
        params.teacherCode = this.$cookie.get('userId');
        /// 老OA接口没有 resultCode 状态码所以用try catch获取下返回值
        try{
          let res = await this.$req.get(API.getClassTeacherClassList,params)
          this.classMasterList = res;
        }catch(data){
          this.classMasterList = data;
        }
      },
        /***
         * 获取当前子任务的明细统计
         */
        async getTaskDetail(){
            let params = {};
            params.id = this.curClassTask.id;
            let res = await this.$req.get(API.taskStatisticsDetail,params);
            if(res.resultCode==1){
                this.taskClassList = res.value;
                this.taskClassOrderByMaster(this.taskClassList);
            }
        },
        checkMaster(item){
            return _.find(this.classMasterList,{"classId":item.classId}) ? true : false
        },
        /**
         * 重组子任务班级列表 按照班主任优先排列
         */
        taskClassOrderByMaster(list){
            console.log(list,"排序List")
            let TempArr = [];
            for(let i=0;i<list.length;i++){
                if(this.checkMaster(list[i])){
                    TempArr.unshift(list[i]);
                }else{
                    TempArr.push(list[i]);
                }
            }
            this.taskClassList = TempArr;
        },
        checkDetail(item){
            console.log(item,"item,11111")
            this.$router.push({'path':'/SubTaskDetail', query: {subTaskId:this.curClassTask.id,componentName:'teacherDetail',classId:item.classId}})
        }
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
            margin-bottom: 10px;
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
        line-height: 40px;
        padding: 40px 0;
        padding-left: 15px;
        border-bottom: 1px solid #EFF1F3;
        position: relative;
    }
    .master:after{
        content: '班主任';
        font-size: 24px;
        color: #FFF;
        line-height: 44px;
        text-align: center;
        width: 116px;
        height: 44px;
        background: url(../../img/masterbg.png) no-repeat center center;
        background-size: 100% 100%;
        position: absolute;
        z-index: 1;
        right: 0;
        top: 2px;
    }
    .opt{
        color: #168DFF;
    }
}
</style>