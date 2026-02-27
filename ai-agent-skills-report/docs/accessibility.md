# 无障碍访问 (A11y)

## 语义化 HTML

```html
<!-- 正确 -->
<header>
  <nav aria-label="主导航">
    <ul>
      <li><a href="/" aria-current="page">首页</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>页面标题</h1>
  <article>
    <h2>文章标题</h2>
    <p>内容...</p>
  </article>
</main>

<footer>
  <p>&copy; 2024 公司</p>
</footer>
```

## ARIA

```html
<!-- 按钮 -->
<button aria-expanded="false" aria-controls="menu">
  菜单
</button>

<!-- 弹窗 -->
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">标题</h2>
</div>

<!-- 表单 -->
<label for="email">邮箱</label>
<input type="email" id="email" aria-required="true">
```

## 键盘导航

```css
/* 焦点样式 */
:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
}

.skip-link:focus {
  top: 0;
}
```

---

*无障碍访问 v1.0*
