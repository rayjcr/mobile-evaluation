<template>
  <div class="submitform">
    <div class="formitem">
      <div class="label flex justifySpaceBetween">
        <span class="title">文字内容</span>
        <span class="wordCount">{{formData.content.length}}/500</span>
      </div>
      <div class="textarea">
        <textarea maxlength="500" style="width: 100%;" v-model="formData.content" placeholder="请输入内容" cols="45" rows="10"></textarea>
      </div>      
    </div>
    <div class="addMedia clear">
      <div class="fl mediabox flex alignCenter justifyCenter" v-for="(item,index) in formData.videos" :key="index+9">
        <div class="del-img-btn" @click="delVideo">
          <img src="@/assets/img/del.png">
        </div>
        <div class="play-btn" v-if="item.progress == '100.00%' || typeof(item.progress)=='undefined'" @click="toVideo(item.absolutePath)"></div>
        <video :controls="false" ref="myVideo" v-show="(item.progress == '100.00%' || typeof(item.progress)=='undefined' )&& item.absolutePath!=''">
          <source :src="item.absolutePath"></source>
        </video>
       <div class="progress-box" :style="{'height': item.progress}" v-show="item.progress != '100.00%' && typeof(item.progress)!='undefined'"></div>
        <div class="progress-num" v-show="item.progress != '100.00%' && typeof(item.progress)!='undefined'">{{item.progress}}</div>
      </div>
      <div class="fl mediabox flex alignCenter justifyCenter" v-for="(item,index) in formData.imgs" :key="index">
        <div class="del-img-btn" @click="delImg(index)" v-if="item.absolutePath">
          <img src="@/assets/img/del.png">
        </div>
        <img class="img" v-gallery :src="item.absolutePath">
        <div class="progress-box" :style="{'height': item.progress}" v-show="item.progress != '100.00%'"></div>
        <div class="progress-num" v-show="item.progress != '100.00%'">{{item.progress}}</div>
      </div>
      <div class="fl mediabox addimg flex flex-column alignCenter justifyCenter" @click="upload" v-show="formData.imgs.length < maxNumber">
        <span>添加照片</span>
      </div>
      <div class="fl mediabox addvideo flex flex-column alignCenter justifyCenter" @click="showModal" v-show="formData.videos.length!=1">
        <span>添加视频</span>
      </div>
    </div>
    <div class="formitem">
      <div class="label">
        <span class="title">添加链接</span>
      </div>
      <div class="link flex alignCenter" v-if="formData.weblinkTitle">
        <div class="linkicon"></div>
        <div class="linktitle flex_1 text-overflow-clamp2">{{formData.weblinkTitle}}</div>
        <div class="del-img-btn" @click="delLink">
          <img src="@/assets/img/del.png">
        </div>
      </div>
      <div class="addlink flex alignCenter" v-else>
        <input type="text" class="flex_1" v-model="formData.weblink" placeholder="输入网址链接" >
        <span class="addbtn" @click="addlink" :class="{'loading':linkloading}">确定</span>        
      </div>
    </div>
    <div class="formitem">
      <div class="line"></div>
    </div>
    <div class="formitem" v-if="isFirstTime">
      <div class="label">
        <span class="title">选择协作人</span>
      </div>
      <ul class="clear stulist">
        <li class="addTeammate fl" @click="addStudent"></li>
        <li class="stu-item fl" v-for="(item,index) in selectedxsList" :key="index">
          <!--判断性别1男2女-->
          <div class="li-top" v-if="item.gender == 1">
            <div class="avatar" v-if="item.icon" :style="{'backgroundImage': 'url('+item.icon+')'}"></div>
            <div class="avatar boy" v-else></div>

            <!--删除-->
            <div class="icon-del" @click="_delStu(index)"></div>
          </div>
          <div class="li-top" v-else>
            <div class="avatar" v-if="item.icon" :style="{'backgroundImage': 'url('+item.icon+')'}"></div>
            <div class="avatar girl" v-else></div>

            <!--删除-->
            <div class="icon-del" @click="_delStu(index)"></div>
          </div>

          <div class="list-bottom text-overflow">{{item.name}}</div>
        </li>
      </ul>
    </div>
    <div class="footer flex justifySpaceBetween">
      <div class="btn cancel" @click="cancel">取消</div>
      <div class="btn submit" :class="{'active':canSubmit}" @click="submit">提交</div>
    </div>
    
    <!-- 上传视频提示 -->
    <confirm ref="tipConfirm" title="提示" msg="仅支持1分钟(50MB)以内视频" :showClose="true">
      <template v-slot:footer>
        <div class="confirmBtn" @click="uploadVideo">已知晓，继续上传</div>
      </template>
    </confirm>
    
    <!--上传图片视频-->
    <v-upload-img ref="upload" :imgs="formData.imgs" :maxNumber="maxNumber" @getUplaodFile="getUplaodFile"></v-upload-img>
    <v-upload-video ref="uploadVideo" :videos="formData.videos" @getUplaodFile="getUplaodVideo" :maxNumber="1"></v-upload-video>
  </div>
</template>

<script>
  import {RewardTaskApi as API} from '@/utils/api'
  import UploadImg from '@/components/UploadImg.vue'
  import uploadVideo from '@/components/UploadVideo.vue'
  import confirm from '../../modal/Confirm.vue'
  export default {
    name: 'StuSubmitTask',
    components: {
      confirm,
      'v-upload-img': UploadImg,
      'v-upload-video': uploadVideo,
    },    
    data(){
      return {
        classCode: this.$cookie.get('classCode'),
        gradeId: this.$cookie.get('gradeId'),
        userId: this.$cookie.get('userId'),
        xxdm: this.$cookie.get('xxdm'),
        formData:{
          content: '',
          weblink: '',
          imgs: [],
          videos: [],
        },
        selectedxsList: [], // 存放被选中的学生列表
        avaliablexsList: [], // 存放可选择的学生列表
        maxNumber: 9,
        isFirstTime: false,// 是否第一次提交
        taskId: '',
        subTaskDetail: null,
        linkloading: false,
        submitUserId:'', //提交人id
        isEdit:false,//是否编辑模式
        submiting: false,//提交中
      }
    },
    mounted() {
      this.init();
    },
    computed:{
      canSubmit(){
        var res = this.formData.content.length>0;
        return res;
      }
    },
    methods:{
      async init(){
        this.taskId = this.$route.query.taskId;
        this.isEdit = this.$route.query.type=='edit' || this.$route.query.type=='reEdit';
        console.log(this.isEdit,"this.isEdit")
        let selectedxsList = sessionStorage.getItem('selectedxsList') || '[]';
        // 获取选中学生列表
        this.selectedxsList = JSON.parse(selectedxsList);
        sessionStorage.removeItem('selectedxsList');
        // 清除可选学生列表
        sessionStorage.removeItem('avaliablexsList');
        this.getFormData();
        await this.getTaskDetail();
        this.getSubmitUserId();
        this.getSubmitInfo();
      },
      // 获取提交人id
      async getSubmitUserId(){
        this.submitUserId = this.$route.query.linkUserId || this.userId;    
      },
      // 提交悬赏任务
      async submit(){
        // console.log(this.submiting,169)
        // 防止多次提交
        if(!this.submiting && this.canSubmit){
          this.submiting = true;
        } else {
          return;
        }
        if(this.isFirstTime){
          // 第一次提交提交协作人
          var res = await this.submitTeammate();
          // console.log(res,"协作人")
          if(!res){
            return;
          }
        }        
        var params = {
          classCode: this.classCode,
          gradeCode: this.gradeId,
          content: this.formData.content,
          evaluationId: this.taskId,
          schoolCode: this.xxdm,
          userId: [this.userId],
          linkUrl: this.formData.weblinkTitle?this.formData.weblink:'',
          linkTitle: this.formData.weblinkTitle||'',
          type: '2'
        }
        // console.log(params,"params--194")
        var pictureIds = this.formData.videos.concat(this.formData.imgs)
        if(this.isEdit){
          this.$set(params,'id',this.formData.id);
          this.$set(params,'fileInfoVOS',pictureIds);

        } else {          
          this.$set(params,'pictureIds',pictureIds);
        }
        // console.log(params,201)
        var res = await this.$req.post(this.isEdit?(this.$route.query.type=='edit'?API.updateInfo:API.evaluationRecodeResubmit):API.save,params);
        this.$toast(res.resultMessage);
        if(res.resultCode==1){
          this.cancel();
        } else {
          this.submiting = false;
        }        
      },
      // 返回
      cancel(){   
        sessionStorage.removeItem('formData');
        this.$router.go(-1);
      },
      // 提交协作人
      async submitTeammate(){
        var params = {
          classCode: this.classCode,
          evaluationCategoryId: this.subTaskDetail.categoryId,
          evaluationId: this.taskId,
          gradeCode: this.gradeId,
          joinType: '1',
          linkUser: [],
          schoolCode: this.xxdm,
          studentId: this.userId,
        }
        // console.log(this.selectedxsList,"this.selectedxsList")
        this.selectedxsList.forEach(e=>{
          params.linkUser.push({
            classCode: this.classCode,
            evaluationCategoryId: this.subTaskDetail.categoryId,
            evaluationId: this.taskId,
            gradeCode: this.gradeId,
            schoolCode: this.xxdm,
            joinType: '2',
            studentId: e.id,
            studentName:e.name
          })
        })
        if(this.selectedxsList.length>0){
          try{
            var res = await this.$req.post(API.addCollaborator,params);
            // console.log(res.resultCode,214)   
            return res.resultCode == 1;
          }catch(err){
            this.submiting = false;
            return false;
          }       
        } else {
          return true;
        }
      },
      // 获取子任务详情
      async getTaskDetail(){
        var subTaskDetail = sessionStorage.getItem('subTaskDetail');
        // console.log(subTaskDetail,11111)
        if(subTaskDetail){
          sessionStorage.removeItem('subTaskDetail');
          this.subTaskDetail = JSON.parse(subTaskDetail);  
        } else {
          var res = await this.$req.get(API.getSubTaskDetail+this.taskId,{});
          // console.log(res.value,222222)
          this.subTaskDetail = res.value;          
        }
        document.title = this.subTaskDetail.name + '-提交任务'
      },
      // 获取提交次数判断是否可以选择协作人
      async getSubmitInfo(){
        var data = {
          classCode: this.classCode,
          evaluationId: this.taskId,
          evaluationObject: 1,
          gradeCode: this.gradeId,
          limit: 10,
          page:1,
          schoolCode: this.xxdm,
          type: '2',
          userId: this.submitUserId
        }
        var res = await this.$req.post(API.getSubmitInfo,data);
        // 是否不允许协作  =  提交次数为0 && 任务本身允许协作
        this.isFirstTime = res.value.totalCount==0 && this.subTaskDetail.totalContributorCount!=null && this.subTaskDetail.totalContributorCount>0;
      },
      async addlink(){
        var reg = new RegExp('^(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
        if(this.formData.weblink==''||this.linkloading){
          return;
        }
        if(reg.test(this.formData.weblink)){
          this.linkloading = true;
          try{    
            const res = await this.$req.get(API.getHttpPageTitle,{url:this.formData.weblink});
            if(res.value){              
              this.$set(this.formData,'weblinkTitle',res.value);
            } else {
              this.$set(this.formData,'weblinkTitle',this.formData.weblink);
              // this.formData.weblink = '';
            }
            this.linkloading = false;                
          }catch(e){
            //TODO handle the exception
            console.log(e,53) 
            this.formData.weblink = '';
            this.linkloading = false;          
          }

        }        
      },
      delLink(){
        this.$set(this.formData,'weblinkTitle',null);
        this.$set(this.formData,'weblink','');
      },
      getFormData(){
        let formData = sessionStorage.getItem('formData');
        console.log(formData,132)
        if(formData){
          if(formData!='undefined'){
            formData = JSON.parse(formData);
            this.$set(this.formData,'content',formData.content||'');
            this.$set(this.formData,'weblink',formData.weblink||'');
            this.$set(this.formData,'weblinkTitle',formData.weblinkTitle||'');
            this.$set(this.formData,'imgs',formData.imgs||[]);
            this.$set(this.formData,'videos',formData.videos||[]);     
            if(this.isEdit){
              this.$set(this.formData,'id',formData.id||'');             
            }
          }
          // sessionStorage.removeItem('formData');
        }          
        if(this.formData.videos.length>0){
          this.$nextTick(()=>{
            this.$refs.myVideo[0].load()
          })
        }
      },
      async addStudent() {
        sessionStorage.setItem('formData',JSON.stringify(this.formData)) // 存储表信息
        sessionStorage.setItem('subTaskDetail',JSON.stringify(this.subTaskDetail)) // 存储详情
        sessionStorage.setItem('selectedxsList',JSON.stringify(this.selectedxsList)) // 存储选中学生列表
        var res = await this.$req.get(API.getCanJoinStudents,{schoolCode:this.xxdm,userId:this.userId,evaluationId:this.taskId});
        sessionStorage.setItem('avaliablexsList',JSON.stringify(res.value)) // 存储可选学生列表
        this.$router.push({
          path: '/addstudent',
          query: {
            classCode: this.classCode
          }
        })
      },
      handleChoose(value){
        
      },
      _delStu(key) {
        this.selectedxsList.splice(key,1)
      },
      delImg (key) {
        this.formData.imgs.splice(key, 1)
      },
      delVideo() {
        this.formData.videos.splice(0,1);
      },
      upload () {
        this.$refs.upload.fileClick()
      },
      uploadVideo () {
        this.$refs.tipConfirm.hideModal();
        this.$refs.uploadVideo.fileClick()
      },
      showModal () {
        this.$refs.tipConfirm.showModal();
      },
      getUplaodFile (data) {
        this.formData.imgs = data
      },
      getUplaodVideo (data) {
        this.formData.videos = data;
        console.log(data[0].progress,350)
        if(data[0].progress=='100.00%'){
          this.$nextTick(()=>{
            if(this.is_weixn()){
              // 微信浏览器新上传的视频需要调用微信的加载视频方法
              this.$refs.uploadVideo.autoLoadVideo(this.$refs.myVideo[0])
            } else {
              this.$refs.myVideo[0].load();
            }            
          })          
        }
      },
      is_weixn(){  
          var ua = navigator.userAgent.toLowerCase();  
          if(ua.match(/MicroMessenger/i)=="micromessenger") {  
              return true;  
          } else {  
              return false;  
          }  
      },
      toVideo(src){
        console.log('tovideo')
        sessionStorage.setItem('formData',JSON.stringify(this.formData)) // 存储表信息   
        sessionStorage.setItem('subTaskDetail',JSON.stringify(this.subTaskDetail)) // 存储详情
        sessionStorage.setItem('selectedxsList',JSON.stringify(this.selectedxsList)) // 存储选中学生列表     
        this.$router.push({
          path: '/fullScreenVideo',
          query:{
            src
          }
        })
      },
    }
  }
</script>

<style scoped lang="less">
  .submitform{
    padding: 0 32px;
    background-color: #fff;
    height: 100%;
    overflow: auto;
    .formitem{
      margin-bottom: 40px;
      &:first-child{
        margin-bottom: 0;
        margin-top: 40px;
      }
      .label{
        font-size:28px;
        font-weight:800;
        color:rgba(41,45,51,1);
        margin-bottom: 20px;
        .wordCount{
          font-weight:400;
          color:rgba(174,182,193,1);
        }
      }
      .textarea{
        outline:1px solid rgba(213,216,216,1);
        width: 100%;
        height: 322px;
        overflow: hidden;
        textarea{
          box-sizing: border-box;
          padding: 14px 20px 20px 20px;
          height: 100%;
          width: 100%;
          font-size:28px;
          color:rgba(41,45,51,1);
        }
      }
      .addlink{
        input{
          background:rgba(239,241,243,1);
          line-height: 80px;
          padding: 0 20px;
        }
        .addbtn{
          font-size:28px;
          font-weight:400;
          color:rgba(22,141,255,1);
          margin-left: 32px;
          &.loading{
            color: #909399;
          }
        }
      }
      .link{
        margin-top: 20px;
        height:120px;
        background:rgba(239,241,243,1);
        border-radius:20px;
        position: relative;
        .linkicon{
          height: 120px;
          width: 120px;
          background-color: #168DFF;
          border-radius: 20px;
          &::before{
            content: '';
            background-image: url(../../img/link.png);
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-position: 0 0;
            height: 57.17px;
            width: 57.17px;
            display: block;
            position: relative;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
          }
        }
        .linktitle{
          font-size:32px;
          font-weight:bold;
          color:rgba(41,45,51,1);
          margin-left: 20px;
          margin-right: 20px;
        }
        .del-img-btn{
          position: absolute;
          right: -5px;
          top: -5px;
        }
        .openlink{
          font-size:28px;
          font-weight:400;
          color:rgba(22,141,255,1);
          margin-right: 20px;
        }
      }
      .line{
        height: 2px;
        width: 100%;
        background-color: #EFF1F3;
      }
      .addTeammate{
        height: 120px;
        width: 120px;
        box-sizing: border-box;
        border:1px solid rgba(213,216,216,1);
        position: relative;
        margin: 0 10px;
        margin-bottom: 20px;
        &::before{
          content: '';
          height: 60px;
          width: 4px;
          background-color: #D5D8D8;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: -2px;
        }
        &::after{
          content: '';
          height: 4px;
          width: 60px;
          background-color: #D5D8D8;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%);
          margin-top: -2px;
        }
      }
    }
    .addMedia{
      color: #292D33;
      font-weight:400;
      font-size:24px;
      margin: 0 -20px;
      margin-bottom: 20px;
      padding-top: 40px;
      .mediabox{
        height: 200px;
        width: 200px;
        margin: 0 20px;
        margin-bottom: 20px;
        position: relative;
        img.img {
          position: absolute;
          max-height: 200px;
          max-width: 200px;
          border-radius: 8px;
          vertical-align: middle;
          margin: 0;
          padding: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          display: block;
        }
        .play-btn{
          height: 100px;
          width: 100px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          background-image: url(../../img/playbtn.png);
          background-repeat: no-repeat;
          background-size: 100% auto;
          background-position: 0 0;
          z-index: 1;
        }
        video{          
          max-height: 200px;
          max-width: 200px;
          border-radius: 8px;
        }
        .del-img-btn {
          position: absolute;
          z-index: 100;
          width: 40px;
          height: 40px;
          right: -12px;
          top: -12px;
          cursor: pointer;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .progress-box {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.5);
        }
        .progress-num {
          position: absolute;
          width: 100px;
          height: 100px;
          line-height: 100px;
          text-align: center;
          top: 50%;
          left: 50%;
          margin-left: -50px;
          margin-top: -50px;
        }
      }
      .addimg,.addvideo{        
        background-color: #EFF1F3;
      }
      .addimg::before{
        content: '';
        height: 60px;
        width: 60px;
        display: block;
        background-image: url(../../img/addphoto.png);
        background-repeat: no-repeat;
        background-size: 100% auto;
        background-position: 0 0;
      }
      .addvideo::before{
        content: '';
        height: 60px;
        width: 60px;
        display: block;
        background-image: url(../../img/addvideo.png);
        background-repeat: no-repeat;
        background-size: 100% auto;
        background-position: 0 0;
      }
    }
    .footer{
      margin-top: 60px;
      margin-bottom: 40px;
      .btn{
        width:320px;
        height:88px;
        font-size:30px;
        font-weight:400;
        line-height: 88px;
        text-align: center;
        border-radius: 44px;
      }
      .btn.cancel{
        background:rgba(239,241,243,1);
        color:rgba(38,38,39,1);
      }
      .btn.submit{
        background:#C0E3FF;
        color:#fff;
      }
      .submit.active{
        background:#33A5FF;        
      }
    }
  }
  .stulist{
    padding-top: 10px;
    margin: 0 -10px;
    li {
      height: 166px;
      &.stu-item {
        margin:0 10px;
        margin-bottom: 20px;
      }
      
      .li-top {
        position: relative;
        .avatar {
          width: 120px;
          height: 120px;
          background-size: 120px auto;
          background-position: center;
          background-repeat: no-repeat;
        }
        .boy {
          background-image: url("/static/img/boy@2x.png");
        }
        .girl {
          background-image: url("/static/img/girl@2x.png");
        }

        .icon-del {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 40px;
          height: 40px;
          background: url(../../img/icon_del@2x.png) no-repeat center;
          background-size: 40px auto;
        }
      }

      .list-bottom {
        width: 120px;
        color: #262626;
        font-size: 28px;
        margin-top: 12px;
        text-align: center;
      }
    }    
  }

</style>
