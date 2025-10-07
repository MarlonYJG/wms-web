import type { ProductSku, ProductSkuForm, ProductSkuQuery } from "./type"
import { http } from "@/http/axios"

/** 获取商品SKU列表 */
export function getProductSkuList(params: ProductSkuQuery) {
  return http.get<ProductSku[]>("/product-sku", { params })
}

/** 获取商品SKU详情 */
export function getProductSkuDetail(id: number) {
  return http.get<ProductSku>(`/product-sku/${id}`)
}

/** 创建商品SKU */
export function createProductSku(data: ProductSkuForm) {
  return http.post<ProductSku>("/product-sku", data)
}

/** 更新商品SKU */
export function updateProductSku(id: number, data: ProductSkuForm) {
  return http.put<ProductSku>(`/product-sku/${id}`, data)
}

/** 删除商品SKU */
export function deleteProductSku(id: number) {
  return http.delete(`/product-sku/${id}`)
}

/** 获取商品库存信息 */
export function getProductInventory(productSkuId: number, warehouseId?: number) {
  return http.get(`/product-sku/${productSkuId}/inventory`, {
    params: { warehouseId }
  })
}
