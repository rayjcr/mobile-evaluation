<template>
    <div class="player" style="width:100%;height:100%;overflow:hidden;">
        <inCPlayer v-if="hackReset" :ishackReset="hackReset" :inVideoSrc="videoSrc" :inHasOpt="hasOpt" :inOptList="btnList" :inVideoRequt="videoRequt"></inCPlayer>
    </div>
</template>

<script>
// import * as api from '@/api/index.js'
import inCPlayer from '@/components/in-chimee-player'

export default {
    name: 'videoPlay',
        data () {
        return {
            videoList:[],               //视频内容[]
            videoCur: 0,                //当前视频下标
            videoItem:{},               //当前视频内容
            videoSrc:'',
            videoBg:'',
            hasOpt:true,                //是否有操作按钮
            btnList:[],
            videoVip:false,             //是否是vip

            hackReset:true,
            isLayShow:false,                 //vip弹层
            rotclass:'rotate',           //横屏
            mask: false,    
            audioPlaying: false, // 悬浮音频是否播放状态
            showFixedAudio: false, // 是否显示悬浮
        }
    },
    components: {
      inCPlayer
    },
    destroyed() {
        // this.audioPlaying ? this.$store.commit('play') : null
        // this.showFixedAudio ? this.$store.dispatch('setShowFixedAudio',{ isFlag: true }) : null
    },
    created:function() {
        
        
        // this.audioPlaying = this.$store.getters.getPlaying
        // this.showFixedAudio = this.$store.getters.getShowFixedAudio
        // this.audioPlaying ? this.$store.commit('pause') : null
        // this.$store.dispatch('setShowFixedAudio',{ isFlag: false })
        console.log(this.showFixedAudio,222)
        // this.$parent.$refs['music-audio'].pause()
        // this.videoList = JSON.parse(window.localStorage.getItem('videoList'))
        // this.videoCur = parseInt(window.localStorage.getItem('videoCur'))
        this.$parent.loadShow=false;  
        this.update()
        if(this.hasOpt){  //是否有操作按钮
            this.btnList=[
                {
                    name:'lock',
                    isOpt:false,            //是否被锁定
                },
            ]
        }     
    },
    mounted:function() {

        
    },
    methods: {
        /* 视频播放结束 */
        videoRequt(){
            // if(this.listlen>this.videoCur+1){
            //     this.videoCur++
            //     // this.update()
            // }
        },
        //更新
        update(){
            // this.videoItem = this.videoList[this.videoCur]

            // this.listlen = this.videoList.length;

            // this.videoBg=this.videoItem.coverUrl;
            // this.videoSrc=this.videoItem.videoUrl;
            
            this.videoSrc=this.$route.query.src;


            // //重新加载组件
            this.hackReset= false
            this.$nextTick(() => {
                this.hackReset= true
            });

            // if(this.videoItem.isVIP !=1){              //非vip      
            //     if(this.videoItem.videoUrl && devices == 2){
            //         var data = {
            //             userId: userId,
            //             id:this.videoItem.id
            //         }
            //         api.AddViewCount(data).then(response => {
            //             if(response.resultCode == 1){
            //                 this.$LayerTips({
            //                     content:"已获得5个学趣星",
            //                     time:1000,
            //                 });
            //             }
            //         })
            //     }
            // }else{
            //     this.videoVip = true
            //     setTimeout(()=>{
            //         this.isLayShow = true
            //         this.mask = true
            //         this.$store.dispatch("setMaskAct",this.mask);
            //     },6000)
            // }
            

        },
    }

}
</script>
<style lang="less" scoped>
</style>
