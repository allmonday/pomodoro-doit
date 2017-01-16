# mithril demo

## start

```shell
cnpm install -g nodemon
cnpm install -g istanbul
npm run dev
```

## todo
- pause pomodoro
- use separated panel editing note
- rename
    - Pomokodo
- add account
- edit task

## 体验

感觉还谈不上好用, 一来受制于浏览器页面之内, 无法做到app独立显示在窗口之中, 容易被忽视
二是番茄用来预估时间的功能没有体现, 要显示出来今天还有多少时间的预估工作量

几个改进点:

- [ ] 过零点强制刷新.
- [ ] 添加 icon
- [ ] 上https
- [ ] nginx 优化访问
- [ ] 添加 icon
- [ ] 添加限制条件
- [ ] 检查 nextNode 不存在的原因
- [ ] 添加周为单位的查看
- [ ] timer 上限改为10 (待议)
- [ ] 优雅的弹窗实现
- [ ] 统计功能 (不然一天白忙活, 没个总结)
- [ ] 添加优先级按钮 (low normal high, 还是挺重要的/ 改为添加置顶功能
- [ ] mongo 添加账号
- [ ] login and register 使用jquery validation 优化一下.
- [x] start 按钮放在task 上, task 执行时修改状态颜色
- [x] 内部拖拽似乎有问题
- [x] 添加 cache buster.
- [x] today task 可以点击, 在另一个窗口中之间编辑 // 需要代码重构
- [x] + - 放在 pomodoros 的上面
- [x] + - 逻辑 
- [x] 当天未完成的功能在左边显示出来 (显示昨天的未完成tasks)
- [x] note 设置成 debounce 之后自动保存
- [x] notifaction 似乎有bug
- [x] 改成倒计间
- [x] task 和today 的框都太大了点
- [x] 删除操作弹框确认
- [x] 添加快捷键

# understanding mithril

# long term todo 

- [ ] server 端换个go 试试
- [ ] react 重构
- [ ] typescript
- [ ] use scala as backend