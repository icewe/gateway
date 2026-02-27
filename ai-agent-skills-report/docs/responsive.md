# 响应式设计

## 断点

```css
/* 移动优先 */
.container {
  width: 100%;
  padding: 1rem;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

## 弹性布局

```css
/* Flexbox */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-4 {
  gap: 1rem;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

## 响应式图片

```css
img {
  max-width: 100%;
  height: auto;
}

.picture img {
  object-fit: cover;
}
```

---

*响应式设计 v1.0*
