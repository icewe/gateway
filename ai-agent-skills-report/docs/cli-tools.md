# 命令行效率工具

## find

```bash
# 查找文件
find . -name "*.js"
find . -type f -name "*.md"

# 查找并删除
find . -name "*.log" -delete

# 查找并执行
find . -name "*.js" -exec wc -l {} \;
```

## grep

```bash
# 搜索内容
grep "error" file.log
grep -r "function" ./src

# 忽略大小写
grep -i "error" file.log

# 显示行号
grep -n "error" file.log
```

## awk

```bash
# 打印列
awk '{print $1}' file.txt

# 条件过滤
awk '$3 > 50' file.txt

# 统计
awk '{sum+=$1} END {print sum}' file.txt
```

## sed

```bash
# 替换
sed 's/old/new/g' file.txt

# 删除行
sed '/pattern/d' file.txt

# 原地编辑
sed -i 's/old/new/g' file.txt
```

---

*命令行工具 v1.0*
