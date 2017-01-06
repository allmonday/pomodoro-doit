# mithril demo

## start

```shell
cnpm install nodemon
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
- [x] 改成倒计
- today task 可以点击, 在另一个窗口中之间编辑
- note 设置成 debounce 之后自动保存
- []统计功能 (不然一天白忙活, 没个总结)
- [] 当天未完成的功能在左边显示出来
- [x] task 和today 的框都太大了点
- [x] 删除操作弹框确认
- [] 添加合件键

# understanding mithril