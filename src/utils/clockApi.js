import axios from 'axios'
import { hex_md5 } from '@/utils/md5';

const apiName = 'Rat/EventHandle'
// 创建axios实例
const service = axios.create({
  baseURL: 'http://i.yd-jxt.com/v2', // api的base_url
  // baseURL: 'http://192.168.0.3:8888', // api的base_url
  // baseURL: 'http://192.168.0.123:8888', // api的base_url
  timeout: 30000 // 请求超时时间
})
// request拦截器
service.interceptors.request.use(config => {
  return config
}, error => {
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
    if (response.status === 200 || response.status === 304) {
      if (response.data.ResultCode === 1) {
      } else {
        console.log(response.data.ResultMessage)
      }
      return response.data
    } else {

      console.log('网络不太给力哦，检查一下您的网络再试吧！1111')
    }
  },
  error => {
    console.log('err' + error) // for debug
    console.log('网络不太给力哦，检查一下您的网络再试吧！2222')
    return Promise.reject(error)
  }
)


// const apiName = '/rat/EventHandle'


/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 * http://i.yd-jxt.com/v2/rat/EventHandle?
 * 'http://192.168.0.3:8888/Rat/EventHandle?'
 */




export function axGet(_cmd, _param, ) {
  return service({
    url: apiName,
    method: 'get',
    params: {
      json: JSON.stringify(urlFun(_cmd, _param)),
    }
  })
}
export function axPost(_cmd, _param) {
  return service({
    url: apiName,
    method: 'post',
    data: {
      json: JSON.stringify(urlFun(_cmd, _param)),
    },
    transformRequest: [function (data) {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }],
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  })
}
/* json function */
export function urlFun(_cmd, _param) {
  var _time = new Date().getTime() + ''
  var _uuid = guid()
  var _noce = noce()
  var _key = 'HTXFV-FH8YX-VCY69-JJGBK-7R6XP'
  var _appJson = {
    "AppId": 1,
    "Cmd": _cmd,
    "Ver": "1.0.0",
    "UnixTime": _time,
    "SessionId": _uuid,
    "Noce": _noce,
    "AppKey": _key,
    "SKey": md5('1', _cmd, _time, _noce, _key, _uuid),
    "JsonParts": _param,
  }
  return _appJson
}

function md5(appid, cmd, unixTime, noce, key, sessionId) {
  return hex_md5("Company=hzty&Ver=1.0.0&Methord=MD5&AppID=" + appid + "&Cmd=" + cmd + "&UnixTime=" + unixTime + "&Noce=" + noce + "&AppKey=" + key + "&SessionId=" + sessionId)
}
function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4())
}
function noce() {
  return parseInt(Math.random() * 100)
}

