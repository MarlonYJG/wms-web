/*
 * @Author: Marlon
 * @Date: 2025-10-08 12:16:40
 * @Description: 
 */
import { ElMessage } from 'element-plus'
import { http } from '@/http/axios'
import type { ApiResponse } from '@/common/apis/warehouse/type'

/**
 * 请求配置选项
 */
export interface RequestOptions {
  /** 是否自动显示错误提示，默认 true */
  showError?: boolean
  /** 是否自动显示成功提示，默认 false */
  showSuccess?: boolean
  /** 自定义成功提示信息 */
  successMessage?: string
  /** 自定义错误提示信息 */
  errorMessage?: string
}

/**
 * 智能API请求封装
 * @param requestFn 请求函数
 * @param options 配置选项
 * @returns Promise<T>
 */
export async function smartRequest<T>(
  requestFn: () => Promise<T>,
  options: RequestOptions = {}
): Promise<T> {
  const {
    showError = true,
    showSuccess = false,
    successMessage,
    errorMessage
  } = options

  try {
    const result = await requestFn()
    
    // 显示成功提示
    if (showSuccess && successMessage) {
      ElMessage.success(successMessage)
    }
    
    return result
  } catch (error: any) {
    // 显示错误提示
    if (showError) {
      const message = errorMessage || error.message || '请求失败'
      ElMessage.error(message)
    }
    
    throw error
  }
}

/**
 * 获取API响应数据
 * @param response API响应
 * @returns 响应数据
 */
export function extractData<T>(response: ApiResponse<T>): T {
  console.log(response)
  
  if (response.code === 200 || response.code === 201) {
    return response.data
  }
  throw new Error(response.msg || '请求失败')
}

/**
 * 处理API错误
 * @param error 错误对象
 * @returns 错误信息
 */
export function handleApiError(error: any): string {
  if (error.response?.data?.msg) {
    return error.response.data.msg
  }
  if (error.message) {
    return error.message
  }
  return '网络错误，请稍后重试'
}
