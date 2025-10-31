// API配置信息
const API_CONFIG = {
  INCREMENT_URL: 'https://js.ruseo.cn/api/counter.php?api_key=75715be196b2821b25483e8d15ac02c4&action=increment&counter_id=dcdf26f005a6863f23d3a0f7fb80757d&value=1',
  GET_COUNT_URL: 'https://js.ruseo.cn/api/counter.php?api_key=75715be196b2821b25483e8d15ac02c4&action=get&counter_id=dcdf26f005a6863f23d3a0f7fb80757d'
};

/**
 * 增加点击次数
 * @returns Promise<boolean> 是否成功
 */
export const incrementCounter = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_CONFIG.INCREMENT_URL, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    // 根据实际API响应结构，检查success字段
    return data.success === true;
  } catch (error) {
    console.error('增加点击次数失败:', error);
    return false;
  }
};

/**
 * 获取当前点击次数
 * @returns Promise<number> 当前点击次数
 */
export const getCounterValue = async (): Promise<number> => {
  try {
    const response = await fetch(API_CONFIG.GET_COUNT_URL, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    // 根据实际API响应结构，从counter.current_count获取计数值
    if (data.success === true && data.counter && data.counter.current_count) {
      return parseInt(data.counter.current_count, 10) || 0;
    }
    return 0;
  } catch (error) {
    console.error('获取点击次数失败:', error);
    // 获取失败时不改变当前值
    return -1;
  }
};

// 原始数据保留，供参考
export const apiData = [
  {
    id: 1,
    url: API_CONFIG.INCREMENT_URL,
    method: 'GET',
    info: '增加点击次数'
  },
  {
    id: 2,
    url: API_CONFIG.GET_COUNT_URL,
    method: 'GET',
    info: '获取点击次数'
  }
];