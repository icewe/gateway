# 多模态 AI 指南

## 图像处理

```javascript
// 图像描述
const describeImage = async (imageUrl) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: '描述这张图片' },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    }]
  });
  return response.choices[0].message.content;
};
```

## 音频处理

```javascript
// 语音转文字
const transcribe = async (audioFile) => {
  const transcript = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1'
  });
  return transcript.text;
};

// 文字转语音
const speak = async (text) => {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text
  });
  return mp3;
};
```

## 视频处理

```javascript
// 视频摘要
const summarizeVideo = async (videoUrl) => {
  // 1. 提取帧
  const frames = await extractFrames(videoUrl, 10);
  
  // 2. 分析每帧
  const descriptions = await Promise.all(
    frames.map(f => describeImage(f))
  );
  
  // 3. 生成摘要
  const summary = await llm.summarize(descriptions.join('\n'));
  return summary;
};
```

---

*多模态 v1.0*
