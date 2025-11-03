import { useState, useEffect, useRef } from 'react'
import './App.css'
// 导入音频文件
import audioFile from './assets/ema.ogg'
// 导入图片数据和辅助函数
import { images, getDefaultImageUrl, getPressedImageUrl, getDefaultImageAlt, getPressedImageAlt } from './data/img'
import type { ImageData } from './data/img'
// 本地计数存储键名
const CLICK_COUNT_STORAGE_KEY = 'ema_puppy_click_count';

// 获取本地存储的点击计数
export const getLocalClickCount = (): number => {
  try {
    const stored = localStorage.getItem(CLICK_COUNT_STORAGE_KEY);
    return stored ? parseInt(stored, 10) || 0 : 0;
  } catch (error) {
    console.error('获取本地计数失败:', error);
    return 0;
  }
};

// 增加本地点击计数并返回新值
export const incrementLocalClickCount = (): number => {
  try {
    const currentCount = getLocalClickCount();
    const newCount = currentCount + 1;
    localStorage.setItem(CLICK_COUNT_STORAGE_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('增加本地计数失败:', error);
    return getLocalClickCount();
  }
};
import { artists } from './data/artists';
// 导入semiUI按钮组件
import { Button } from '@douyinfe/semi-ui';

// 缓存过期时间：24小时（单位：毫秒）
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000;

// 图片缓存服务
interface CachedImage {
  data: string;
  timestamp: number;
  alt: string;
}

// 音频缓存服务
interface CachedAudio {
  data: string;
  timestamp: number;
}

// 获取缓存的图片
export const getCachedImage = (url: string): CachedImage | null => {
  try {
    const cached = localStorage.getItem(`image_cache_${url}`);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached) as CachedImage;
    const now = Date.now();
    
    // 检查缓存是否过期
    if (now - parsed.timestamp > CACHE_EXPIRY_TIME) {
      localStorage.removeItem(`image_cache_${url}`);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('从缓存获取图片失败:', error);
    return null;
  }
};

// 缓存图片
export const cacheImage = (url: string, data: string, alt: string): void => {
  try {
    const cachedImage: CachedImage = {
      data,
      timestamp: Date.now(),
      alt
    };
    localStorage.setItem(`image_cache_${url}`, JSON.stringify(cachedImage));
  } catch (error) {
    console.error('缓存图片失败:', error);
  }
};

// 获取缓存的音频
export const getCachedAudio = (url: string): CachedAudio | null => {
  try {
    const cached = localStorage.getItem(`audio_cache_${url}`);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached) as CachedAudio;
    const now = Date.now();
    
    // 检查缓存是否过期
    if (now - parsed.timestamp > CACHE_EXPIRY_TIME) {
      localStorage.removeItem(`audio_cache_${url}`);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('从缓存获取音频失败:', error);
    return null;
  }
};

// 缓存音频
export const cacheAudio = (url: string, data: string): void => {
  try {
    const cachedAudio: CachedAudio = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`audio_cache_${url}`, JSON.stringify(cachedAudio));
  } catch (error) {
    console.error('缓存音频失败:', error);
  }
};

// 从URL加载音频并转换为base64
export const loadAudioAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 检查是否已有缓存
    const cached = getCachedAudio(url);
    if (cached) {
      resolve(cached.data);
      return;
    }
    
    // 使用fetch API加载音频文件
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`音频加载失败: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          // 缓存音频
          cacheAudio(url, dataUrl);
          resolve(dataUrl);
        };
        reader.onerror = () => {
          reject(new Error('无法读取音频文件'));
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('音频加载失败:', error);
        // 如果加载失败，返回原始URL作为后备
        resolve(url);
      });
  });
};

// 预加载并缓存音频
export const preloadAndCacheAudio = async (audioUrl: string): Promise<string> => {
  try {
    const audioData = await loadAudioAsBase64(audioUrl);
    console.log('音频已预加载并缓存');
    return audioData;
  } catch (error) {
    console.error('预加载音频失败:', error);
    return audioUrl; // 返回原始URL作为后备
  }
};

// 从URL加载图片并转换为base64
export const loadImageAsBase64 = (url: string, alt: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 检查是否已有缓存
    const cached = getCachedImage(url);
    if (cached) {
      resolve(cached.data);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // 允许跨域加载
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建canvas上下文'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      // 将图片转换为base64
      const dataUrl = canvas.toDataURL('image/png');
      
      // 缓存图片
      cacheImage(url, dataUrl, alt);
      
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      // 如果加载失败，返回原始URL作为后备
      console.error(`图片加载失败: ${url}`);
      resolve(url);
    };
    
    img.src = url;
  });
};



// 预加载并缓存所有图片
export const preloadAndCacheImages = async (imageList: ImageData[]): Promise<void> => {
  try {
    // 收集所有需要预加载的图片URL和alt
    const allImagesToLoad: {url: string, alt: string}[] = [];
    
    imageList.forEach(img => {
      // 预加载默认状态的图片
      allImagesToLoad.push({
        url: getDefaultImageUrl(img),
        alt: getDefaultImageAlt(img)
      });
      
      // 如果是多状态图片，还需要预加载按下状态的图片
      if (Array.isArray(img.url)) {
        const pressedImage = img.url.find(imgState => imgState.state === 1);
        if (pressedImage && pressedImage.src !== getDefaultImageUrl(img)) {
          allImagesToLoad.push({
            url: pressedImage.src,
            alt: pressedImage.alt
          });
        }
      }
    });
    
    // 执行预加载
    const promises = allImagesToLoad.map(img => loadImageAsBase64(img.url, img.alt));
    await Promise.all(promises);
    console.log('所有图片已预加载并缓存');
  } catch (error) {
    console.error('预加载图片失败:', error);
  }
};

// 定义气泡消息类型
interface BubbleMessage {
  id: string;
  x: number;
  y: number;
  opacity: number;
  translateY: number;
}

function App() {
  // 用于跟踪当前按下过程中是否已播放音频
  const [hasPlayed, setHasPlayed] = useState(false);
  // 用于存储点击次数，从本地存储初始化
  const [clickCount, setClickCount] = useState(getLocalClickCount());
  // 用于存储气泡消息
  const [bubbleMessages, setBubbleMessages] = useState<BubbleMessage[]>([]);
  // 图片元素引用，用于获取位置信息
  const imageRef = useRef<HTMLImageElement>(null);
  // 当前选中的随机图片
  const [currentImage, setCurrentImage] = useState(images[0]);
  // 是否显示红色滤镜（长按超过3秒）
  const [showRedFilter, setShowRedFilter] = useState(false);
  // 是否显示艺术家信息模态框
  const [showArtistModal, setShowArtistModal] = useState(false);
  // 长按定时器引用
  const longPressTimerRef = useRef<number | null>(null);
  // 预加载的音频数据URL
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string>(audioFile);
  // 控制移动端触摸状态（用于动画）
  const [isTouching, setIsTouching] = useState(false);
  
  // 组件挂载时预加载所有图片和音频
  useEffect(() => {
    // 预加载所有图片到缓存
    preloadAndCacheImages(images);
    
    // 预加载音频到缓存
    const loadAudio = async () => {
      try {
        const audioData = await preloadAndCacheAudio(audioFile);
        setCachedAudioUrl(audioData);
      } catch (error) {
        console.error('音频预加载失败:', error);
        // 如果预加载失败，继续使用原始URL
      }
    };
    
    // 随机选择并加载一张图片
    const loadRandomImage = async () => {
      const randomIndex = Math.floor(Math.random() * images.length);
      const selectedImage = images[randomIndex];
      
      try {
        // 尝试从缓存加载默认状态图片
        const defaultUrl = getDefaultImageUrl(selectedImage);
        const cached = getCachedImage(defaultUrl);
        
        // 无论是否有缓存，都保持原始图片结构
        // 缓存的图片会在渲染时通过辅助函数获取
        setCurrentImage(selectedImage);
        
        // 如果没有缓存，主动加载并缓存图片（不改变数据结构）
        if (!cached) {
          await loadImageAsBase64(defaultUrl, getDefaultImageAlt(selectedImage));
        }
        
        // 如果是多状态图片，也预加载按下状态的图片
        if (Array.isArray(selectedImage.url)) {
          const pressedUrl = getPressedImageUrl(selectedImage);
          if (pressedUrl !== defaultUrl && !getCachedImage(pressedUrl)) {
            await loadImageAsBase64(pressedUrl, getPressedImageAlt(selectedImage));
          }
        }
      } catch (error) {
        console.error('加载图片失败:', error);
        // 如果出错，使用原始图片
        setCurrentImage(selectedImage);
      }
    };
    
    // 并行加载音频和图片
    loadAudio();
    loadRandomImage();
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // 播放音频并增加点击计数函数
  const playSound = () => {
    if (!hasPlayed) {
        const audio = new Audio(cachedAudioUrl);
        // 设置音频起始位置，跳过开头无声音的部分（根据实际情况调整时间值）
        audio.currentTime = 0.05; // 跳过前0.1秒
        audio.play().catch(error => {
          console.error('音频播放失败:', error);
        });
        setHasPlayed(true);

        // 增加本地点击计数
        const newCount = incrementLocalClickCount();
        console.log('点击次数增加:', newCount);
        
        // 立即更新计数显示
        updateCounterValue();

      // 生成气泡消息
      createBubbleMessage();
    }

    // 设置长按定时器（1.5秒后显示红色滤镜）
    longPressTimerRef.current = setTimeout(() => {
      setShowRedFilter(true);
    }, 1500);
  };

  // 更新计数函数
  const updateCounterValue = () => {
    // 使用本地计数替代API调用
    const count = getLocalClickCount();
    setClickCount(count);
  };

  // 创建气泡消息函数
  const createBubbleMessage = () => {
    // 限制最大气泡数量为100
    if (bubbleMessages.length >= 100) {
      return;
    }

    // 获取图片元素的位置信息
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      // 计算相对于屏幕的绝对位置，确保气泡从图片区域产生
      const x = rect.left - rect.width * 0.3 + Math.random() * rect.width * 0.6; // 图片左侧10%到70%范围内
      const y = rect.top + rect.height * 0.2; // 图片上方20%高度处开始

      // 创建新的气泡消息
      const newBubble: BubbleMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        x,
        y,
        opacity: 1,
        translateY: 0
      };

      // 添加新气泡到状态中
      setBubbleMessages(prev => [...prev, newBubble]);

      // 设置动画定时器
      setTimeout(() => {
        // 动画结束后移除气泡
        setBubbleMessages(prev => prev.filter(bubble => bubble.id !== newBubble.id));
      }, 2000); // 2秒后移除
    }
  };

  // 更新气泡动画状态
  useEffect(() => {
    if (bubbleMessages.length === 0) return;

    // 每50ms更新一次动画状态
    const interval = setInterval(() => {
      setBubbleMessages(prev =>
        prev.map(bubble => ({
          ...bubble,
          // 向上移动
          translateY: bubble.translateY - 5,
          // 逐渐淡出
          opacity: bubble.opacity - 0.025
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [bubbleMessages.length]);

  // 重置播放状态函数
  const resetPlayState = () => {
    setHasPlayed(false);

    // 清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 解除红色滤镜
    setShowRedFilter(false);
  };

  // 设置定时器，每10秒获取一次最新的点击次数
  useEffect(() => {
    // 组件挂载时获取初始次数
    updateCounterValue();

    // 设置定时器
    const interval = setInterval(() => {
      updateCounterValue();
    }, 10000); // 10秒间隔

    // 清理函数
    return () => {
      clearInterval(interval);
    };
  }, []);


  return (
    <div className="app-container">
      <div className="image-container">
        <img
          ref={imageRef}
          src={isTouching ? getPressedImageUrl(currentImage) : getDefaultImageUrl(currentImage)}
          alt={isTouching ? getPressedImageAlt(currentImage) : getDefaultImageAlt(currentImage)}
          onMouseDown={(_e) => {
            // 设置触摸状态为true，用于图片切换
            setIsTouching(true);
            playSound();
          }}
          onMouseUp={(_e) => {
            // 设置触摸状态为false
            setIsTouching(false);
            resetPlayState();
          }}
          onMouseLeave={(_e) => {
            // 设置触摸状态为false
            setIsTouching(false);
            resetPlayState();
          }}
          onTouchStart={(e) => {
            // 阻止触摸事件触发鼠标事件
            e.preventDefault();
            // 设置触摸状态为true，用于动画
            setIsTouching(true);
            playSound();
          }}
          onTouchEnd={(e) => {
            // 阻止触摸事件触发鼠标事件
            e.preventDefault();
            // 设置触摸状态为false
            setIsTouching(false);
            resetPlayState();
          }}
          onTouchCancel={() => {
            // 设置触摸状态为false
            setIsTouching(false);
            resetPlayState();
          }}
          // 禁止右键菜单
          onContextMenu={(e) => e.preventDefault()}
          // 禁止拖拽图片
          onDragStart={(e) => e.preventDefault()}
          // 禁止长按事件（防止保存图片）
          onTouchMove={(e) => e.preventDefault()}
          className={`interactive-image ${showRedFilter ? 'red-filter' : ''} ${isTouching ? 'touch-active' : ''}`}
          touch-action="none"
          // 添加内联样式防止选择
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none'
          }}
        />
      </div>
      {/* 渲染所有气泡消息 - 与图片分离 */}
      <div className="bubble-container">
        {bubbleMessages.map(bubble => (
          <div
            key={bubble.id}
            className="bubble-message"
            style={{
              opacity: bubble.opacity,
              transform: `translate(${bubble.x}px, ${bubble.y + bubble.translateY}px)`
            }}
          >
            您已消耗一次免费触摸机会
          </div>
        ))}
      </div>
      <div className="counter-text">
        艾玛累计一共Kya了 {clickCount} 次
      </div>
      <div className="buttons-container">
        <Button type="tertiary" onClick={() => window.open('https://space.bilibili.com/403314450', '_blank')}>网站作者</Button>
        <Button type="tertiary" onClick={() => setShowArtistModal(true)}>图片画师</Button>
      </div>
      
      {/* 原生React实现的模态框 */}
      {showArtistModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '600px',
            maxWidth: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '0'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>图片画师</h2>
              <button
                onClick={() => setShowArtistModal(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {artists && artists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => window.open(artist.url, '_blank')}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {artist.name}
                </button>
              ))}
            </div>
            <div style={{
              padding: '20px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowArtistModal(false)}
                style={{
                  padding: '8px 24px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
