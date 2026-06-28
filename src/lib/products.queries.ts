import { queryOptions } from "@tanstack/react-query";
import { getProduct, listProducts } from "./products.functions";

const PRODUCTS_STALE_TIME = 1000 * 60 * 10;
const PRODUCTS_GC_TIME = 1000 * 60 * 30;

export type ProductList = Awaited<ReturnType<typeof listProducts>>;

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
  staleTime: PRODUCTS_STALE_TIME,
  gcTime: PRODUCTS_GC_TIME,
  retry: 1,
});

export const productQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => getProduct({ data: { id } }),
    staleTime: PRODUCTS_STALE_TIME,
    gcTime: PRODUCTS_GC_TIME,
    retry: 1,
  });