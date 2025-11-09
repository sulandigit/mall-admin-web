// 图片懒加载指令
const LazyLoad = {
  // 默认图片，可以是loading图片或者placeholder
  defaultSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIHN0cm9rZT0iI0VCRUJFQiIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxwYXRoIGQ9Ik0yMCAxNFYyNk0xNCAyMEgyNiIgc3Ryb2tlPSIjQ0RDRENEIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',
  
  // 错误图片
  errorSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIHN0cm9rZT0iI0Y1NjU2NSIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxwYXRoIGQ9Ik0xNiAxNkwyNCAyNE0yNCAxNkwxNiAyNCIgc3Ryb2tlPSIjRjU2NTY1IiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',

  // 创建Intersection Observer
  createObserver(callback) {
    const options = {
      root: null,
      rootMargin: '50px', // 提前50px开始加载
      threshold: 0.01 // 当1%的图片进入视口时触发
    };

    return new IntersectionObserver(callback, options);
  },

  // 加载图片
  loadImage(src, img, binding) {
    return new Promise((resolve, reject) => {
      const imageLoader = new Image();
      
      imageLoader.onload = () => {
        // 图片加载成功
        img.src = src;
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        
        // 如果有加载成功的回调
        if (binding.value && typeof binding.value.onLoad === 'function') {
          binding.value.onLoad();
        }
        
        resolve();
      };
      
      imageLoader.onerror = () => {
        // 图片加载失败
        img.src = this.errorSrc;
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-error');
        
        // 如果有加载失败的回调
        if (binding.value && typeof binding.value.onError === 'function') {
          binding.value.onError();
        }
        
        reject();
      };
      
      imageLoader.src = src;
    });
  },

  // 指令绑定时调用
  bind(el, binding) {
    // 检查浏览器是否支持Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // 不支持的话直接显示图片
      let imageSrc = '';
      if (typeof binding.value === 'string') {
        imageSrc = binding.value;
      } else if (typeof binding.value === 'object') {
        imageSrc = binding.value.src || binding.value;
      }
      
      if (imageSrc) {
        el.src = imageSrc;
      } else {
        el.src = this.errorSrc;
      }
      return;
    }
    
    // 添加CSS类用于样式控制
    el.classList.add('lazy-image');
    
    // 如果传入的是字符串，则直接作为图片地址
    let imageSrc = '';
    let options = {};
    
    if (typeof binding.value === 'string') {
      imageSrc = binding.value;
    } else if (typeof binding.value === 'object') {
      imageSrc = binding.value.src || binding.value;
      options = binding.value;
    } else {
      imageSrc = binding.value;
    }
    
    // 如果没有图片地址，显示错误图片
    if (!imageSrc) {
      el.src = this.errorSrc;
      return;
    }
    
    // 保存原始src
    el.dataset.src = imageSrc;
    
    // 设置默认图片
    el.src = options.placeholder || this.defaultSrc;
    el.classList.add('lazy-loading');
    
    // 创建observer
    const observer = this.createObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 图片进入视口，开始加载
          const img = entry.target;
          const src = img.dataset.src;
          
          if (src) {
            this.loadImage(src, img, binding).finally(() => {
              // 加载完成后停止观察
              observer.unobserve(img);
            });
          }
        }
      });
    });
    
    // 开始观察
    observer.observe(el);
    
    // 保存observer引用，用于解绑时清理
    el._lazyObserver = observer;
  },

  // 指令更新时调用
  update(el, binding) {
    // 如果图片地址发生变化，重新设置
    let newImageSrc = '';
    
    if (typeof binding.value === 'string') {
      newImageSrc = binding.value;
    } else if (typeof binding.value === 'object') {
      newImageSrc = binding.value.src || binding.value;
    } else {
      newImageSrc = binding.value;
    }
    
    const oldImageSrc = el.dataset.src;
    
    if (newImageSrc !== oldImageSrc) {
      // 重新设置数据和状态
      el.dataset.src = newImageSrc;
      
      if (!newImageSrc) {
        el.src = this.errorSrc;
        return;
      }
      
      // 重置样式类
      el.classList.remove('lazy-loaded', 'lazy-error');
      el.classList.add('lazy-loading');
      
      // 设置默认图片
      const options = typeof binding.value === 'object' ? binding.value : {};
      el.src = options.placeholder || this.defaultSrc;
      
      // 如果图片已经在视口中，立即加载
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInViewport) {
        this.loadImage(newImageSrc, el, binding);
      }
    }
  },

  // 指令解绑时调用
  unbind(el) {
    // 清理observer
    if (el._lazyObserver) {
      el._lazyObserver.disconnect();
      delete el._lazyObserver;
    }
    
    // 清理数据
    delete el.dataset.src;
    
    // 清理CSS类
    el.classList.remove('lazy-image', 'lazy-loading', 'lazy-loaded', 'lazy-error');
  }
};

export default LazyLoad;