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

- [ ] tag color http://stackoverflow.com/questions/11120840/hash-string-into-rgb-color
- [ ] tag 添加filter
- [ ] redraw 触发优化
- [ ] 添加 tag 功能, 任务名称加 #tagName# 设置tag, 在task保存/更新的时候 提取保存tag, 显示的时候 ## 内容蓝色高亮
- [ ] windows 的 ctrl + enter 好像没有效果
- [ ] safari JSON.stringify 有问题, 需要重写一个signature 生成来描述变化 (本地有问题..线上倒是好的,, 奇怪)
- [ ] 添加浮层的休息倒计时显示
- [ ] 数据显示调研, 使用svg(d3?) 或者其他
    - calender: http://bl.ocks.org/mbostock/4063318
- [ ] 上https
- [ ] nginx 优化访问
- [ ] 添加周为单位的统计查看
- [ ] timer 上限改为10 (待议, 可配置吧)
- [ ] 统计功能 (不然一天白忙活, 没个总结)
- [ ] 添加优先级按钮 (low normal high, 还是挺重要的/ 改为添加置顶功能
- [ ] mongo 添加账号
- [x] 检查 nextNode 不存在的原因 (因为查询的时候没有加入user._id 的限制, 所以差错了.)
- [x] 添加限制条件
- [x] scroll 有点卡, 找找原因,  transform: translateZ(0);
- [x] 过零点强制刷新.
- [x] 添加 icon
- [x] 使用pm2 管理node 进程
- [x] login and register 使用jquery validation 优化一下.
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

# pomotodo 收费功能清单, 研究下可用性

- 重复任务提醒
- 时钟长度设置
- 补充番茄
- 子任务 (?)
- 周报功能 (邮件? 手动?)
- 打断记录
- 自定义音效 (到时提示和背景音效)
- icon 的base64 img 实时变化挺好的