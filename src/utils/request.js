import Vue from "vue";

// 引用axios
const axios = require("axios");
const qs = require("qs"); // 序列化参数

let timer = null; // 定时器名称

axios.interceptors.request.use(
  config => {
    if (
      config.method === "post" &&
      config.headers["Content-Type"] === "application/x-www-form-urlencoded"
    ) {
      config.data = qs.stringify(config.data);
    }
    config.headers["Authorization"] = Vue.cookie.get("authToken") || "";
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
// response拦截器
axios.interceptors.response.use(
  res => {
    if (res.status == 200) {
      // console.log("进来了")
      // console.log(res.data,"res.data")
      return res.data;
    } else {
      return {
        msg: res.statusText
      };
    }
  },
  err => {
    return Promise.reject(err);
  }
);

function toType(obj) {
  return {}.toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase();
}

// 参数过滤函数
function filterNull(o) {
  for (var key in o) {
    if (o[key] === null) {
      delete o[key];
    }
    if (toType(o[key]) === "string") {
      o[key] = o[key].trim();
    } else if (toType(o[key]) === "object") {
      o[key] = filterNull(o[key]);
    } else if (toType(o[key]) === "array") {
      o[key] = filterNull(o[key]);
    }
  }
  return o;
}

//以下接口需要对请求失败时做特殊处理
var specialUrlArr = [
  {
    url: "/api/base/baseApi/getStudentQRCodeContent",
    msg: "扫码失败请重新扫码"
  },
  {
    url: "/api/evaluation/evaluationRecord/save",
    msg: "数据异常"
  },
  {
    url: "/api/evaluation/evaluationItem/custom",
    msg: "数据异常"
  },
  {
    url: "/api/evaluation/evaluationItem/comment",
    msg: "数据异常"
  }
];
var specialUrlArr2 = [
  {
    url: "/api/evaluation/scanCode/info/",
    msg: "扫码登陆"
  }
];

function apiAxios(method, url, params, file, special) {
  return new Promise((resolve, reject) => {
    if (params && !special) {
      params = filterNull(params);
    }
    var ctype;
    if (file) {
      ctype = "multipart/form-data";
    } else {
      // ctype = 'application/x-www-form-urlencoded'
      ctype = "application/json";
    }
    axios({
      method: method,
      url: special ? url + params : url,
      data: method === "POST" || method === "PUT" ? params : null,
      params: special
        ? null
        : method === "GET" || method === "DELETE"
        ? params
        : null,
      withCredentials: true,
      timeout: 1000 * 40,
      headers: { "Content-Type": ctype }
      // headers: { 'Content-Type': 'application/json ' }
    })
      .then(res => {
        // 关闭loading
        !!timer && clearTimeout(timer);
        timer = setTimeout(() => {
          Vue.$indicator.close();
        }, 1000);
        // console.log(res.resultCode)
        if (
          parseInt(res.resultCode) == 1 ||
          parseInt(res.ResultCode) == 1 ||
          parseInt(res.status) == 200
        ) {
          resolve(res);
        } else {
          for (var i = 0; i < specialUrlArr.length; i++) {
            if (specialUrlArr[i].url == url) {
              Vue.$toast(`${res.resultMessage || specialUrlArr[i].msg}`);
              resolve(res);
              return;
            }
          }
          for (var i = 0; i < specialUrlArr2.length; i++) {
            if (specialUrlArr2[i].url == url) {
              resolve(res);
              return;
            }
          }
          // console.log(res,"aaabbcc")
          resolve(res);
          // Vue.$toast(res.resultMessage)
        }
      })
      .catch(err => {
        if (err) {
          Vue.$indicator.close();
          if (JSON.stringify(err.response.status) == "401") {
            Vue.cookie.delete("authToken");
            setTimeout(() => {
              window.location.href = "/loginpwd";
            }, 500);
          }
        }
      });
  });
}

// 返回在vue模板中的调用接口
export default {
  get: async (url, params = {}) => {
    return apiAxios("GET", url, params);
  },
  get_special: async (url, params = {}) => {
    return apiAxios("GET", url, params, "", true);
  },
  post: async (url, params = {}) => {
    return apiAxios("POST", url, params);
  },
  postFile: async (url, params = {}) => {
    return apiAxios("POST", url, params, "file");
  },
  put: async (url, params = {}) => {
    return apiAxios("PUT", url, params);
  },
  delete: async (url, params = {}) => {
    return apiAxios("DELETE", url, params);
  },
  delete_special: async (url, params = {}) => {
    return apiAxios("DELETE", url, params, "", true);
  },
};
