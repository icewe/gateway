# RAG 系统设计指南

## 核心架构

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   文档      │───▶│  向量化     │───▶│  向量库    │
│   上传      │    │  Embedding │    │  Chroma/Pinecone │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   用户查询  │───▶│  相似度    │───▶│   LLM      │
│             │    │  检索      │    │   生成答案  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 向量化

```javascript
import { OpenAIEmbeddings } from 'langchain/embeddings';

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small'
});

const docs = ['文档1内容', '文档2内容'];
const vectors = await embeddings.embedDocuments(docs);
```

## 检索优化

### 分块策略

```javascript
const chunkStrategies = {
  // 固定大小
  fixed: (text, size = 500) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks;
  },
  
  // 按段落
  paragraph: (text) => {
    return text.split('\n\n').filter(p => p.trim());
  },
  
  // 递归分块
  recursive: (text, separators = ['\n\n', '\n', '. ']) => {
    // 逐步使用更细的分隔符
  }
};
```

### 混合检索

```javascript
const hybridSearch = async (query) => {
  // 向量检索
  const vectorResults = await vectorStore.similaritySearch(query);
  
  // 关键词检索
  const keywordResults = await keywordIndex.search(query);
  
  // RRF 融合
  const fused = rrfFusion([
    { results: vectorResults, weight: 0.7 },
    { results: keywordResults, weight: 0.3 }
  ]);
  
  return fused;
};
```

---

*RAG 设计 v1.0*
