# AI Agent 伦理与合规

## 1. 内容审核

```typescript
class ContentModerator {
  private filters = [
    new HateSpeechFilter(),
    new ViolenceFilter(),
    new SpamFilter()
  ];
  
  async moderate(content: string): Promise<ModerationResult> {
    const results = await Promise.all(
      this.filters.map(f => f.check(content))
    );
    
    const violations = results.filter(r => r.violated);
    
    return {
      safe: violations.length === 0,
      violations: violations.map(v => ({
        type: v.type,
        severity: v.severity
      }))
    };
  }
}
```

## 2. 隐私保护

```typescript
class PrivacyGuard {
  // PII 检测与脱敏
  sanitize(text: string): string {
    let sanitized = text;
    
    // 邮箱
    sanitized = sanitized.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[EMAIL]'
    );
    
    // 手机号
    sanitized = sanitized.replace(
      /1[3-9]\d{9}/g,
      '[PHONE]'
    );
    
    return sanitized;
  }
  
  // 数据保留策略
  async applyRetentionPolicy(data: Data[]): Promise<void> {
    const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
    
    const toDelete = data.filter(d => d.createdAt < cutoff);
    await this.delete(toDelete);
  }
}
```

## 3. 合规日志

```typescript
class ComplianceLogger {
  async log(event: ComplianceEvent): Promise<void> {
    const entry = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      userId: event.userId,
      action: event.action,
      result: event.result,
      metadata: this.sanitize(event.metadata)
    };
    
    await this.db.complianceLogs.insert(entry);
  }
}
```

---

*AI Agent 伦理与合规 v1.0*
