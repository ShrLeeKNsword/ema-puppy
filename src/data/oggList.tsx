import oggEma from '../assets/ogg/ema.ogg'
import mp3Ema2Hiro from '../assets/ogg/ema2hiro.mp3'
import wavCiallo from '../assets/ogg/ciallo.wav'

// 定义音频对象接口
export interface AudioItem {
  src: string;
  offset: number; // 偏移时间（毫秒），0表示无偏移
  name: string;
}

// 创建音频列表
export const audioList: AudioItem[] = [
  {
    src: oggEma,
    offset: 50, // 0.05秒偏移
    name: 'Kya'
  },
  {
    src: wavCiallo,
    offset: 0, // 无偏移
    name: 'Ciallo'
  },
  {
    src: mp3Ema2Hiro,
    offset: 0, // 无偏移
    name: 'Hiro酱'
  }
];

// 随机获取一个音频
export const getRandomAudio = (): AudioItem => {
  const randomIndex = Math.floor(Math.random() * audioList.length);
  return audioList[randomIndex];
};

// 获取所有音频源（用于预加载）
export const getAllAudioSources = (): string[] => {
  return audioList.map(audio => audio.src);
};

// 按名称获取音频
export const getAudioByName = (name: string): AudioItem | undefined => {
  return audioList.find(audio => audio.name === name);
};