# Python AI 开发

## 基础库

```python
# 数据处理
import pandas as pd
import numpy as np

# AI/ML
import openai
from anthropic import Anthropic

# 向量
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# 异步
import asyncio
```

## OpenAI 调用

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个助手"},
        {"role": "user", "content": "你好"}
    ]
)

print(response.choices[0].message.content)
```

## 异步调用

```python
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def main():
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "你好"}]
    )
    print(response.choices[0].message.content)

asyncio.run(main())
```

---

*Python AI v1.0*
