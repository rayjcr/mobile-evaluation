<template>
  <div class="cropper">
    <div class="cropper-box">
      <vueCropper
        ref="cropper"
        :img="option.img"
        :outputSize="option.outputSize"
        :outputType="option.outputType"
        :info="option.info"
        :canScale="option.canScale"
        :autoCrop="option.autoCrop"
        :autoCropWidth="option.autoCropWidth"
        :autoCropHeight="option.autoCropHeight"
        :fixed="option.fixed"
        :fixedNumber="option.fixedNumber"
        :full="option.full"
        :fixedBox="option.fixedBox"
        :canMove="option.canMove"
        :canMoveBox="option.canMoveBox"
        :original="option.original"
      ></vueCropper>
    </div>
    <div class="sub-btn flex justifyCenter" v-if="option.autoCrop">
      <div class="btn" @click="_close">取消</div>
      <div class="btn sure-btn" @click="_sure">确定</div>
    </div>
    <div class="sub-btn flex justifyCenter" v-else>
      <div class="btn change-btn" @click="_changeHeadImg">更换头像</div>
    </div>

    <input type="file" @change="_uplaod" accept="image/*" id="uploadFile" style="display: none">
  </div>
</template>

<script>
  import {VueCropper} from 'vue-cropper'

  export default {
    components: {
      'vueCropper': VueCropper
    },
    name: 'Cropper',
    props: {
      value: {},
      img: {}
    },
    data () {
      return {
        option: {
          img: this.img, //裁剪图片的地址 空 url 地址 || base64 || blob
          outputSize: 1, //裁剪生成图片的质量 0.1 - 1
          outputType: '', //裁剪生成图片的格式  jpeg || png || webp
          info: false, //裁剪框的大小信息    true || false
          canScale: true, //图片是否允许滚轮缩放    true || false
          autoCrop: true, //是否默认生成截图框 true || false
          autoCropWidth: 200, //默认生成截图框宽度 容器的80%  0~max
          autoCropHeight: 200, //默认生成截图框高度 容器的80%  0~max
          fixed: true, //是否开启截图框宽高固定比例  true | false
          fixedNumber: [1, 1], //截图框的宽高比例 [宽度 , 高度]
          full: false, //是否输出原图比例的截图  true | false
          fixedBox: true, //固定截图框大小 true | false
          canMove: true, //上传图片是否可以移动  true | false
          canMoveBox: false, //截图框能否拖动  true | false
          original: false, //上传图片按照原始比例渲染 true | false
        },
        file_name: '', // 文件名
      }
    },
    methods: {
      _changeHeadImg() {
        let self = this;
        if (typeof(nativeJS) != "undefined"){
          //走 app
          window.uploadImageFuc = this.uploadImageFuc = function (res) { // 回调方法
            if(res.ret == 1){
              res.image.forEach((c) => {
                self.option.img = c.absolutePath;
                self.option.autoCrop = true;
                self.file_name = c.name;
              })
            }
          }
          selectImage({imageCount:1,uploadImageFuc: 'uploadImageFuc',returnType:2})
        } else {
          document.getElementById('uploadFile').click()
        }

      },
      _uplaod(e){
        var _this = this;
        var reader=new FileReader();
        this.file_name = e.target.files[0].name;
        reader.onload=function(){
          _this.option.img = reader.result;
          _this.option.autoCrop = true;
        }
        reader.readAsDataURL(e.target.files[0])
      },
      _sure () {
        if (this.option.img) {
          this.$refs.cropper.getCropData((data) => {
            this.$emit('sure', data,this.file_name)
          })
        } else {
          this.$toast('请上传图片')
        }
      },
      _close () {
        this.$emit('input', false)
      }
    }
  }
</script>

<style lang="less" scoped>
  .cropper {
    position: relative;
    width: 100%;
    height: 100%;

    .cropper-box {
      width: 100%;
      height: 100%;
    }
    .sub-btn {
      position: absolute;
      bottom: 40px;
      width: 100%;
      height: 88px;
      .btn {
        width: 200px;
        height: 88px;
        line-height: 88px;
        text-align: center;
        color: #262627;
        font-size: 30px;
        background-color: #FFFFFF;
        border-radius: 44px;
      }
      .sure-btn {
        margin-left: 40px;
      }
      .change-btn {
        width: 320px;
      }
    }
  }
</style>
