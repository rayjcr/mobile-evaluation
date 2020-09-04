<template>
  <div class="audio-box">
    <audio class='article_audio'
          ref="article_audio"
          controls
          :src='audioInfo.absolutePath'
          @loadedmetadata="handlerAudioInit($event)"
          @timeupdate="updateProgress"
          @ended="handlerAudioEnded">
    </audio>
    <div class="audio_box">
      <a class="play_btn" :class="{'on': audioPlay}" @click="handlerAudioPlay"></a>
      <div class="pgs" ref="pgs" @click="handlerAudioPass($event)">
        <div class="pgs-play" ref="pgsPlay"></div>
        <div class="circle" ref="circle" 
          @touchstart="passStart" 
          @touchmove="passMove($event)"
          @touchend="passEnd"></div>
      </div>
      <div class="time_p clearfix">
        <span class="playedTime" v-show="false">00:00</span>
        <span class="totalTime">{{duration}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'audioComponent',
    data() {
      return {
        duration: '00:00',
        totalWidth: '',
        audio: null,
      }
    },
    props: {
      audioPlay: {
        type: Boolean
      },
      audioInfo: {
        type: Object
      },
      index: {
        type: Number
      }
    },
    watch: {
      audioPlay(newVal) {
        if(newVal) {
          this.audio.play()
          // this.audioProgressPlay()
        }else {
          // this.audioProgressPause()
          this.audio.pause()
        }
      }
    },
    mounted() {
      this.initAudio()
    },
    methods: {
      
      /**
       * 音频初始化了
       */
      handlerAudioInit(e) {
        this.duration = this.transTime(e.target.duration) // 获取音频总时长，并转化为 00:00格式
      },
      handlerAudioPlay() {
        this.$emit('audioclick',this.audioInfo, this.index)
      },
      /**
       * 更新进度条
       */
      updateProgress() {
          var value = Math.round((this.audio.currentTime / this.audio.duration) * 100, 0);
          this.$refs.pgsPlay.style.width = value + '%'
          this.$refs.circle.style.left = value + '%'
      },
      /**
       * 快进
       */
      handlerAudioPass(e) {
        let rate = 0
        var startX = e.target.getBoundingClientRect().left;  //进度条开始的x坐标
        var endX = e.clientX;  //点击事件的x坐标
        // console.log(startX,endX)
        rate = (endX - startX) / this.totalWidth;
        this.$refs.circle.style.left = (endX - startX - 1) + "px"
        this.audio.currentTime = rate * this.audio.duration;
        this.updateProgress();
      },
      /**
       * 结束播放
       */
      handlerAudioEnded() {
        this.$refs.pgsPlay.style.width = 0 + '%'
        this.$refs.circle.style.left = 0 + '%'
        this.$emit('audioclick',this.audioInfo)
      },
      passStart() {
        this.handlerAudioEnded()
      },
      passMove(e) {
        // console.log(this.audio.duration)
        e.preventDefault();
        var startX = this.$refs.pgs.getBoundingClientRect().left;  //进度条开始的x坐标
        
        var endX = e.targetTouches[0].clientX;  //点击事件的x坐标
        // console.log(this.$refs.pgs,endX)
        let rate = 0
        if ((endX + 1) > startX && endX < (startX + this.totalWidth)) {  //触摸范围大于进度条起点，小于进度条终点
          this.$refs.circle.style.left = (endX - startX - 1) + "px"
          rate = (endX - startX) / this.totalWidth;
          this.audio.currentTime = rate * this.audio.duration;
          this.updateProgress();
        }
      },
      passEnd() {
        this.handlerAudioPlay()
      },
      /* 初始化音频播放器 */
      initAudio() {
        this.audio = this.$refs.article_audio
        this.totalWidth = this.$refs.pgs.offsetWidth;  //进度条长度
      },
      //转换音频时长显示
      transTime(time) {
        var duration = Math.ceil(time);
        var minute = parseInt(duration / 60);
        var sec = duration % 60 + '';
        var isM0 = ':';
        if (minute == 0) {
          minute = '00';
        } else if (minute < 10) {
          minute = '0' + minute;
        }
        if (sec.length == 1) {
          sec = '0' + sec;
        }
        return minute + isM0 + sec
      }
    }
  }
</script>

<style lang="less" scoped>
.audio-box {
  margin-top: 30px;
  width: 100%;
  height: 88px;
  background: #D9EDFF;
  border-radius: 44px;
  .article_audio {
    display: none;
    width: 100%;
  }
  
  .audio_box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .pgs {
    position: relative;
    top: 40px;
    left: -20px;
    right: 0;
    margin: 0 auto;
    width: 58%;
    height: 8px;
    /*overflow: hidden;*/
    background: #BADAF9;
    text-align: center;
  }
  
  .pgs-play {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background-color:#168DFF;
    z-index: 1;
  }
  
  .circle {
    position: absolute;
    top: -10px;
    left: -6px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color:#168DFF;
  }
  
  .play_btn {
    position: absolute;
    top: 16px;
    left: 5%;
    display: inline-block;
    width: 56px;
    height: 56px;
    background-size: contain;
    background-repeat: no-repeat;
    vertical-align: middle;
    background-image: url('~@/assets/img/icon_play.png');
  }
  
  .play_btn.on {
    background-size: contain;
    background-repeat: no-repeat;
    vertical-align: middle;
    background-image: url('~@/assets/img/icon_pause.png');
  }
  
  .time_p {
    // width: 3.8rem;
    font-size: 30px;
  }
  .playedTime, .totalTime {
    position: absolute;
    top: 24px;
    color: #168DFF;
    opacity: 0.8;
  }
  .playedTime {
    left: 1rem;
  }
  .totalTime {
    right: 40px;
  }
}
</style>