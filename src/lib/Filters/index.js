import Vue from 'vue'

import * as filters from './main.js'

// 遍历所有导出的过滤器并添加到全局过滤器
Object.keys(filters).forEach((key) => {
    Vue.filter(key, filters[key]);
})
