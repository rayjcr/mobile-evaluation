<template>
  <div class="upload-box">
    <!--accept="image/jpeg,image/jpg,image/png"-->
    <input @change="fileChange($event)" type="file" accept="video/*" id="upload_video" style="display: none"/>
  </div>
</template>

<script>
  import Exif from 'exif-js' // 解决ios下图片旋转问题

  import Axios from 'axios'
  import {FileApi as API} from '@/utils/api'
  import wx from 'weixin-js-sdk';
  export default {
    name: "UploadVideo",
    props: ['maxNumber','videos'],
    data() {
      return {
        size: 0,
        videolists: [],
      }
    },
    watch: {
      videos(nVal) {
        this.videolists = nVal
      }
    },
    mounted() {
    },
    methods: {
      fileClick() {
        let self = this;
        try{
          if (typeof(nativeJS) != "undefined"){
            this.$toast('师生通暂不支持上传视频')
            //走 app
            // window.uploadImageFuc = this.uploadImageFuc = function (res) { // 回调方法
            //   if(res.ret == 1){
            //     let totalLen = parseInt(self.imgs.length-0) + parseInt(res.image.length-0);
            //     if(totalLen > self.maxNumber) {
            //       self.$toast(`最大支持${self.maxNumber}张图片上传`);
            //     } else {
            //       res.image.forEach((c) => {
            //         self.imglists.push({
            //           progress: '100.00%',
            //           absolutePath: c.absolutePath || '',
            //           relativePath: c.relativePath || '',
            //           contentLength: c.contentLength || '',
            //           contentType: c.contentType || '',
            //           eTag: c.eTag || '',
            //           fileId: c.fileId || '',
            //           name: c.name || '',
            //         });
            //       })
            //       self.$emit('getUplaodFile', self.imglists);
            //     }
            //   }
            // }
            // selectImage({imageCount:self.maxNumber,uploadImageFuc: 'uploadImageFuc',returnType:2})
          } else {
            document.getElementById('upload_video').click()
          }
        } catch(e){
          console.log(e);
        }
      },
      fileChange(el) {
        if (!el.target.files[0].size) return;
        this.fileList(el.target.files);
        el.target.value = ''; // 清空选中图片
      },
      async fileList(files) {
        var that = this;
        var file = files[0];
        // 检查文件格式
        if(file.type.indexOf('video')<0){
          this.$toast('请选择视频哦')
          return
        }
        // 检查文件大小
        if(file.size > 1024*1024*50 ){
          this.$toast('文件大小超过50M')
          return          
        }
        // 获取视频时长
        var video = document.createElement('video');
        var fileurl = URL.createObjectURL(files[0]);
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
          var duration = video.duration; // 得到时长
          console.log('视频的时长是'+duration,77)
          if(duration > 60) {
            that.$toast('请选择60秒以内的视频哦');
            return;
          } else {
            // that.$emit('getUplaodFile', file);
            var img_arr = that.setImgArr(1);
            that.upload(file,0,img_arr,file.name)
          }
        }
        video.onerror = function(err){
          if(err.target.error.code==4){
            // 安卓钉钉环境上传视频获取不到时长--未解决，暂时先不限制时长
            var img_arr = that.setImgArr(1);
            that.upload(file,0,img_arr,file.name)            
          }
        }
        video.src = fileurl;
        if(this.is_weixn()){
          // 微信环境下要自动加载才可以获取视频时长
          this.autoLoadVideo(video);
        } else {
          // video.load();
        }       
        // let video_arr = this.setImgArr(files.length)
        // for (let i = 0; i < files.length; i++) {
        //   this.fileAdd(files[i],parseInt(i-0)+parseInt(this.imglists.length - 0),files.length,video_arr);
        // }
      },
      is_weixn(){  
          var ua = navigator.userAgent.toLowerCase();  
          if(ua.match(/MicroMessenger/i)=="micromessenger") {  
              return true;  
          } else {  
              return false;  
          }  
      },
      autoPlayVideo(video) {
        wx.config({
          // 配置信息, 即使不正确也能使用 wx.ready
          debug: false,
          appId: '',
          timestamp: 1,
          nonceStr: '',
          signature: '',
          jsApiList: []
        });
        wx.ready(function() {
          video.play();
        });
        wx.error(function(res){
          video.play();
        });
      },
      autoLoadVideo(video) {
        wx.config({
          // 配置信息, 即使不正确也能使用 wx.ready
          debug: false,
          appId: '',
          timestamp: 1,
          nonceStr: '',
          signature: '',
          jsApiList: []
        });
        wx.ready(function() {
          video.load();
        });
        wx.error(function(res){
          video.load();
        });
      },
      setImgArr(len) {
        let img_arr = new Array(len); // 用来存储图片
        img_arr = this.videolists.concat(img_arr)
        for(var i=this.videolists.length;i<img_arr.length;i++){
          img_arr[i] = {
            progress: '',
            absolutePath: '',
            relativePath: '',
            contentLength: 0,
            contentType: '',
            eTag: '',
            fileId: '',
            name: '',
          };
        }
        return img_arr;
      },
      fileAdd(file,key,Len,img_arr) {
        let self = this;
        this.size = this.size + file.size;//总大小
        this.size = this.size / 1024 / 1024
        let reg = /\.(ogm|mpg|webm|wmv|asx|mov|mpeg|ogv|mp4|m4v|avi)$/ig;
        let fileName = file.name;
        if (!reg.test(fileName)) {
          this.$toast('请选择视频文件上传');
          return;
        }
        if(this.size > 6*Len) {
          this.$toast('请选择60秒以内的视频哦');
          return;
        }
        let Orientation;
        //去获取拍照时的信息，解决拍出来的照片旋转问题
        Exif.getData(file, function(){
          Orientation = Exif.getTag(this, 'Orientation');
        });
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e){
          if(file.size>1024*1024*1.5){
            // 走压缩
            self.imgCompress(e.target.result,file.name,key,Orientation,img_arr)
          } else {
            self.upload(file,key,img_arr,fileName)
          }
        }
      },
      upload(url,key,img_arr,filename) {
        let formData = new FormData();
        formData.append('files',url,filename);
        let vm = this;
        vm.imglists = img_arr;
        let config = {
          // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          headers: {'Content-Type': 'multipart/form-data'},
          onUploadProgress: function (e) {
            //属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
            //如果lengthComputable为false，就获取不到e.total和e.loaded
            if (e.lengthComputable) {
              var rate = e.loaded / e.total;  //已上传的比例
              var progress = (rate *100).toFixed(2)+ '%';
              img_arr[key].progress = progress=='100.00%'?'99.99%':progress;
              vm.imglists = img_arr;
              vm.$emit('getUplaodFile', vm.imglists);
            }
          }
        };
        Axios.post(API.upload, formData, config)
          .then(data => {
              if (data.resultCode == 1) {
                this.imglists[key].progress = '100.00%';
                this.imglists[key].relativePath = data.value[0].relativePath;
                this.imglists[key].contentLength = data.value[0].contentLength;
                this.imglists[key].contentType = data.value[0].contentType;
                this.imglists[key].eTag = data.value[0].eTag;
                this.imglists[key].fileId = data.value[0].fileId;
                this.imglists[key].name = data.value[0].name;
                this.imglists[key].absolutePath = data.value[0].absolutePath;
                this.$emit('getUplaodFile', this.imglists);
              } else {
                if (this.imglists.length == 0) return;
                this.$toast(data.resultMessage);
                this.imglists.splice(key,1);
                this.$emit('getUplaodFile', this.imglists);
              }
            })
              .catch(err => {
                console.log(JSON.stringify(err))
                if(JSON.stringify(err) != '{}') {
                  this.$toast(`视频上传失败,请重试!`);
                  this.imglists.splice(key,1);
                  this.$emit('getUplaodFile', this.imglists);
                }
              });
      },
      // 图片压缩
      imgCompress(bdata,fileName,key,Orientation,img_arr) {
        var self = this;
        var quality = 0.7;
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var img = new Image();
        img.src = bdata;
        img.onload = function(){
          var width = img.width;
          canvas.width = width;
          canvas.height = width * (img.height / img.width);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          //修复ios上传图片的时候 被旋转的问题
          if (Orientation != "" && Orientation != 1) {
            switch (Orientation) {
              case 6: //需要顺时针（向左）90度旋转
                self.rotateImg(img, "left", canvas);
                break;
              case 8: //需要逆时针（向右）90度旋转
                self.rotateImg(img, "right", canvas);
                break;
              case 3: //需要180度旋转
                self.rotateImg(img, "right2", canvas);
                break;
            }
          }
          var cdata = canvas.toDataURL("image/jpeg",quality);
          return self.dataURLtoBlob(cdata,fileName,key,img_arr)
        }
      },
      // 处理ios图片旋转问题
      rotateImg(img, direction, canvas) {
        //最小与最大旋转方向，图片旋转4次后回到原方向
        const min_step = 0;
        const max_step = 3;
        if (img == null) return;
        //img的高度和宽度不能在img元素隐藏后获取，否则会出错
        let height = img.height;
        let width = img.width;
        let step = 2;
        if (step == null) {
          step = min_step;
        }
        if (direction == "right") {
          step++;
          //旋转到原位置，即超过最大值
          step > max_step && (step = min_step);
        } else if (direction == "right2") {
          step = 2;
        } else {
          step--;
          step < min_step && (step = max_step)
        }
        //旋转角度以弧度值为参数
        let degree = step * 90 * Math.PI / 180;
        let ctx = canvas.getContext("2d");
        switch (step) {
          case 0:
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            break;
          case 1:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, 0, -height);
            break;
          case 2:
            canvas.width = width;
            canvas.height = height;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, -height);
            break;
          case 3:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, 0);
            break;
        }
      },
      // 将base64转换为blob
      dataURLtoBlob(dataurl, filename, key,img_arr) {
        var arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr =atob(arr[1]),
          n = bstr.length,
          u8arr =new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        var theBlob = new Blob([u8arr], {type: mime });
        this.blobToFile(theBlob,filename,key)
        var newFile = this.blobToFile(theBlob,filename,key);
        this.upload(newFile,key,img_arr,filename)
      },
      // 将blob转换成file
      blobToFile(theBlob,filename) {
        theBlob.lastModifiedDate =new Date();
        theBlob.name = filename;
        return theBlob;
      },
    }
  }
</script>

