/** 所有 api 接口的响应数据都应该准守该格式 */
interface ApiResponseData<T> {
  code: number
  data: T
  message: string
}

/** 通用分页返回结构 */
interface PageResult<T> {
  /** 数据列表 */
  data: T[]
  /** 总条数 */
  total: number
}
