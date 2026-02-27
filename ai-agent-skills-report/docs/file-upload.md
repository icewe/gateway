# 文件上传处理

## 前端

```javascript
const upload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};

// 多文件
const uploadMultiple = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  // ...
};
```

## 后端 Express

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ 
    filename: req.file.filename,
    original: req.file.originalname 
  });
});
```

---

*文件上传 v1.0*
