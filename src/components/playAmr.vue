<template>
    <div class="voice">
        <div class="flex">
            <div class="flex alignCenter justifySpaceBetween dd-voice" v-if="clear">
                <div class="dd-play" @click="play" v-if='!ddPlay'></div>
                <div class="dd-pause" @click="stop" v-if='ddPlay'></div>
                <div v-if='!ddPlay' class="voice-text" @click="play">点击播放音频~</div>
                <div v-if='ddPlay' class="voice-text" @click="stop">播放中，点击结束播放~</div>
                <div class="trans-text" v-if="text" @click="translate">转文字</div>
                <div class="trans-text" v-if="!text"></div>
            </div>
            <div class="flex alignCenter del-img-btn" @click="del" v-if="clear">
                <img src="@/assets/img/del.png">
            </div>
            <div class="flex alignCenter justifySpaceBetween dd-voice" v-if="!clear">
                <div class="dd-play" @click="play" v-if='!ddPlay'></div>
                <div class="dd-pause" @click="stop" v-if='ddPlay'></div>
                <!-- <div v-if='!ddPlay' class="voice-text" @click="play">点击播放音频~</div> -->
                <!-- <div v-if='ddPlay' class="voice-text" @click="stop">播放中，点击结束播放~</div> -->
                <!-- <button @click="translate" class="transferBtn">转文字</button> -->
            </div>
        </div>
        <!-- 语音转文字，文字显示的地方 -->
        <div class="content" v-if="isShowAudioWord">{{text}}</div>
    </div>
</template>
<script>
/**
 * 播放amr音频组件，全局定义amr变量，在播放音频是做初始化设置
 */
var BenzAMRRecorder = require('benz-amr-recorder');
var amr =''
export default {
    name: 'playAmr',
    props:['urls','clear','text'],
    data(){
        return{
            ddPlay: false,
            isShowAudioWord: false,
        }
    },
    methods:{
        //播放音频
        play(){
            let _self = this;
            amr = new BenzAMRRecorder();
            amr.initWithUrl(this.$props.urls).then(function() {
                console.log('play')
                amr.play();
                _self.ddPlay = true;
            });
            amr.onEnded(function() {
                console.log('播放完毕');
                _self.ddPlay = false;
            })
        },
        //停止播放音频
        stop(){
            amr.stop()
            this.ddPlay = false;
        },
        //删除该音频
        del(){
            this.$emit('delete')
        },
        //转文字按钮
        translate(){
            this.isShowAudioWord = !this.isShowAudioWord
            this.$emit('show', this.isShowAudioWord)
        },
    },
    mounted(){
        console.log(this.$props)
    },
}
</script>
<style lang='less' scoped>
    .voice {
        display: block;
        .audio {
            width: 100%;
            height: 1.17rem;
        }
        .dd-voice{
            height: 90px;
            line-height: 90px;
            margin-bottom: 20px;
            padding: 0 40px;
            border-radius: 44px;
            background-color: #D9EDFF;
            width: 100%;
            position: relative;
            .voice-text{
                color: #168DFF;
            }
            .dd-play{
                position: relative;
                display: inline-block;
                width: 56px;
                height: 56px;
                background-size: contain;
                background-repeat: no-repeat;
                vertical-align: middle;
                background-image: url('~@/assets/img/icon_play.png');
            }
            .dd-pause{
                position: relative;
                display: inline-block;
                width: 56px;
                height: 56px;
                background-size: contain;
                background-repeat: no-repeat;
                vertical-align: middle;
                background-image: url('~@/assets/img/icon_pause.png');
            }

            .transferBtn {
                position: relative;
                right: .53rem;
                background: transparent;
                color: #168DFF;                
                font-size: 0.37rem;
            }
        }
        .del-img-btn{
            position: relative;
            right: 18px;
            bottom: 36px;
        }
        .trans-text{
            width: 14%;
            border-radius: 28px;
            padding: 0 30px;
            height: 1.01rem;
            line-height: 1.013333rem;
            color: #168DFF;
            text-align: center;
        }
        .content {
            text-align: center;
            color: #262627;
            font-size: 28px;
            background-color: #eff1f3;
            border-radius: 28px;
            padding: 10px 0;
            margin-bottom: 10px;
        }
      }
</style>