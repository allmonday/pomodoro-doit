# mithril demo

## demo
[https://www.pomodorodoit.com](https://www.pomodorodoit.com)

## start

### requirement

- node
- mongodb

### run

```shell
cnpm install -g nodemon
cnpm install -g istanbul
npm run dev
```

## improvments

- [ ] notification 可能出现阻塞导致的多个同时弹出
- [ ] 添加查找功能, 根据标题和内容查找
- [ ] make it resizable https://github.com/RickStrahl/jquery-resizable
- [ ] 设计目标管理页面
- [ ] windows 的 ctrl + enter 好像没有效果
- [ ] tag 添加filter
- [ ] redraw 触发优化
- [ ] safari JSON.stringify 有问题, 需要重写一个signature 生成来描述变化 (本地有问题..线上倒是好的,, 奇怪)
    - calender: http://bl.ocks.org/mbostock/4063318
- [ ] nginx 优化访问
- [ ] 统计功能 (不然一天白忙活, 没个总结)
- [ ] mongo 添加账号
- [x] 上https
- [x] 完善了title 倒计时显示
- [x] 添加优先级按钮 (low normal high, 还是挺重要的/ 改为添加置顶功能
- [x] 数据显示调研, 使用svg(d3?) 或者其他
- [x] 添加周为单位的统计查看
- [x] 添加浮层的休息倒计时显示
- [x] 添加 tag 功能, 任务名称加 #tagName# 设置tag, 在task保存/更新的时候 提取保存tag, 显示的时候 ## 内容蓝色高亮
- [x] tag color http://stackoverflow.com/questions/11120840/hash-string-into-rgb-color
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


## future

- 重复任务提醒
- 时钟长度设置
- 补充番茄
- 周报功能
- 打断记录
- 自定义音效 (到时提示和背景音效)
- icon 的base64 img 实时变化挺好的

## updates
2017-01-25, update:
经过一阵子的修改, 处于基本可用的状态, 但是这个架构的可扩展性不佳, 如果要加功能, 需要做不小的重构

- 数据库, nosql => sql
- 后端, node -> ruby
- 前端 typescript + mithril(or react) + Redux
