# RAG 系统最佳实践

## 1. 向量检索

```typescript
class VectorRetriever {
  async retrieve(query: string, options: RetrieveOptions): Promise<Chunk[]> {
    // 1. 嵌入查询
    const queryEmbedding = await this.embed(query);
    
    // 2. 向量搜索
    const results = await this.vectorStore.search(queryEmbedding, {
      topK: options.topK,
      filter: options.filter
    });
    
    // 3. 重排序
    if (options.rerank) {
      return await this.rerank(query, results);
    }
    
    return results;
  }
  
  private async rerank(query: string, results: Chunk[]): Promise<Chunk[]> {
    const scored = results.map(chunk => ({
      chunk,
      score: await this.calculateRelevance(query, chunk)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, 10).map(s => s.chunk);
  }
}
```

## 2. 混合检索

```typescript
class HybridRetriever {
  async retrieve(query: string): Promise<Chunk[]> {
    // 关键词搜索
    const keywordResults = await this.keywordIndex.search(query);
    
    // 向量搜索
    const vectorResults = await this.vectorIndex.search(query);
    
    // RRF 融合
    const fused = this.rrfFusion([
      { results: keywordResults, k: 60 },
      { results: vectorResults, k: 60 }
    ]);
    
    return fused;
  }
  
  private rrfFusion(
    searches: { results: Chunk[]; k: number }[]
  ): Chunk[] {
    const scores = new Map<string, number>();
    
    for (const search of searches) {
      search.results.forEach((chunk, i) => {
        const score = 1 / (search.k + i + 1);
        scores.set(chunk.id, (scores.get(chunk.id) || 0) + score);
      });
    }
    
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.getChunk(id));
  }
}
```

## 3. 索引优化

```typescript
class IndexOptimizer {
  async optimize(): Promise<void> {
    // 1. 去重
    await this.deduplicate();
    
    // 2. 更新向量
    await this.updateEmbeddings();
    
    // 3. 重建索引
    await this.rebuildIndex();
  }
  
  private async deduplicate(): Promise<void> {
    const duplicates = await this.findDuplicates();
    await this.delete(duplicates);
  }
}
```

---

*RAG 系统最佳实践 v1.0*
