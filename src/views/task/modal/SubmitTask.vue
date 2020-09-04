<template>
  <div class="popupbg flex alignCenter justifyCenter" v-if="popupVisible">
    <div class="popup flex">
      <div class="popup-head border-bottom">
        <span>提交任务</span>
        <img class="close" src="/static/img/close.png" @click="popupVisible = false">
      </div>
      <div class="popup-content">
        <div class="flex">
          <div class="title flex_1">内容</div>
          <div class="number">{{content.length}}/200</div>
        </div>
        <div class="flex border1px">
          <textarea class="flex_1 textarea" placeholder="请输入时间、地点等内容" @blur="$blur" v-model="content" maxlength="200"></textarea>
        </div>
        <div class="img-box">
          <div class="title">图片{{uploadImg == 1 ? '(必填)' : '(选填)'}}</div>
          <div class="clear">
            <div class="fl img-item flex alignCenter justifyCenter" v-for="(item,index) in imgs" :key="index">
              <div class="del-img-btn" @click="delImg(index)" v-if="item.absolutePath">
                <img src="@/assets/img/del.png">
              </div>
              <img class="img" :src="item.absolutePath">
              <div class="progress-box" :style="{'height': item.progress}" v-show="item.progress != '100.00%'"></div>
              <div class="progress-num" v-show="item.progress != '100.00%'">{{item.progress}}</div>
            </div>
            <div class="fl upload" @click="upload" v-show="imgs.length < 3">
              <div class="jiahao"></div>
              <div class="tianjia-txt">添加照片</div>
            </div>
          </div>
        </div>
      </div>
      <div class="popup-foot flex justifyCenter">
        <div class="flex_1 btn cancel" @click="popupVisible = false">取消</div>
        <div class="flex_1 btn sure" v-preventReClick="1000" @click="sure($event)">提交</div>
      </div>
    </div>
    <!--上传图片-->
    <v-upload-img ref="upload" :imgs="imgs" :maxNumber="maxNumber" @getUplaodFile="getUplaodFile"></v-upload-img>
  </div>
</template>

<script>
  import UploadImg from '@/components/UploadImg.vue'

  export default {
    name: 'TaskPopUp',
    components: {
      'v-upload-img': UploadImg,
    },
    props: {
      type: {
        type: Number,
        default: 1
      },
      id: {
        default: ''
      },
      uploadImg: {
        default: 0
      }
    },
    data () {
      return {
        classCode: this.$cookie.get('classCode'),
        gradeCode: this.$cookie.get('gradeId'),
        popupVisible: false,
        content: '',
        imgs: [],
        maxNumber: 3,
      }
    },
    watch: {
      popupVisible(nVal) {
        if (nVal) {
          this.initData()
        }
      }
    },
    methods: {
      showModal () {
        this.popupVisible = true
      },
      hideModal () {
        this.popupVisible = false
      },
      getUplaodFile (data) {
        this.imgs = data
      },
      delImg (key) {
        this.imgs.splice(key, 1)
      },
      upload () {
        this.$refs.upload.fileClick()
      },
      initData() {
        this.content = ''
        this.imgs = []
      },
      sure (event) {
        if(this.content == '') {
          this.$toast("请输入备注内容")
          return;
        }
        if(this.uploadImg == 1 && this.imgs.length == 0) { // 图片必填
          this.$toast("请上传图片")
          return;
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
        let data = {
          type: this.type, // 1.录入型 2.项目型 3.学生上传 ,
          content: this.content,
          pictureIds: this.imgs,
          classCode: this.classCode,
          gradeCode: this.gradeCode
        }
        if (this.type == 2) {
          data['evaluationId'] = this.id
        }
        
        this.$emit('submit', data)
      }
    }
  }
</script>

<style lang="less" scoped>
  .popupbg {
    height: 100%;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2100;
    .popup {
      width: 100%;
      margin: 0 32px;
      background-color: #ffffff;
      border-radius: 20px;
      flex-direction: column;
      .popup-head {
        width: 100%;
        margin-top: 24px;
        padding-bottom: 22px;
        text-align: center;
        position: relative;
        font-size: 36px;
        font-weight: 600;
        color: #262627;
        border-bottom-color: #EFF1F3;
        .close {
          position: absolute;
          right: 32px;
          top: 8px;
        }
      }
      .popup-content {
        padding: 30px 20px;
        font-size: 28px;
        .title {
          color: #262627;
          font-weight: 600;
        }
        .number {
          color: #B6B8B8;
        }
        .border1px {
          margin-top: 15px;
          border-color: #EFF1F3;
        }
        .textarea {
          font-size: 28px;
          color: #333333;
          width: 100%;
          height: 212px;
          padding: 14px 20px;
        }
        .img-box {
          margin-top: 30px;
          .clear {
            padding-top: 24px;
          }
          .img-item {
            position: relative;
            width: 200px;
            height: 200px;
            margin-right: 15px;
            .img {
              position: absolute;
              max-height: 200px;
              max-width: 200px;
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
        }
      }
      .popup-foot {
        height: 88px;
        border-top: 2px solid #EFF1F3;
        .btn {
          line-height: 88px;
          font-size: 32px;
          font-weight: 600;
          text-align: center;
        }
        .cancel {
          color: #B6B8B8;
          border-right: 2px solid #EFF1F3;
        }
        .sure {
          color: #33A5FF;
        }
      }
    }
  }
</style>
