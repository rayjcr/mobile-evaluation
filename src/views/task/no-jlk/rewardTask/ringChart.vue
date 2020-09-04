<template>
  <div class="ringChart flex alignCenter justifySpaceBetween">
    <div class="graph">
      <div class="slice slice1"></div>
      <div class="slice slice2" :style="{'background-color':color,'transform':'rotate('+rotate+')'}"></div>
      <div class="text flex flex-column justifyCenter alignCenter">
        <span class="label">已完成</span>
        <span class="value">{{percent}}%</span>
      </div>
    </div>
    <div class="caption">
      <div class="item">
        <div class="label submited">共提交</div>
        <div class="value">{{chartData.submit}}次</div>
      </div>
      <div class="item">
        <div class="label should">应提交</div>
        <div class="value">{{chartData.should}}次</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "ringChart",
    props:['chartData'],
    data(){
      return {
        // chartData:{
        //   submit: 5,
        //   should: 20,
        // },
        percent: 0,
        color: '#FFF7E2',
        rotate: '0deg'
      }
    },
    watch:{
      chartData(val){
        console.log(val,40)
        this.getRotate();
      }
    },
    mounted(){
      this.getRotate();
    },
    methods:{
      getRotate(){
        var submit = this.chartData.submit;
        var should = this.chartData.should;
        var percent = submit/should;
        var rotate = Math.round(360*(percent>1?1:percent));
        this.percent = Math.round((percent>1?1:percent)*100);
        if(rotate>180){
          this.color = '#FFB600'
          this.rotate = '-' + (360-rotate) + 'deg';
        } else {
          this.color = '#FFF7E2';
          this.rotate = '-' + (180-rotate) + 'deg';
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .ringChart{
    background-color: #fff;
  }
  .graph{
    position: relative;
    width: 260px;
    height: 260px;
    border-radius: 130px;
    background-color: #FFB600;
    .slice{
      position: absolute;
      width: 100%;
      height: 100%;     
      border-radius: 50%;
      clip: rect(0px,130px,260px,0px);
      background-color: #FFF7E2;
    } 
    .slice1{
      transform: rotate(0);
    }
    .slice2{
      transition: transform 0.3s;
    }
  }
  .text{
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -100px;
    margin-top: -100px;
    height: 200px;
    width: 200px;
    background-color: #fff;
    border-radius: 50%;
    .label{
      font-size:28px;
      font-weight:400;
      color:rgba(174,182,193,1);
    }
    .value{
      font-size:48px;
      line-height: 66px;
      margin-top: 2px;
      font-weight:bold;
      color:rgba(41,45,51,1);
    }
  }
  .caption{
    width: 226px;
    padding-left: 20px;
    .item{
      &:nth-child(1){
        margin-bottom: 40px;
      }
      .label{
        position: relative;
        color:rgba(174,182,193,1);
        &::before{
          content: '';
          height: 12px;
          width: 12px;
          border-radius: 50%;
          position: absolute;
          left: -20px;
          top: 50%;
          margin-top: -6px;
        }
      }
      .submited::before{
        background-color: #FFB600;
      }
      .should::before{
        background-color: #FFF7E2;
      }
      
      .value{
        line-height:50px;
        font-size:36px;
        font-weight:bold;
        color: #292D33;
        margin-top: 20px;
      }
    }
  }
</style>
