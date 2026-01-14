// Vite 环境下设置 public path
if (window.__POWERED_BY_QIANKUN__) {
  // Vite 使用 import.meta.env.BASE_URL，但 qiankun 需要设置 __webpack_public_path__
  // 对于 Vite，这个文件主要用于兼容性
  if (typeof __webpack_public_path__ !== 'undefined') {
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || '/';
  }
}