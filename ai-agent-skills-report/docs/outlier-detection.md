# 异常值检测

## Z-Score

```python
import numpy as np

def z_score(data, threshold=3):
    mean = np.mean(data)
    std = np.std(data)
    outliers = []
    for i, x in enumerate(data):
        z = (x - mean) / std
        if abs(z) > threshold:
            outliers.append(i)
    return outliers
```

## IQR 方法

```python
def iqr_outliers(data):
    q1 = np.percentile(data, 25)
    q3 = np.percentile(data, 75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    return [i for i, x in enumerate(data) if x < lower or x > upper]
```

---

*异常值检测 v1.0*
