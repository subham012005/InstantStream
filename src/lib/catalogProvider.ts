/**
 * @deprecated
 * This file is kept for backwards compatibility only.
 * All new code should import from "@/lib/catalog" instead.
 *
 * The catalog system has been replaced by a pluggable provider architecture.
 * See src/lib/catalog/index.ts to swap providers.
 */
export {
  getCatalogProvider as getCatalogData,
  type CatalogItem,
  type CatalogRow,
  type CatalogHomepage as CatalogData,
  type NetflixCatalogProvider,
} from "./catalog";
