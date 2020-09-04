<template>
    <div class="info-wrapper">
      <ul>
        <li class="flex alignCenter justifySpaceBetween" @click="goView">
          <div class="li_left flex alignCenter">
            <img class="avatar" :src="userHeadImg" v-if="userHeadImg" @error="error($event)" />
            <img class="avatar" src="/static/img/boy@2x.png" v-else />
            <div>头像</div>
          </div>
          <div class="li_right icon_right"></div>
        </li>
      </ul>

      <transition name="fade">
        <div class="content-box" v-if="isAddHead">
          <v-cropper ref="cropper" v-model="isAddHead" @sure="_sure" :img="photo"></v-cropper>
        </div>
      </transition>

      <input @change="fileChange($event)" type="file" accept="image/*" id="upload_file"  style="display: none"/>
    </div>
</template>

<script>
  import Axios from 'axios'
  import wx from 'weixin-js-sdk'

  import {weixinAPi,FileApi,userInfoAPi} from '@/utils/api'

  import Cropper from '@/components/cropper/Cropper'

  export default {
    name: 'MyInfo',
    components: {
      'v-cropper': Cropper
    },
    data() {
      return {
        userHeadImg: this.$cookie.get('userHeadImg') || '',

        isAddHead: false,
        fileName: '',
        photo: ''
      }
    },
    activated() {
      this.isAddHead = false;

      /*if(this.getIsWxClient()) {
        this.getConfig()
      }*/
    },
    beforeRouteLeave (to, from, next) {
      if(this.isAddHead) {
        this.isAddHead = false;
        next(false);
      } else {
        next()
      }
    },
    methods: {
      goView() {
        let self = this;
        try{
          if(self.userHeadImg == '') {
            if (typeof(nativeJS) != "undefined"){
              //走 app
              window.uploadImageFuc = this.uploadImageFuc = function (res) { // 回调方法
                if(res.ret == 1){
                  res.image.forEach((c) => {
                    self.fileName = c.name;

                    self.agentRequest(c.absolutePath,true)
                  })
                }
              }
              selectImage({imageCount:1,uploadImageFuc: 'uploadImageFuc',returnType:2})
            } else if(self.getIsWxClient()) {
              // 走微信
              // self.chooseImage();
              document.getElementById('upload_file').click()
            } else {
              // 走h5上传
              document.getElementById('upload_file').click()
            }
          } else {
            self.agentRequest(self.userHeadImg,false)
          }

        } catch(e){
          console.log(e);
          self.$toast(JSON.stringify(e))
        }
      },
      error(e) {
        e.target.src = '/static/img/boy@2x.png';
        this.userHeadImg = ''; // 头像加载失败，重新上传头像
      },
      fileChange(el) {
        if (!el.target.files[0].size) return;
        this.fileAdd(el.target.files[0]);
        el.target.value = ''; // 清空选中图片
      },
      fileAdd(file) {
        let self = this;
        this.size = file.size;//总大小
        this.size = this.size / 1024 / 1024
        let reg = /\.(jpg|png|jpeg)$/ig;
        this.fileName = file.name;
        if (!reg.test(this.fileName)) {
          this.$toast('请选择jpg,png,jpeg文件上传');
          return;
        }
        if(this.size > 6) {
          this.$toast('请选择6M以内的图片哦');
          return;
        }

        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e){
          self.chosseBase64(e.target.result)
        }
      },
      chosseBase64(base64) {
        this.photo = base64;
        this.isAddHead = true;
      },
      // 保存裁剪图片
      _sure(base64,fileName) {
        if(fileName) {
          this.fileName = fileName;
        }
        this.dataURLtoBlob(base64)
      },
      // 将base64转换为blob
      dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr =atob(arr[1]),
          n = bstr.length,
          u8arr =new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        var theBlob = new Blob([u8arr], {type: mime });
        var newFile = this.blobToFile(theBlob,this.fileName);
        this.upload(newFile)
      },
      // 将blob转换成file
      blobToFile(theBlob) {
        theBlob.lastModifiedDate =new Date();
        theBlob.name = this.fileName;
        return theBlob;
      },
      upload(file) {
        let formData = new FormData();
        formData.append('file',file,this.fileName);

        let config = {
          headers: {'Content-Type': 'multipart/form-data'},
        };
        this.$indicator.open('图片上传中,请稍后...')
        Axios.put(userInfoAPi.uploadPhoto+this.$cookie.get('xxdm')+'/'+this.$cookie.get('userId'), formData, config)
          .then(data => {
            setTimeout(() => {
              this.$indicator.close();
            },500)
            if (data.resultCode == 1) {
              this.isAddHead = false;
              let absolutePath = data.value;
              this.userHeadImg = absolutePath;

              this.$cookie.set('userHeadImg',absolutePath);
            } else {
              if (this.imglists.length == 0) return;
              this.$toast(data.resultMessage);
            }
          })
          .catch(err => {
            setTimeout(() => {
              this.$indicator.close();
            },500)
            if(JSON.stringify(err) != '{}') {
              this.$toast(`图片上传失败,请重试!`);
            }
          });
      },
      /*
      * 图片绝对路径转换(解决裁剪插件图片跨域问题)
      **/
      agentRequest(url,bool) {
        var s = url.substr(0, 4);
        // 判断图片是否是base64
        if (s == "data") {
          this.userHeadImg = url;
          this.isAddHead = true;
          this.$nextTick(() => {
            this.$refs.cropper.option.autoCrop = bool;
          })
          return;
        }

        Axios({
          method: 'get',
          url: FileApi.agentRequest+'?url='+url,
          responseType: 'arraybuffer',
        }).then((res) => {
          let mime = url.substring(url.lastIndexOf('.')+1) // 取图片地址的后缀
          var theBlob = new Blob([res], {type: `application/${mime}`});
          this.blobToDataURI(theBlob,bool); // 将blob转成base64传给vue-cropper
        })
      },
      // 将blob转base64
      blobToDataURI(blob,bool) {
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (e) => {
          this.photo = e.target.result;
          this.isAddHead = true;
          this.$nextTick(() => {
            this.$refs.cropper.option.autoCrop = bool;
          })
        }
      },
      /*
      * 微信选择图片
      **/
      chooseImage() {
        let self = this;
        this.$toast(JSON.stringify(wx))
        wx.chooseImage({
          count: 1,
          sizeType: ['original','compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album','camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
            let localIds = res.localIds; // 返回选定照片的本地ID列表,localId可以作为img标签的src属性显示图
            wx.getLocalImgData({
              localId: localIds[0], // 图片的localID
              success: res => {
                var localData = res.localData;
                // 处理ios和安卓的兼容问题
                if(localData.indexOf("data:image") != 0) {
                  // 判断是否有这样的头部
                  localData = "data:image/jpeg;base64," + localData;
                }
                // 第一个替换的是换行符，第二个替换的是图片类型，因为在IOS机上测试时看到它的图片类型是jgp,
                // 这不知道是什么格式的图片，为了兼容其他设备就把它转为jpeg
                localData = localData
                  .replace(/\r|\n/g,"")
                  .replace("data:image/jgp","data:image/jpeg");

                self.photo = localData;
                self.isAddHead = true;
              }
            })
          }
        })
      },
      /*
      * 获取到微信签名信息
      **/
      getConfig() {
        let g_config = JSON.parse(this.$cookie.get('config'))
        let origin = this.$cookie.get('origin')// 是否来源于微信公众号,企业号
        Axios({
          method: 'get',
          timeout: 1000 * 30,
          withCredentials: false,
          url: weixinAPi.getSignature + '?url='+encodeURIComponent(window.location.href)+'&isPortal=true&school='+g_config.schoolCode+'&type='+origin,
        }).then((res) => {
          if(res.ResultCode == 1) {
            wx.config({
              debug: false,
              appId: res.Value.AppId, // 必填,公众号的唯一标识
              timestamp: res.Value.Timestamp, // 必填,生成签名的时间戳
              nonceStr: res.Value.Noce, // 必填,生成签名的随机串
              signature: res.Value.Signature, // 必填,签名
              jsApiList: ['chooseImage', 'uploadImage'] // 必填,需要使用的JS接口列表
            })
            /* 处理失败验证 */
            wx.error(function (res) {
              // config 信息验证失败会执行error函数,如签名过期导致验证失败,具体错误信息可以打开config的debug模式查看,也可以在返回的res参数中查看,对于SPA可以在这里更新签名
              alert('配置验证失败: ' + res.errMsg)
            })
          }
        })
      },
      /**
       * 判断是否是微信环境
       */
      getIsWxClient() {
        var ua = navigator.userAgent.toLowerCase();
        var origin = this.$cookie.get('origin'); // 是否来源于微信公众号 1,公众号；3，企业号
        if (ua.match(/MicroMessenger/i) == "micromessenger" && origin && (origin == '1' || origin == '3')) {
          return true;
        }
        return false;
      }
    }
  }
</script>

<style lang="less" scoped>
  .info-wrapper {
    height: 100%;
    background-color: #EFF1F3;

    li {
      padding: 0 32px;
      height: 130px;
      cursor: pointer;
      background-color: #ffffff;
      .li_left {
        color: #262727;
        font-size: 32px;
        font-weight: 600;
        .avatar {
          width: 90px;
          height: 90px;
          margin-right: 20px;
          border-radius: 100%;
        }
      }
      .li_right.icon_right {
        width: 16px;
        height: 26px;
        margin-left: 15px;
        background: url('./img/icon_right@2x.png') no-repeat center;
        background-size: 16px auto;
      }
    }

    .content-box{
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fff;
      z-index: 100;
    }
  }
</style>
