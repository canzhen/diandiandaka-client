# diandiandaka

#### 待完成工作
1. 离开“我的打卡”界面时，要往数据库里更新所有被修改过的数据 【完成】✔️ 2018.08.02 22:27
2. 目前所有的图片，都换成从七牛获取，加快速速 【完成】✔️ 2018.08.03 13:15
3. “新卡片”图标完成左右滑动，避免图标太多导致遮挡，体验不好 【完成】✔️ 2018.08.03 13:29
4. “新卡片”支持用户上传自定义图标，图标统一上传到七牛云 【完成】✔️2018.08.03 14:35
5. 利用moment.js，将utils里关于时间的函数都improve一下 【完成】✔️ 2018.08.03 16:03
6. 修改dbhelper为仅剩增删改查
7. “我的打卡”离开页面时统一更新topic_check表
8. “历史”部分接入topic_check表
9. “历史”部分完成图表数据计算与展示
10. 完成“卡片设置”页面
11. 完成“卡片设置”后端数据库的增删改查

#### 项目介绍
微信小程序，点点打卡

#### 软件架构
软件架构说明


#### 安装教程

服务器端

1. clone到本地，只保留server部分，client部分可以删除
2. 主目录下运行npm install => pm2 start bin/www --watch --name diandiandaka，之后可用pm2 log diandiandaka查看运行日志
3. 运行定时任务，在主目录下运行crontab crontab_file即可

小程序端

直接pull放到微信开发者工具即可运行

#### 使用说明

1. xxxx
2. xxxx
3. xxxx
