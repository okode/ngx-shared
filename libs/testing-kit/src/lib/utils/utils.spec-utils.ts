export const getNormalizedTextContent = (e?: Element | null) => e?.textContent?.trim();

export const clearDom = () => {
  // Reset JSDom after each test
  document.getElementsByTagName('html')[0].innerHTML = '';
};
