<template>
  <div id="radarChart" class="chart-container"></div>
</template>

<script>
  import Echarts from 'echarts'
  export default {
    name: "Radar",
    props: {
        options: {
            type: Object,
            default:() => {}
        }
    },
    data() {
      return {
        radarCharts: null,
        radarOptions: {
          legend:{
            type: 'scroll',
            orient: 'vertical',
            icon: "circle",
            top:0,
            left:0,
            itemHeight: 8,
            itemWidth:8,
            textStyle:{
                color: "#B6B8B8",
            }
          },
          radar: {
            name: {
              textStyle: {
                color: '#262727'
              }
            },
            axisLine:{
              lineStyle: {
                type: 'dashed',
              }
            },
            splitArea:{
              show: false,
            },
            indicator: []
          },
          series: [{
            type: 'radar',
            symbol: 'circle',
            symbolSize: 10,
            itemStyle:{
                borderColor: '#fff',
            },
            areaStyle:{
                opacity:0.1
            },
            data : [
              {
                // value : [40, 60, 60, 50],
                value: [],
                name : '我的卡数'
              },
              {
                // value : [70, 60, 50, 40],
                value: [],
                name : '年级平均'
              },
              {
                //value : [80, 50, 50, 30],
                value: [],
                name : '班级平均'
              }
            ]
          }],
          color:[
            'rgb(255,182,0)',
            'rgb(51,165,255)',
            'rgb(0,205,134)'
          ]
        }
      }
    },
    mounted() {
      /*this.$nextTick(() => {
        this.initChart();
      })*/
    },
    methods: {
      initChart() {
        let new_options = Object.assign(this.radarOptions,this.options)
        this.radarCharts = Echarts.init(document.getElementById('radarChart'));
        this.radarCharts.setOption(new_options);
        window.addEventListener('resize', this.handleResize)
      },
      handleResize() {
        this.radarCharts.resize()
      },
      clear() {
        if (!this.radarCharts) return;
        this.radarCharts.clear()
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
      this.radarCharts.dispose()
    }
  }
</script>

<style lang="less" scoped>
  .chart-container {
    width: 100%;
    height: 100%;
  }
</style>
