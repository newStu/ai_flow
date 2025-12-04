import { createAlova } from 'alova'
import ReactHook from 'alova/react'
import { axiosRequestAdapter } from '@alova/adapter-axios'

// 1. 创建alova实例
const alovaInstance = createAlova({
  // ReactHook用于让alova支持react的hook能力
  statesHook: ReactHook,

  // 请求适配器，这里我们使用axiosRequestAdapter
  requestAdapter: axiosRequestAdapter(),

  // 全局请求拦截器
  beforeRequest(method) {
    // 假设我们需要在每个请求头中添加token
    method.config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
  },

  // 全局响应拦截器
  responded: {
    // 请求成功的拦截器
    onSuccess: async (response, method) => {
      const json = response.data
      if (json.code !== 200) {
        // 抛出错误，统一处理
        throw new Error(json.message)
      }

      // 解析数据，统一返回
      return json.data
    },

    // 请求失败的拦截器
    onError: async (err, method) => {
      // 统一处理错误
      console.error(err.message)
      throw err
    },
  },
})

export const alova = alovaInstance
