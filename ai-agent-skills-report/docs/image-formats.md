# 图片格式对比

## 格式选择

| 格式 | 用途 | 特点 |
|------|------|------|
| JPEG | 照片 | 有损, 小 |
| PNG | 透明图 | 无损, 大 |
| WebP | 现代Web | 压缩好 |
| SVG | 图标 | 矢量, 小 |
| AVIF | 新标准 | 最小 |

## 转换

```bash
# ImageMagick
convert input.png -quality 80 output.jpg

# WebP
cwebp input.png -o output.webp
```

---

*图片格式 v1.0*
