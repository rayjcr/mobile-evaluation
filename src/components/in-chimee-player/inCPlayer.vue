<template>
    <div class="in-chimee-player" ref="in-player">
        <div class="player-box" ref="player-box">
                <div id="wrapper" ref="in-wrapper"></div>
                <!--顶部-->
                <div class="in-top-body">
                    <transition name='inc-top'>
                        <div class="in-top" v-if="toolsShow">
                            <div class="in-top-box clearfix">
                                <!--返回按钮-->
                                <div class="in-return left" @click="inReturnClick()"></div>
                                <div class="in-title left">{{inTitle}}</div>
                            </div>
                            <ul class="in-nav-list" v-show="inHasNav">
                                <li v-for="(list,index) in inNavList" :key="index" :class="[inNavIndex == index ? 'selected':'', list.isRead ? 'readed':'']" @click="inNavClick(list,index)">{{list.name}}</li>
                            </ul>
                            <ul class="in-opt-list" v-show="inHasOpt">
                                <li v-for="(list,index) in inOptList" :key="index" :class="[list.name,{'on':list.isOpt}]" @click="inOptClick(list)"></li>
                            </ul>
                        </div>
                    </transition>  
                </div>
                <!--完成观看-->
                <div class="in-finish mask" v-show="inFinishShow">
                    <img src="./static/img/finish.png" alt="">
                </div>
                <!-- 播放提示 -->
                <!--<div class="start-tip" v-show="startTipShow">
                    请点击播放按钮观看视频
                </div>-->
                
                <div class="loading" v-if="loading"></div>
        </div>
    </div>
</template>

<script>
import { alertMask } from './static/js/base.js'
import './static/css/in-chimee-player.min.css'

import ChimeeMobilePlayer from 'chimee-mobile-player'
import chimeePluginMobileControlbar from 'chimee-plugin-mobile-controlbar'
import './static/css/chimee-mobile-player.browser.css'


export default {
    name: 'inCPlayer',
    props:{
        inTitle:{
            type:String,
        },
        inVideoSrc:{
            type:String,
        },
        inVideoBg:{
            type:String,
        },
        inHasNav:{
            type:Boolean,
        },
        inNavList:{
            type:Array,
        },
        inHasOpt:{                  //是否有操作按钮
            type:Boolean,
        },
        inOptList:{                 //操作按钮
            type:Array,
        },
        inVideoRequt:{
            type:Function,
        },
        inVip:{                         //是否是Vip
            type:Boolean,
        },
        inId:{
            type:Number,
        },
        ishackReset:{
            type:Boolean,
        }
    },
    data () {
        return {
            inVideoUrl:'',
            toolsShow:true,
            inNavIndex:0,
            inFinishShow:false,
            startTipShow:true,
            //视频比率
            inCPlayer:{},

            isShare: false,
            loading:false,              //等待ing
        }
    },
    created:function() {
        if(this.inVideoSrc){
            this.inVideoUrl=this.inVideoSrc
        }else{
            this.$LayerTips({
                content:"没有视频可播放",
                time:1000,
            });
                        
            setTimeout(()=>{
                this.inReturnClick()
            },1000)

        }
    },
    mounted:function() {
        let that=this;
        ChimeeMobilePlayer.install(chimeePluginMobileControlbar);
        this.inCPlayer = new ChimeeMobilePlayer({
            wrapper: '#wrapper',  // video dom容器
            src: that.inVideoUrl,
            poster:that.inVideoBg,
            playsInline: true,
            webkitPlaysinline: true,
            preload: 'auto',
            x5VideoPlayerFullscreen: true,
            autoplay:true,
            x5VideoOrientation: 'landscape|portrait',
            x5VideoPlayerType:'h5',
            xWebkitAirplay: true,
            muted: false,
            // 使用插件
            plugin: [{
                name:chimeePluginMobileControlbar.name, // 或者 'chimeeMobiControlbar'
                majorColor: '#fff',
                children: {
                    play:{
                        bitmap: true,
                    },
                    currentTime: {},
                    progressBar: {},
                    totalTime: {},            
                    screen: {},
                },
            }],
            controls: true,
            // removeInnerPlugins: ['chimeeMobiControlbar', 'chimeeState'] // 需要移除的插件
        });
        this.inCPlayer.$on('barShow', function () {
            that.toolsShow=true;
        })
        this.inCPlayer.$on('barHide', function () {
            that.toolsShow=false;
        })
        this.inCPlayer.$on('ended', function () {
            that.inVideoEnd();
        })
        this.inCPlayer.$on('waiting', function () {
            that.loading = true
        })
        this.inCPlayer.$on('playing', function () {
            that.loading = false
        })
        
        this.sizeSetUp();

        document.onvisibilitychange=function(){   
            if(document.visibilityState=="visible"){       
                // that.isShare = false
                // that.$refs['in-wrapper'].getElementsByTagName("video")[0].play()
            }else{    
                that.$refs['in-wrapper'].getElementsByTagName("video")[0].pause()
            } 
        }


        this.inOptList.forEach(item => {
            if(item.name == "lock"){
                if(item.isOpt) this.inCPlayer.controls = false;
                else this.inCPlayer.controls = true;
            }
        });
    
        
        this.inCPlayer.play()

        if(this.inVip){                 //是vip的播放5秒停止
            this.inCPlayer.controls = false
            setTimeout(()=>{
                this.inCPlayer.pause()
            },6000)
        }
        
    },
    methods: {
        /*  */
        sizeSetUp(){
            var bodyW = document.documentElement.clientWidth || document.body.clientWidth;
            var bodyH = document.documentElement.clientHeight || document.body.clientHeight;
            this.$refs['player-box'].style.width= bodyW+'px'
            this.$refs['player-box'].style.height=bodyH+'px'

            // this.$refs['player-box'].style.width=bodyH+'px'
            // this.$refs['player-box'].style.height=bodyW+'px'
            // this.$refs['player-box'].style.marginTop=(bodyH-bodyW)/2+'px'
            // this.$refs['player-box'].style.marginLeft=-(bodyH-bodyW)/2+'px' 
            
            // console.log(bodyW,bodyH)
            
            let v=this.$refs['in-wrapper'].getElementsByTagName("video")[0]
            v.style.height = bodyW+'px'  
        
        },
        /* 视频更换 */
        inNavClick(list,index){
            // this.startTipShow=false;
            // this.inLoadingShow=true;
            this.$refs['in-wrapper'].getElementsByTagName("video")[0].pause()
            this.inNavIndex=index;
            this.inVideoUrl=list.videoUrl;
            this.inCPlayer.src=this.inVideoUrl;
            setTimeout(()=>{
                this.$refs['in-wrapper'].getElementsByTagName("video")[0].load();
                this.$refs['in-wrapper'].getElementsByTagName("video")[0].play();
            },800)
            
        },
        /* 操作按钮 */
        inOptClick(item){
            var that = this
            if(item.name == "share"){
                this.$refs['in-wrapper'].getElementsByTagName("video")[0].pause()
                this.isShare = true;
                var shareData = {
                    type:1,
                    title: shareTitle, // 文字标题
                    text: shareText, //内容
                    image:'', //图片地址
                    url: shareUrl+"sharepage?id="+this.inId, //网址
                }
                getActivityShare(shareData,function(result){
                    if(result.ret == 1){
                        // that.$LayerTips({
                        //     content:"分享成功",
                        //     time:3000,
                        // });
                    }
                }); 
            }
            if(item.name == "collect"){
                item.isOpt = !item.isOpt
                
            }
            if(item.name == "lock"){        //锁定
                item.isOpt = !item.isOpt
                if(item.isOpt) this.inCPlayer.controls = false;
                else this.inCPlayer.controls = true;
                
            }
            
        },
        
        /* 播放结束 */
        inVideoEnd(){
            this.inVideoRequt()
            // this.$nextTick(() => {
            //     this.inCPlayer.src = this.inVideoSrc
            // })
            
            // console.log(this.inVideoSrc)
        },
        /* 返回 */
        inReturnClick(){
            this.$refs['in-wrapper'].getElementsByTagName("video")[0].pause()
            // if(devices == 2 || devices == 4){
            //     var data = {}
            //     closeWebPlayViewController(data, function(result) {});
            // }else{
                this.$router.go(-1);
            // }
            
        },

    }

}
</script>

<style>
    #wrapper{
        /* position: absolute;
        left: 0;
        top: 0; */
        width: 100%;
        height: 100%;
    }
    #wrapper chimee-control{
        height: 1.4rem;
        padding: 0;
    }
    #wrapper chimee-control-wrap{
        height: 1rem;
        line-height: 1rem;
        padding: .2rem 0;
    }
    #wrapper chimee-control.play chimee-control-state-play{
        width: 1rem;
        height: 1rem;
        background: url('./static/img/in-play.png') no-repeat 0 center; 
        background-size: 100% 100%; 
        display: block;
    }
    #wrapper chimee-control.pause chimee-control-state-pause{
        width: 1rem;
        height: 1rem;
        background: url('./static/img/in-pause.png') no-repeat 0 center; 
        background-size: 100% 100%; 
        display: block;
    }
    #wrapper chimee-total-time.chimee-flex-component{
        padding-right: 1em !important; 
    }
    #wrapper .chimee-progressbar-line{
        top: .45rem!important;
    }
    chimee-control-state.chimee-flex-component{
        flex-basis: auto!important;
        -webkit-flex-basis: auto!important;
        -ms-flex-preferred-size: auto!important;
    }
    
    chimee-progressbar.chimee-flex-component{
        width: auto;
    } 
    /* .in-chimee-player .player-box{
        transform: rotate(0);
        width: 100%!important; 
        margin-left: 0!important;
    } */
    video{
        height: 100%!important;
        /* object-fit:fill; */
    }
    .loading{
        background: url(./static/img/loading.gif) no-repeat;
        background-size: 100%;
        width: .64rem; height: .64rem;
        position: fixed; left: 50%; top: 50%;
        transform: translate(-50%,-50%);
        -webkit-transform: translate(-50%,-50%);
        z-index: 6666;
    }
</style>
