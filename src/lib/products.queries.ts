import { queryOptions } from "@tanstack/react-query";
import { getProduct, listProducts } from "./products.functions";

const PRODUCTS_CACHE_KEY = "topup-express:products:v1";
const PRODUCTS_STALE_TIME = 1000 * 60 * 10;
const PRODUCTS_GC_TIME = 1000 * 60 * 30;

export type ProductList = Awaited<ReturnType<typeof listProducts>>;

function readCachedProducts(): ProductList | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { savedAt?: number; products?: ProductList };
    if (!parsed.savedAt || Date.now() - parsed.savedAt > PRODUCTS_STALE_TIME) return undefined;
    return Array.isArray(parsed.products) ? parsed.products : undefined;
  } catch {
    return undefined;
  }
}

function writeCachedProducts(products: ProductList) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PRODUCTS_CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), products }),
    );
  } catch {
    // Private browsing/storage restrictions should never block the page.
  }
}

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const products = await listProducts();
    writeCachedProducts(products);
    return products;
  },
  initialData: readCachedProducts,
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