/** Normalize the public Home Builder API payload into unique product records. */
export function normalizeHomePromotionProducts(payload) {
  const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.products) ? payload.products : []);
  const seen = new Set();
  return rows.map((row) => row?.product || row).filter((product) => {
    const id = product?.id ?? product?._id;
    if (id == null || seen.has(String(id))) return false;
    seen.add(String(id));
    return true;
  });
}
