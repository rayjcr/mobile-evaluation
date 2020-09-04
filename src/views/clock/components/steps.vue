<<template>
  <div>
    <div class="step_warp clearfix">
      <div class="step_left fl">
        <img :src="clockData.DateState % 2 !=0 ?  require('../img/in.png'): require('../img/out.png')"/>
        <div v-if="showMontant && dataLength > 1 " class="left-line"></div>
      </div>
      <div class="step_right fl">
        <p class="inTime">{{clockData.DateState%2!=0?'进':'离'}}校时间 {{clockData.JudgeTimes.TimeJudge1}}</p>
        <p class="clockTime flex" v-show="showState()"><span class="cardCon" v-if="clockData.CardState != 5">{{clockData.ShortCardDate == null ? '' : clockData.IsManual == true ? '补签':'打卡时间'}} {{clockData.ShortCardDate}}</span> <span class="belate" :class="{'normal':clockData.CardState == 1}" v-if="clockData.CardStateStr!=null && clockData.showStatus == true && clockData.CardState != 5">{{clockData.CardStateStr}}</span></p>
        <p class="adress" v-if="clockData.Address != null && clockData.Address != ''"><img src="../img/adress.png"/>{{clockData.Address}}</p>
        
        
      </div>
    </div>
  </div>
</template>
<script>
import formatDate from '@/utils/formatDate/formatDate'
export default {
  data(){
    return{
      showStatu:true,
    }
  },
  props:{
    showMontant:{//是否显示竖杆
      type:Boolean,
      default:true,
    },
    keyIndex:{//单数是进校  双数是离校
      type:Number,
    },
    clockData:{//打卡数据
      type:Object,
    },
    isTody:{//是否是今天
      type:Boolean,
    },
   
    dataLength: {
      type: Number
    },
    userName: {
      type: String
    },
    userCode: {
      type: String
    },
  },
  created() {
  },
  methods:{
    
    showState(){
      let nowDay = formatDate(new Date().getTime(),'yyyy-MM-dd');
      let nowDate = new Date().getTime();
      let time2 = new Date((nowDay+' '+this.clockData.JudgeTimes.Time2).replace(/-/g, "/")).getTime();
      if(nowDate < time2 && this.clockData.CardState == -3){
        return false
      }
      return true
    },
    
  }
}
</script>
<style lang="less" scoped>
  .step_warp{
    overflow: hidden;
    .step_left{
      width: 44px;
      img{
        width: 44px;
        height: 44px;
      }
      div{
        height: 174px;
        width: 3px;
        background-color: #D4D8D9;
        margin:-4px auto 0 auto;
      }
    }
    .step_right{
      margin-left: 8px;
      padding-bottom:6px;
      .inTime{
        color: #333;
        font-size: 28px;
      }
      .clockTime{
        .cardCon{
          font-size: 32px;
          color:#262626;
          font-weight: bold;
          margin-top:2px;
          display:block;
        }
        .belate{
          border:1.5px solid #FF9900;
          color:#FF9900;
          padding:3px 4px;
          font-size: 22px;
          border-radius: 2px;
          display:block;
          height:32px;
          line-height:32px;
          margin-top:14px;
          margin-left:8px;
        }
        .normal{
          border:1.5px solid #00cd86;
          color:#00cd86;
          font-size: 22px;
          border-radius: 2px;
          
        }
      }
      .adress{
        img{
          width: 20px;
          height: 24px;
          margin-right: 5px;
        }
        margin-top:4px;
        color: #333333;
        font-size:28px;
      }
      
    }
  }
  
</style>