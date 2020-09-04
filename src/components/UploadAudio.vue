<template>
    <!-- 录音弹框 -->
    <van-popup v-model="isRecord" round position="bottom" class="record" >
        <div class="record-head flex justifySpaceBetween">
            <div class="cancel" @click="cancelRecord">取消</div>
            <div class="submit" @click="uploadAudio">提交</div>
        </div>
        <div class="record-body flex flex-column justifyCenter">
            <div>{{countTimer}}</div>
            <div class="circle flex justifyCenter alignCenter" @click="recordStartAndStop(1)" v-if="isStart">
                <img src="../../static/img/start-record@2x.png" alt="">
            </div>
            <div class="circle flex justifyCenter alignCenter" @click="recordStartAndStop(2)" v-if="isStop">
                <img src="../../static/img/pause-record@2x.png" alt="">
            </div>
            <div class="circle flex justifyCenter alignCenter" v-if="isPlay">
                <img src="../../static/img/play-record@2x.png" alt="">
            </div>
            <div class="desc" v-if="isStart">点击开始录音</div>
            <div class="desc" v-if="isStop">录制中，点击结束</div>
        </div>
    </van-popup>
</template>
<script>
import Axios from 'axios'
import { gobalAPi, FileApi } from '@/utils/api'
export default {
    name: 'UploadAudio',
    props:['maxNumber','audios'],
    watch:{
        isRecord(val) {
            if(!val){
                this.cancelRecord();
            }
        }
    },
    data(){
        return {
            isStart: true,      //开始录音状态
            isStop: false,      //停止录音状态
            isPlay: false,      //开始播放录音状态
            timer: null,        //录音计时器
            timeCount: 1,       //录音计时器初始值
            countTimer: '00:00', //录音计时器展示在弹框上面的值
            source: '',         //来源  1：app   2:微信   3：钉钉
            audioName: '',      //来源App的停止录音赋值的录音文件名
            isRecord: false,
            ddMediaId: '',    //钉钉录音文件id
            uploadUrls: '',         //钉钉录音产生的url
        }
    },
    methods:{
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
        //取消录音弹框
        cancelRecord(){
            this.isRecord = false;
            this.isStart = true;
            this.isPlay = false;
            this.isStop = false;
            this.timeCount = 0;
            this.countTimer = "00:00"
        },
        //开始录音和停止录音
        recordStartAndStop(type){
            /**
             * lr 
             * 添加录音方法，首先调用判断是哪一端，再去调用对应端的录音方法
             * type  1:开始录音   2：停止录音
             * source：  1：app   2：微信   3：钉钉    4：其他
             * isStart:点击开始录音   isStop: 录制中，点击结束  isPlay:录制成功，点击回放录音
             */
            switch(this.source){
                case 1:
                    if(type == 1){
                        this.appStartRecord();
                        
                    }else{
                        clearInterval(this.timer);
                        this.appStopRecord()
                        this.isStop = false;
                        this.isPlay = true
                    }
                    break;
                case 2:
                    this.notSupport();
                    break;
                case 3:
                    if(type == 1){
                        console.log('ddStartRecord')
                        this.ddStartRecord();
                    }else{
                        clearInterval(this.timer);
                        this.ddStopRecord()
                        this.isStop = false;
                        this.isPlay = true
                    }
                    break;
                case 4:
                    this.notSupport();
                    break;
            }
            
        },
        //开始播放录音和停止播放录音
        playRecord(type){
            /**
             * lr 
             * type  1:开始播放录音   2：停止播放录音
             * source：  1：app   2：微信   3：钉钉    4：其他
             * isStart:点击开始录音   isStop: 录制中，点击结束  isPlay:录制成功，点击回放录音
             */
            switch(this.source){
                case 1:
                    if(type == 1){
                        this.appPlayRecord();
                    }else{
                        this.appStopPlayRecord()
                    }
                    break;
                case 2:
                    break;
                case 3:
                    if(type == 1){
                        this.ddPlayRecord()
                    }else{
                        this.ddStopRecord()
                    }
                    break;
                case 4:
                    break;
            }
        },
        //上传提交录音
        uploadAudio(audioContent){
            let _self = this;
            if(!this.isStart && !this.isStop){
                if(this.source == 3 || this.source == 1){
                    //钉钉上传
                    console.log(this.uploadUrls,'uploadUrls')
                    console.log(audioContent,'audioContent')
                    /**
                     * formdata格式的上传音频的urls
                     */
                    // let formData = new FormData();
                    // formData.append('urls',this.uploadUrls);
                    // console.log(formData)
                    let config = {
                        // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        headers: {'Content-Type': 'application/json'},
                    };
                    // Axios.post(FileApi.uploadUrls,formData,config).then(res=>{
                    Axios.post(FileApi.uploadUrls,[this.uploadUrls],config).then(res=>{
                        console.log(res,'upload-url')
                        console.log(res.resultCode == 1,res.resultCode,'res')
                        if(res.resultCode == 1){
                            let data = res.value;
                            this.$toast('上传成功')
                            this.isRecord = false;
                            if(audioContent){
                                data[0].audioContent = audioContent;
                            }
                            this.$emit('getUplaodFile', data);
                        }
                    })
                }
            }else{
                this.$toast('请完成录音')
            }
        },
        //钉钉开始录音
        ddStartRecord(){
            this.counter();
            this.isStart = false;
            this.isStop = true;
            dd.ready(function() {
                dd.device.audio.startRecord({
                    onSuccess : function () {//支持最长为300秒（包括）的音频录制，默认60秒(包括)。
                        console.log('start record')
                    },
                    onFail : function (err) {
                        console.log(err,'err871')
                    }
                });
                dd.error(function(err){
                    console.log(err)
                })
            })
        },
        //钉钉停止录音
        ddStopRecord(){
            let _self = this;
            dd.ready(function() {
                //钉钉停止录音
                dd.device.audio.stopRecord({
                    onSuccess : function(res){
                        console.log(res,'dd停止录音')
                        _self.ddMediaId = res.mediaId
                        _self.uploadUrls = res.remoteUrl
                        //钉钉下载文件方法
                        dd.device.audio.download({
                            mediaId : res.mediaId,
                            onSuccess : function(res) {
                                console.log(res,'dd下载文件')
                            },
                            onFail : function (err) {
                            }
                        });
                        console.log(res.mediaId,'translate')
                        dd.device.audio.translateVoice({
                            mediaId : res.mediaId,
                            duration : 59,
                            onSuccess : function (res) {
                                console.log(res,'ddtext')
                                _self.uploadAudio(res.content);

                            }
                        });
                        dd.error((err)=>{
                            console.log(err,'err')
                        })
                    },
                    onFail : function (err) {
                    }
                });
                dd.error(function(err){
                    console.log(err)
                })
            })
        },
        //钉钉播放录音
        ddPlayRecord(){
            let _self = this;
            console.log(_self.ddMediaId)
            dd.ready(function() {
                dd.device.audio.play({
                    localAudioId : _self.ddMediaId,
                    onSuccess : function () {
                        console.log('ddPlayrecord')
                    },
                    onFail : function (err) {
                        console.log(err,'ddplayerr')
                    }
                });
                dd.error(function(err){
                    console.log(err,'err,play')
                })
            })
        },
        //钉钉停止播放录音
        ddStopPlayRecord(){

        },
        //app开始录音
        appStartRecord(){
            //调用安卓提供的方法
            let _self = this;
            var data = {
                maxTime: 60, // 最大时长 单位 秒
                minTime: 1, //最小时长 单位 秒
                maxTimeStopRecordCompletion: 'maxTimeStopRecordCompletion', //超过最大时长的回调 参数 {time:120, filename:'123456789.caf'} ,
                cannotRecordCompletion: 'cannotRecordCompletion', //不能录音的回调
                peakPowerForChannel: 'peakPowerForChannel', //音波回调 参数  peakPower
            };
            //app方法，获取麦克风权限
            requestPermission({},function(res){
                console.log(res,'requestPermission')
                if(res.code == 0){
                    //app方法，开始录音
                    _self.isStart = false;
                    _self.isStop = true;
                    _self.counter();
                    startRecord(data, function(result) {
                        console.log(result,'startRecord')
                        var ret = result.ret;
                        var filename = result.filename;
                    });
                }else{
                    _self.isStart = true;
                    _self.isStop = false;
                    _self.$toast('没有获取到麦克风权限')
                }
            })
            
        },
        //app结束录音
        appStopRecord(){
            //调用安卓提供的方法,当蒙层关闭时应该结束录音或者取消录音
            let _self = this;
            //app方法 停止录音
            stopRecord({}, function(result) {
                console.log(result,'stopRecord')
                var filename = result.filename;
                var data = {
                    filename: filename,
                    useHub: 1, // 0 | 1
                };
                //app方法  保存文件
                startSaveFile(data, function(res) {
                    console.log(res,'save')
                    _self.uploadUrls = res.url;
                    _self.uploadAudio();
                });
            });
        },
        //app播放录音
        appPlayRecord () {
            //调用安卓提供的方法
            var data = {
                filename: this.audioName, //文件名
            };
            playRecord(data, function(result) {
                console.log(result,'play')
                var ret = result.ret;
                var msg = result.msg;

            });
        },
        //app停止播放录音
        appStopPlayRecord () {
            //调用安卓提供的方法
            stopPlayRecord({}, function(result) {
                console.log(result,'stopPlay')
                var ret = result.ret;
                var msg = result.msg;

            });
        },
        //倒计时60秒，添加计时器显示内容
        counter(){
            //开启倒计前应先清空倒计时
            clearInterval(this.timer);
            /**
             * 计时器，60秒自动关闭，每1秒跳一次，同时修改页面上的计时器显示的内容
             */
            this.timer = setInterval(() => {
                let seconds=Number(this.timeCount);
                let time = seconds >=10? seconds: '0'+seconds   //页面上计时器秒数补0
                this.countTimer = "00:" + time                  //页面上的计时器展示内容
                if (seconds == 60) {
                    this.countTimer = "01:00"   //当60秒是，页面计时器显示的内容，
                    this.timeCount=0;
                    this.isStop = false;
                    this.isPlay = true
                    clearInterval(this.timer);  //清空计时器
                } else {
                    this.timeCount = seconds+1;
                }
            }, 1000)
        },
        //钉钉鉴权
        async ddConfig(){
            console.log('dd.config')
            let data = {
                schoolCode: this.$cookie.get("xxdm"),
                url: window.location.href.split('?')[0]

            }
            let res = await this.$req.get(gobalAPi.getDDConfig,data);
            if(res.resultCode == 1){
                let value = res.value;
                console.log(value)
                dd.config({
                    agentid: value.agentId, // 必填，微应用ID
                    corpId: value.corpId,//必填，企业ID
                    timeStamp: value.timeStamp, // 必填，生成签名的时间戳
                    nonceStr: value.nonce, // 必填，生成签名的随机串
                    signature: value.signature, // 必填，签名
                    type: 0,   //选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
                    jsApiList : [
                        'device.audio.startRecord',   //开始录音
                        'device.audio.stopRecord',   //停止录音
                        'device.audio.onRecordEnd',   //监听自动停止录音
                        'device.audio.play',         //播放录音
                        'device.audio.pause',         //暂停播放语音
                        'device.audio.resume',         //恢复暂停播放语音
                        'device.audio.stop',         //停止播放录音
                        'device.audio.download',         //下载音频文件
                        'device.audio.translateVoice',         //钉钉语音转文字
                    ] // 必填，需要使用的jsapi列表，注意：不要带dd。
                });
                dd.error(function(ee){
                    console.log(ee,'ee')
                })
            }            
        },
        //微信鉴权
        async wxConfig(){
            console.log('dd.config')
            let data = {
                schoolCode: this.$cookie.get("xxdm"),
                url: 'http://ll.vaiwan.com/pjstudent'

            }
            let res = await this.$req.get(gobalAPi.getDDConfig,data);
            if(res.resultCode == 1){
                let value = res.value;
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: '', // 必填，公众号的唯一标识
                    timestamp: '', // 必填，生成签名的时间戳
                    nonceStr: '', // 必填，生成签名的随机串
                    signature: '',// 必填，签名
                    jsApiList: [] // 必填，需要使用的JS接口列表
                });
                dd.error(function(ee){
                    console.log(ee,'ee')
                })
            }
        },
        //暂不支持添加语音功能
        notSupport(){
           this.$toast('暂不支持添加语音功能')
           this.isRecord = false;
        },
    },
    mounted(){
       this.source = this.getOrigin(); //获取页面来源   1：app   2：微信   3：钉钉    4：其他 
       console.log(this.source,'来源')
       if(this.source == 3){
           this.ddConfig();
       } 
    }
}
</script>
<style lang="less" scoped>
    .record{
        height: 30%;
        .record-head{
            width: 95%;
            margin: 20px auto 0;
            .cancel{
                color: #BFBFBF;
            }
            .submit{
                color: #168DFF;
            }
        }
        .record-body{
            width: 95%;
            text-align: center;
            margin: 60px auto 0;
            .desc{
                color: #AEB6C1;
            }
            .circle{
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: #168DFF;
                margin: 20px auto;
                box-shadow: 0px 0px 15px #BCDEFF;
                border: 4px solid #fff;
                line-height: 120px;
                img{
                    width: 60px;
                    height: 60px;
                }
            }
        }
    }
</style>