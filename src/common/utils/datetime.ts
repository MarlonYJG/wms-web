import dayjs from 'dayjs'

/**
 * 时间处理工具类
 * 
 * 用于处理时间戳和日期字符串之间的转换
 */

/**
 * 时间戳转日期字符串
 * @param timestamp 时间戳（毫秒）
 * @param format 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 日期字符串
 */
export function timestampToString(timestamp: number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!timestamp) return ''
  return dayjs(timestamp).format(format)
}

/**
 * 日期字符串转时间戳
 * @param dateString 日期字符串
 * @returns 时间戳（毫秒）
 */
export function stringToTimestamp(dateString: string): number {
  if (!dateString) return 0
  return dayjs(dateString).valueOf()
}

/**
 * 获取当前时间戳
 * @returns 当前时间戳（毫秒）
 */
export function getCurrentTimestamp(): number {
  return Date.now()
}

/**
 * 格式化时间戳为相对时间
 * @param timestamp 时间戳（毫秒）
 * @returns 相对时间字符串
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return ''
  return dayjs(timestamp).fromNow()
}

/**
 * 格式化时间戳为日期
 * @param timestamp 时间戳（毫秒）
 * @returns 日期字符串 YYYY-MM-DD
 */
export function formatDate(timestamp: number): string {
  if (!timestamp) return ''
  return dayjs(timestamp).format('YYYY-MM-DD')
}

/**
 * 格式化时间戳为时间
 * @param timestamp 时间戳（毫秒）
 * @returns 时间字符串 HH:mm:ss
 */
export function formatTime(timestamp: number): string {
  if (!timestamp) return ''
  return dayjs(timestamp).format('HH:mm:ss')
}

/**
 * 格式化时间戳为日期时间
 * @param timestamp 时间戳（毫秒）
 * @returns 日期时间字符串 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(timestamp: number): string {
  if (!timestamp) return ''
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}