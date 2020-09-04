<template>
  <div id="lineChart" ref="lineChart"></div>
</template>

<script>
  import echarts from 'echarts'
  export default{
    name: 'lineChart',
    props: ['chartData'],
    mounted() {
      if(this.chartData){
        this.init();
      }      
    },
    methods:{
      init(){
        var myChart = echarts.init(this.$refs.lineChart);
        var axis = [];
        var data = [];
        this.chartData.forEach(e=>{
          if(e.sortNumber!=8){
            axis.push(e.dimensionName)
            data.push(e.dimensionTotalScore)            
          }
        })
        var option = {
          color:['#FF5656','#FF9A27','#FFD91C','#3CD854','#3AD298','#40A3F5','#9668EB'],
          grid:{
            top: 42,
            bottom: 40,
            left: 41,
            right:14
          },
          xAxis: {
              type: 'category',
              data: axis,
              axisLine:{
                lineStyle:{
                  color:'#E2E4E6'
                }
              },
              axisLabel:{
                interval: 0,
                color: '#262626'
              },
              axisTick:{show: false},
              splitLine:{
                lineStyle:{
                  color:'#E2E4E6'
                }
              }
          },
          yAxis: {
              type: 'value',
              name: '分数',
              nameTextStyle:{
                color: '#262626'
              },
              axisLine:{
                lineStyle:{
                  color:'#E2E4E6'
                }
              },
              axisLabel:{
                color: '#262626'
              },
              axisTick:{show: false},
              splitLine:{
                lineStyle:{
                  color:'#E2E4E6'
                }
              }
          },
          series: [{
              data: data,
              type: 'bar',
              barWidth: 10,
              itemStyle: {
                color: function(params){
                  return option.color[params.dataIndex];
                }
              }
          }]
        };
        
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
      }
    },
    watch:{
      chartData(val){
        console.log(val)
        this.init();
      }
    }
  }
</script>

<style scoped>
  #lineChart{
    height: 100%;
    width: 100%;
  }
</style>
