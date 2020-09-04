<template>
  <div class="members-evaluation">
    <section class="card" v-if="isjlk == 'true'">
      <div class="card-title">奖励类型</div>
      <div class="card-content">
        <div class="card-item " v-for="(item,index) in cardInfoList" :key="index">
          <div class="card-img-box" :class="{'card-item-checked':cardChecked === index}" @click="handlerSelectedCard(item,index)">
            <img :src="item.icon" :alt="item.name">
            <span class="tips" v-if="false">剩余:1</span>
          </div>

          <p class="text">{{item.name}}</p>
        </div>
      </div>
    </section>
    <section class="item" v-if="isjlk == 'false'">
      <div class="item-title">选择维度</div>
      <div class="item-content">
        <div class="btn-selectDimensions" @click="showWd" :style="{'color':wdName != '请选择维度' ? '#262727':'#B6B8B8'}">{{wdName}}<i class="icon-arrow"></i></div>
      </div>
    </section>
    <section class="item" v-if="isjlk == 'false'">
      <div class="item-title">奖励类型</div>
      <div class="item-content">
        <div class="radio-box">
          <span class="my-radio" @click="handlerRadio('radio',index)" v-for="(item,index) in radioList" :key="index"><i class="radio" :class="{'radioed':radioed === index}"></i><span>{{item}}</span></span>
        </div>
      </div>
    </section>
    <section class="item">
      <div class="item-title">成员列表</div>
      <div class="item-content">
        <div class="member-box">
          <div class="member-item" v-for="(item,index) in studentList" :key="item.studentId">
            <div class="member-name text-overflow-clamp2">{{item.name}}</div>
            <div class="member-class text-overflow-clamp2">{{item.className}}</div>
            <div class="step-box"><span class="span-border reduce" @click="changeMark('reduce',item)">-</span>
              <input type="number" v-model.number="item.number" maxlength="2" @blur="blur(item.number,index,'student')" @focus="$focus" @input="handlerInputVail(item.number,index,'student')">
              <span class="span-border add" @click="changeMark('add',item)">+</span></div>
            </div>
        </div>
      </div>
    </section>
    <section class="item">
      <div class="item-title">评语(选填)<span class="text-num">{{content.length}}/100</span></div>
      <div class="item-content">
        <textarea class="flex_1 textarea" placeholder="请输入评语" @blur="$blur" @focus="$focus" v-model="content" maxlength="100"></textarea>
      </div>
    </section>
    <section class="item">
      <div class="item-title">图片(选填)</div>
      <div class="item-content">
        <div class="clear">
          <div class="fl img-item flex alignCenter justifyCenter" v-for="(item,index) in imgs" :key="item.absolutePath+index">
            <div class="del-img-btn" @click="delImg(index)" v-if="item.absolutePath">
              <img src="@/assets/img/del.png">
            </div>
            <img v-if="item.absolutePath" class="img" :src="item.absolutePath">
            <div class="progress-box" :style="{'height': item.progress}" v-show="item.progress != '100.00%'"></div>
            <div class="progress-num" v-show="item.progress != '100.00%'">{{item.progress}}</div>
          </div>
          <div class="fl upload" @click="upload" v-show="imgs.length < 3">
            <div class="jiahao"></div>
            <div class="tianjia-txt">添加照片</div>
          </div>
        </div>
      </div>
    </section>
    <section class="relevance">
      <div class="relevance-title"><span style="">关联班级评分</span><mt-switch v-model="showRelevance"></mt-switch></div>
      <section class="item" v-show="showRelevance">
        <div class="item-title">奖励类型</div>
        <div class="item-content">
          <div class="radio-box">
            <span class="my-radio" @click="handlerRadio('relevance',index)" v-for="(item,index) in relevanceRadioList" :key="index"><i class="radio" :class="{'radioed':relevanceRadioed === index}"></i><span>{{item}}</span></span>
          </div>
        </div>
      </section>
      <section class="item" v-show="showRelevance">
        <div class="item-title">班级列表</div>
        <div class="item-content">
          <div class="member-box">
            <div class="member-item" v-for="(item,index) in classInfoArr" :key="item.classId">

              <div class="member-class text-overflow-clamp2">{{item.className}}</div>
              <div class="step-box"><span class="span-border reduce" @click="changeMark('reduce',item)">-</span>
            <input type="number" v-model.number="item.number" maxlength="2" @blur="blur(item.number,index)" @focus="$focus" @input="handlerInputVail(item.number,index,'class')">
            <span class="span-border add" @click="changeMark('add',item)">+</span></div>
            </div>
          </div>
        </div>
      </section>
    </section>
    <div class="flex alignCenter pj-bottom-box">
      <div class="flex_1 btn gray-btn" @click="back">取消</div>
      <div class="flex_1 btn blue-btn" v-preventReClick="1000" @click.prevent="save($event)">提交</div>
    </div>
    <!--上传图片-->
    <v-upload-img ref="upload" :imgs="imgs" :maxNumber="maxNumber" @getUplaodFile="getUplaodFile"></v-upload-img>

    <!--维度选择器-->
    <v-wd-select ref="wd" @getWdInfo="getWdInfo" @getWdName="getWdName"></v-wd-select>

    <!--评价成功提示-->
    <v-modal-success ref="success" :tip="'评价成功'"></v-modal-success>

  </div>
</template>

<script>
  import Axios from 'axios'
  import { PjApi,MedalApi } from '@/utils/api'
  import UploadImg from '@/components/UploadImg.vue'
  import WdSelect from '@/components/wdSelect/WdSelect.vue'
  import Modal from '@/components/modal/Modal_longTime.vue'

  // import { Switch } from 'mint-ui';
  export default {
    name: 'membersEvaluation',
    data() {
      return {
        isjlk: this.$cookie.get('jlk'), // 激励卡模块展示
        submitHttp: true, // 控制提交请求频率，防止网络异常造成多次地点击请求
        evaluator: this.$cookie.get('userId'),
        evaluatorName: this.$cookie.get('name'),
        memberList: [],
        imgs: [], // 上传图片
        wdName: '请选择维度',   // 维度名称
        dimensionId: 0,        // 维度id
        number: 1,
        stepType: '', // 加减数值(add,reduce)或者直接输入(input)
        maxNumber: 3, //最大支持上传多少张图片
        showRelevance: true,
        radioList: ['加分','减分','奖励勋章', '扣除勋章'],
        relevanceRadioList: ['加分','减分'],
        radioed: 0,   // 单选
        relevanceRadioed: 0, // 关联单选
        cardChecked: 0,
        content: '',       // 评语输入框
        groupId: '', // 组id
        groupName: '',
        schoolYear: this.$cookie.get('schoolYear'),
        xxdm: this.$cookie.get('xxdm'),
        type: 4,   // 4.评价团体
        studentList: [],  // 学生列表
        classInfoArr: [], // 班级信息列表
        cardInfoList: [], // 激励卡 卡片信息列表
      }
    },
    components: {
      'v-upload-img': UploadImg,
      'v-wd-select': WdSelect,
      'v-modal-success': Modal,
    },
    activated() {

      this.getInit()

    },
    mounted() {
    },
    methods: {
      /**
       * 初始化信息
       */
      getInit() {
        this.studentList = []
        this.classInfoArr = []
        this.memberList = JSON.parse(sessionStorage.getItem('currGroup'))
        this.studentList = this.memberList.students
        document.title = this.memberList.groupName + '成员评价'
        this.showRelevance = true
        this.submitHttp = true;
        this.$refs.success.hideModal();
        this.groupId = this.memberList.groupId
        this.groupName = this.memberList.groupName
        this.imgs = []
        this.wdName = '请选择维度'
        this.radioed = 0
        this.relevanceRadioed = 0
        this.cardChecked = 0
        this.content = ''
        if(this.studentList && this.studentList.length > 0 ) {
          this.studentList.forEach(item => {
            this.$set(item,'number',1)
            let tempObj = {}
            tempObj.classId = item.classId
            tempObj.className = item.className
            tempObj.number = 1
            this.classInfoArr.push(tempObj)
          })
          var result = [];
          var obj = {};
          for(var i =0; i<this.classInfoArr.length; i++){
              if(!obj[this.classInfoArr[i].classId]){
                result.push(this.classInfoArr[i]);
                obj[this.classInfoArr[i].classId] = true;
              }
          }
          this.classInfoArr = result
        }
        this.getCardInfo()
      },
      getCardInfo() {
        Axios.get(MedalApi.getMedalDetailsByLevel+'/1',{}).then(res => {
          if(res.resultCode === 1) {
            this.cardInfoList = res.value.medalDimensionDetailsList
          }
        })
      },
      /**
       * input限制
       */
      handlerInputVail(val,index,type) {
        if((val+'').length > 2) {
          if(type == 'student'){
            this.$set(this.studentList[index],'number',(val+'').substring(0,2))
          }else {
            this.$set(this.classInfoArr[index],'number',(val+'').substring(0,2))
          }
        }
      },
      blur(val,key,type) {
        this.$blur();
        if((val+'').length == 0) {  // 失去焦点为空时，默认 1
          if(type == 'student') {
            this.$set(this.studentList[key],'number',1)
          }else {
            this.$set(this.classInfoArr[key],'number',1)
          }
        }

      },
      /**
       * 复选框
       */
      handlerRadio(type,index) {
        if(type == 'radio') {
          this.radioed = index
        }else {
          this.relevanceRadioed = index
        }
      },
      /** 卡片选择 */
      handlerSelectedCard(item,index) {
        this.cardChecked = index
      },
      upload() {
        this.$refs.upload.fileClick();
      },
      getUplaodFile(data) {
        this.imgs = data;
      },
      delImg(key) {
        this.imgs.splice(key,1)
      },
      changeMark(type,item) {
        this.stepType = type;
        if(item.number > 0 ) {
          if(item.number < 99){
            item.number = type == 'add' ? (item.number - 0)+(1 - 0) : (item.number - 0)-(1 - 0)
          }else {
            item.number = type == 'add' ? 99 : (item.number - 0)-(1 - 0)
          }

        }else {
           item.number = type == 'add' ? (item.number - 0)+(1 - 0) : 0
        }
      },
      save(event) {
        if(this.studentList === null) {
          this.$toast('该小组没有学生')
          return
        }
        if(this.isjlk == 'true') {
          // 判断一下卡片数量
          this.dimensionId = this.cardInfoList[this.cardChecked].dimensionId
        }else {
          if(this.wdName == '请选择维度') {
            this.$toast('请选择维度')
            return
          }
        }

        if(this.imgs.length > 0) { // 如果图片存在要判断图片是否已加载出来
          for(let i = 0,imgs = this.imgs;i<imgs.length;i++){
            if(imgs[i].absolutePath == '') {
              this.$toast('还有图片未加载，请耐心等待')
              return;
            }
            if(imgs[i].fileId == '') {
              this.$toast('数据异常')
              return;
            }
          }
        }
        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }
        if(!this.submitHttp) {
          this.$toast('当前网络异常，请耐心等待')
          return
        }
        this.$indicator.open('提交中，请稍后')
        let arr_number = [],arr_name = [],arr_id = [];
        if (this.type == 1) { // 评价多人
          this.studentList.forEach((c) => {
            arr_number.push(c.number);
            arr_name.push(c.name);
            arr_id.push(c.id)
          })
        } else {
          arr_number.push(this.number);
          arr_name.push(this.title);
          arr_id.push(this.userId)
        }
        let data = {
          dimensionId: this.dimensionId,
          groupId: this.groupId,
          groupName: this.groupName,
          evaluator: this.evaluator,
          evaluatorName: this.evaluatorName,
          remark: this.content,
          type: this.type, // 1.录入型 2.项目型 3.学生上传
          pictureIds: this.imgs,
          schoolCode:this.xxdm,
          schoolYear: this.schoolYear
        };
        data.userList = []
        data.classList = []
        if(this.studentList && this.studentList.length > 0) {
          this.studentList.forEach(item => {   // 拼接参数
            let tempObj = {}
            tempObj.classCode = item.classId
            tempObj.gradeCode = item.gradeId

            if(this.radioed > 1) {
              if(this.radioed === 3) {
                tempObj.medal = -item.number
              }else {
                tempObj.medal = item.number
              }
            }else {
              if(this.radioed === 1) {
                tempObj.score = -item.number
              }else {
                if(this.isjlk == 'true') {
                  tempObj.medal = item.number
                } else {
                  tempObj.score = item.number
                }
              }
            }

            tempObj.userId = item.studentId
            tempObj.name = item.name
            data.userList.push(tempObj)
          })
        }
        if(this.showRelevance && this.classInfoArr && this.classInfoArr.length > 0) {// 关联班级评分为 true 添加班级评分
          this.classInfoArr.forEach(item => {
            let tempObj = {}
            tempObj.classCode = item.classId
            tempObj.gradeCode = item.gradeId

            if(this.relevanceRadioed === 1) {
              tempObj.score = -item.number
            }else {
              tempObj.score = item.number
            }
            tempObj.name = item.className
            data.classList.push(tempObj)
          })
        }
        this.submitHttp = false;
        Axios.post(PjApi.teamEvaluationSave,data).then(res => {
          this.submitHttp = true;
          if (res.resultCode == 1) {
            this.$refs.success.showModal();

            this.$indicator.close()
            /*setTimeout(()=>{
              this.$refs.success.hideModal();
              this.back()
            },500)*/
          }else {
            this.$indicator.close()
            this.$toast(res.resultMessage);
          }
        })

      },

      back() {
        this.$router.go(-1);
      },
      showWd() {
        this.$refs.wd.show();
      },
      getWdInfo(info) {
        this.dimensionId = info.id;
        // this.getpjxList()
      },
      getWdName(data) {
        this.wdName = '';
        data.forEach((c) => {
          this.wdName += c.name + '-'
        });
        this.wdName = this.wdName.substring(0,this.wdName.length-1)
      },
    }
  }
</script>

<style lang="less" scoped>
.members-evaluation{
  width: 100%;
  height: 100%;
  overflow-y: auto;
  color: #262627;
  background: #F3F5F7;
  box-sizing: border-box;
  .card{
    padding: 20px 32px;
    box-sizing: border-box;
    width: 100%;
    height: 530px;
    margin-bottom: 20px;
    background: #fff;
    .card-title{
      margin-bottom: 40px;
      width: 100%;
      font-size: 28px;
      font-weight: 800;
    }
    .card-content{
      width: 100%;
      height: 430px;
      overflow-y: auto;
      .card-item-checked{
        border:4px solid rgba(51,165,255,1);
        box-shadow:0px 10px 40px rgba(51,165,255,0.29);
        border-radius:12px;
      }
      .card-item{
        float: left;
        margin-bottom: 40px;
        width: 50%;

        border-radius:8px;
        text-align: center;
        overflow: hidden;

        .card-img-box{
          position: relative;
          margin: 0 auto;
          width: 260px;
          height: 120px;
          box-sizing: border-box;
          .tips{
            position: absolute;
            top: 0;
            left: 0;
            display: inline-block;
            width: auto;
            padding: 0 15px;
            height: 32px;
            font-size: 20px;
            text-align: center;
            line-height: 32px;
            border-radius:8px 0px 8px 0px;
            color: #fff;
            background: rgba(0,0,0,.44);;
          }
          img{
            width: 100%;
            height: 100%;
            border-radius:8px;
          }
        }
        .text{
          margin-top: 24px;
          font-size: 24px;
        }

      }
    }
  }
  .item{
    padding: 20px 32px;
    box-sizing: border-box;
    width: 100%;
    background: #fff;
    .item-title{
      width: 100%;
      font-size: 28px;
      font-weight: 800;
      .text-num{
        float: right;
        font-weight: normal;
        color: #B6B8B8;
      }
    }
    .item-content{
      margin-top: 20px;
      width: 100%;
      .btn-selectDimensions{
        position: relative;
        padding: 0 20px;
        box-sizing: border-box;
        width: 100%;
        height: 88px;
        line-height: 88px;
        font-size: 28px;
        color: #B6B8B8;
        background:rgba(255,255,255,1);
        border:1px solid rgba(239,241,243,1);
        .icon-arrow{
          position: absolute;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          display: inline-block;
          width: 16px;
          height: 26px;
          vertical-align: middle;
          background-image: url('./img/icon_right@2x.png');
          background-repeat: no-repeat;
          background-size: contain;
        }
      }
      .radio-box{
        width: 100%;
        .my-radio{
          display: inline-block;
          width: 25%;
          height: 60px;
          line-height: 60px;
          vertical-align: middle;
          font-size: 24px;
        }
        .radio{
          display: inline-block;
          margin-right: 10px;
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #EFF1F3;
          vertical-align: middle;
          &::before{
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            width: 12px;
            height: 12px;
            background: #fff;
            border-radius: 50%;
          }
        }
        .radioed{
          background: #33A5FF;
        }
      }
      .member-box{
        padding: 0 40px;
        box-sizing: border-box;
        width: 100%;
        max-height: 520px;
        background:rgba(243,245,247,1);
        border-radius: 16px;
        overflow-y: auto;
        .member-item{
          margin: 28px 0;
          display: flex;
          align-items: center;
          .member-name, .member-class, .member-handler{
            width: 144px;
            font-size: 28px;
          }
          .member-class{
            width: 140px;
            margin-right: 10px;
          }
          .step-box {
            display: inline-block;
            span {
              display: inline-block;
            }
            .span-border {
              cursor: pointer;
              width: 60px;
              height: 60px;
              line-height: 55px;
              background: #fff;
              color: #B6B8B8;
              font-size: 40px;
              font-weight: 600;
              text-align: center;
              border-radius: 8px;
              border: 2px solid #B6B8B8;
            }
            .content {
              width: 80px;
              text-align: center;
              color: #262627;
              font-size: 28px;
            }
            input[type='number'] {
              width: 70px;
              text-align: center;
              color: #262627;
              font-size: 28px;
              background: rgba(243,245,247,1);
            }
          }
        }
      }
      .clear {
        padding-top: 20px;
      }
      .upload {
        width: 200px;
        height: 200px;
        cursor: pointer;
        text-align: center;
        border: 1px solid #EFF1F3;
        .jiahao {
          position: relative;
          width: 60px;
          height: 60px;
          top: 38px;
          left: 50%;
          margin-left: -30px;
          &:before {
            content: '';
            position: absolute;
            width: 60px;
            height: 4px;
            top: 50%;
            left: 0;
            margin-top: -2px;
            background-color: #EFF1F3;
          }
          &:after {
            content: '';
            position: absolute;
            height: 60px;
            width: 4px;
            top: 0;
            left: 50%;
            margin-left: -2px;
            background-color: #EFF1F3;
          }
        }
        .tianjia-txt {
          color: #B6B8B8;
          font-size: 24px;
          margin-top: 70px;
        }
      }
      .img-item {
        position: relative;
        z-index: 80;
        width: 190px;
        height: 190px;
        margin-right: 30px;
        text-align: center;
        .img {
          max-height: 190px;
          max-width: 190px;
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
          z-index: 90;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: rgba(0,0,0,0.5);
        }
        .progress-num {
          position: absolute;
          z-index: 90;
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
      .textarea {
        width: 100%;
        height: 212px;
        padding: 14px 20px;
        font-size: 28px;
        color: #262727;
        box-sizing: border-box;
      }
    }

  }
  .relevance{
    width:100%;
    background: #fff;
    margin-top: 20px;
    padding-bottom: 120px;
    .relevance-title{
      display: flex;
      padding: 20px 32px;
      box-sizing: border-box;
      width: 100%;
      font-size: 28px;
      font-weight: 800;
      span{
        margin-right: 20px;
      }
    }
    .member-class{
      width: 50% !important;
    }

  }
}
.pj-bottom-box {
      position: fixed;
      z-index: 200;
      width: 100%;
      bottom: 0;
      left: 0;
      height: 100px;
      background-color: #ffffff;
      .btn {
        height: 88px;
        line-height: 88px;
        text-align: center;
        border-radius: 44px;
        font-size: 28px;
      }
      .gray-btn {
        margin-left: 32px;
        margin-right: 46px;
      }
      .blue-btn {
        margin-right: 32px;
      }
    }
</style>
