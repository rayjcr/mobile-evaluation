<template>
  <div id="barChart" class="chart-container"></div>
</template>

<script>
  import Echarts from 'echarts'

  // import echarts from 'echarts/lib/echarts';
  // 引入柱状图
  /*import 'echarts/lib/chart/bar';
  import 'echarts/lib/chart/line';
  import 'echarts/lib/component/title';
  import 'echarts/lib/component/legend';
  import 'echarts/lib/component/toolbox';
  import 'echarts/lib/component/markPoint';
  import 'echarts/lib/component/tooltip';*/

  export default {
    name: "Bar",
    props: {
        options: {
            type: Object,
            default:() => {}
        }
    },
    data() {
      return {
        barCharts: null,
        barOption: {
          grid: {
            left: '1%',
            right: '8%',
            top: '10%',
            bottom: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            show: false
          },
          yAxis: {
            type: 'category',
            show: false
          },
          series: [],
          color:[
            'rgb(51,165,255)',
            'rgb(255,136,41)',
            'rgb(253,206,72)',
            'rgb(143,234,96)',
          ]
        }
      }
    },
    methods: {
      initChart() {
        let new_options = Object.assign(this.barOption,this.options)
        this.barCharts = Echarts.init(document.getElementById('barChart'));
        this.barCharts.setOption(new_options);
        window.addEventListener('resize', this.handleResize)
      },
      handleResize() {
        this.barCharts.resize()
      },
      clear() {
        if (!this.barCharts) return;
        this.barCharts.clear()
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
      this.barCharts.dispose()
    }
  }
</script>

<style lang="less" scoped>
  .chart-container {
    width: 100%;
    height: 100%;
  }
</style>
