<template>
  <div class="stuUncollected">
    <div class="title">任务内容</div>
    <div class="detail" v-html="task.summary"></div>
    <div class="receivebtn" @click="addSubTask">
      领取
    </div>
    <!--评价成功提示-->
    <v-modal-success ref="success" :tip="'领取成功'" :type="1" @jumpToPath="jumpTo('/SubTaskDetail?componentName=stuReceived',{subTaskId:task.id})"></v-modal-success>
  </div>
</template>

<script>
  import {RewardTaskApi as API} from '@/utils/api'
  import Modal from '@/components/modal/Modal_receive.vue'
  export default {
    name: "StuUncollected",
    props:['task'],
    components: {
      'v-modal-success': Modal,
    },
    mounted() {
      this.init();
    },
    data(){
      return {  
        classCode: this.$cookie.get('classCode'),
        gradeId: this.$cookie.get('gradeId'),
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),
        userName: this.$cookie.get('name'),
      }
    },
    methods:{
      init(){  
        // this.$nextTick(() => {
        //   this.$refs.success.hideModal();
        // })
      },
      // 领取任务
      async addSubTask(){
        var data = {
          classCode: this.classCode,
          evaluationCategoryId: this.task.categoryId,
          evaluationId: this.task.id,
          gradeCode: this.gradeId,
          schoolCode: this.xxdm,
          studentId: this.userId,
          studentName:this.userName,
        }
        var res = await this.$req.post(API.joinSubTask,data);
        if(res.resultCode==1){
          this.showModal();
        }else{
          this.$toast(res.resultMessage);
        }
      },
      showModal(){
        this.$refs.success.showModal();
      },
      jumpTo(path,query){
        this.$router.replace({path,query})
      }
    },
  }
</script>

<style scoped lang="less">
  .stuUncollected{
    // height: 100%;
    background-color: #fff;
    padding: 40px 32px;
    padding-bottom: 100px;
    .title{
      font-size:36px;
      font-weight:bold;
      color:rgba(41,45,51,1);
      margin-bottom: 40px;
    }
    .detail{
      font-size:28px;
      font-weight:400;
      word-break: break-all;
      // color:rgba(174,182,193,1);
      /deep/ img{
        width: 100%;
        height: auto;
        margin: 40px 0;
      }
      /deep/ video{
        width: 100%;
        height: auto;
      }
    }
    .receivebtn{
      width:320px;
      height:88px;
      background:rgba(255,182,0,1);
      border-radius:44px;
      font-size:32px;
      font-weight: 400;
      line-height: 88px;
      text-align: center;
      color: #fff;
      position: fixed;
      bottom: 20px;
      left: 50%;
      margin-left: -160px;
      // transform: translateX(-50%);
    }
  }
</style>
