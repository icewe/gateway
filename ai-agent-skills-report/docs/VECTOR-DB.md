# 向量数据库对比

## 1. Pinecone

- 云托管
- 低延迟
- 自动扩缩容

```typescript
const pinecone = new PineconeClient();
const index = pinecone.Index('my-index');

await index.upsert([{ id: '1', values: [...] }]);
const results = await index.query({ topK: 10, vector: query });
```

## 2. Weaviate

- 开源
- 混合搜索
- GraphQL API

```typescript
const client = new WeaviateClient({});
await client.collections.create('Article');
```

## 3. Milvus

- 高性能
- 分布式
- 支持 GPU

```typescript
const milvus = new MilvusClient({ address: 'localhost:19530' });
await milvus.collection('articles').insert(data);
```

## 对比

| 特性 | Pinecone | Weaviate | Milvus |
|------|----------|----------|--------|
| 托管 | ✓ | - | - |
| 开源 | - | ✓ | ✓ |
| 延迟 | 低 | 中 | 中 |
| 规模 | 大 | 中 | 大 |

---

*向量数据库对比 v1.0*
