// 定义图片状态类型
export interface ImageState {
  state: 0 | 1; // 0表示默认状态，1表示按下状态
  src: string;
  alt: string;
}

// 定义图片数据类型
export interface ImageData {
  id: number;
  url: string | ImageState[];
  alt: string;
}

// 存储图片数据
export const images: ImageData[] = [
  {
    id: 1,
    url: [
      {
        state: 0,
        src: 'https://cdn.sa.net/2025/11/01/eNaMW9Qy5EsHAdK.png',
        alt: '>_<'  
      },
      {
        state: 1,
        src: 'https://cdn.sa.net/2025/11/01/k27uKp9taAUJrN8.png',
        alt: '>U<'  
      }
    ],
    alt: '>U<'  
  },
  {
    id: 2,
    url: [
      {
        state: 0,
        src: 'https://cdn.sa.net/2025/11/01/WkOA7pxLV9d81HY.png',
        alt: 'O^O'  
      },
      {
        state: 1,
        src: 'https://cdn.sa.net/2025/11/01/hSYlGCkQBFoXL6g.png',
        alt: 'O^O'  
      }
    ],
    alt: 'O^O'  
  },
  {
    id: 3,
    url: 'https://cdn.sa.net/2025/11/01/EeAl94KrsCNPGtZ.png',
    alt: 'doro'
  }
];

// 辅助函数：获取图片的默认状态URL
export const getDefaultImageUrl = (image: ImageData): string => {
  if (typeof image.url === 'string') {
    return image.url;
  }
  const defaultState = image.url.find(imgState => imgState.state === 0);
  return defaultState ? defaultState.src : image.url[0].src;
};

// 辅助函数：获取图片的按下状态URL
export const getPressedImageUrl = (image: ImageData): string => {
  if (typeof image.url === 'string') {
    return image.url; // 单张图片时返回相同URL
  }
  const pressedState = image.url.find(imgState => imgState.state === 1);
  return pressedState ? pressedState.src : getDefaultImageUrl(image);
};

// 辅助函数：获取图片的默认状态alt文本
export const getDefaultImageAlt = (image: ImageData): string => {
  if (typeof image.url === 'string') {
    return image.alt;
  }
  const defaultState = image.url.find(imgState => imgState.state === 0);
  return defaultState ? defaultState.alt : image.alt;
};

// 辅助函数：获取图片的按下状态alt文本
export const getPressedImageAlt = (image: ImageData): string => {
  if (typeof image.url === 'string') {
    return image.alt;
  }
  const pressedState = image.url.find(imgState => imgState.state === 1);
  return pressedState ? pressedState.alt : getDefaultImageAlt(image);
};