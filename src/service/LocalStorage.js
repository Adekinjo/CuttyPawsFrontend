const safeParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const addToRecentlyViewed = (product) => {
    const recentlyViewed = safeParse(localStorage.getItem("recentlyViewed"), []);
  
    const existingIndex = recentlyViewed.findIndex((p) => p.id === product.id);
  
    if (existingIndex !== -1) {
      recentlyViewed.splice(existingIndex, 1);
    }
  
    recentlyViewed.unshift(product);
  
    if (recentlyViewed.length > 5) {
      recentlyViewed.pop();
    }
  
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
  };
  
export const getRecentlyViewed = () => {
  return safeParse(localStorage.getItem("recentlyViewed"), []);
};
