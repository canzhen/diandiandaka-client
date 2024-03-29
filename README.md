# 点点小打卡

更新七牛云证书步骤：
1. 七牛云申请证书，在ssl证书服务->购买证书->补全证书信息->配置域名进行证书验证->证书下发。
2. 腾讯云配置证书
3. 七牛更新证书：申请证书/上传证书->已过期的证书系统会自动更新，如果未生效->融合cdn域名管理->配置->https配置->配置证书。


2019.07.02 修复bug：
1. 日历上滑的时候没有显示历史打卡记录，由于check_first_date和check_last_date逻辑混乱导致。
2. 单击日期，在电脑模拟器上显示的日期是正确的，在真机上却显示“1年 1月”，原因是因为start_date是moment()格式，而不是字符串格式。


#### 项目介绍
微信小程序，点点小打卡

#### 开发教程

服务器

1. 进入/home/ubuntu/receiver，运行node server.js打开本地和服务器同步的接口
2. redis-server --port 6226 & 在后端打开redis服务器，要查看redis的时候：redis-cli -p 6226
3. mysql -uroot diandiandaka -p （mysql123）打开数据库
4. 进入/home/ubuntu/diandiandaka，运行pm2 start bin/www --watch --name dddk，再运行pm2 log dddk即可查看日志
5. 进入/usr/local/nginx（nginx当时是用编译安装的），运行sbin/nginx -c conf/nginx.conf，启动nginx
6. 如果要编辑定时任务，crontab -e修改即可，crontab -l查看定时任务是否被添加

本地
1. 进入开发目录，进入server目录，运行fis3 release -w，即可自动监控改动同步到服务器

至此，可以开始开发了。



#### 安装教程

服务器端

1. clone到本地，只保留server部分，client部分可以删除
2. 安装

    1）npm
    
    2）redis-server （apt install redis-server）
       运行：redis-server --port 6226 & 在后端打开redis服务器，要查看redis的时候：redis-cli -p 6226
       
    3）pm2 （npm install pm2 -g）
    
    4）node，mysql，以及node-mysql module（npm install mysql）
       mysql -uroot diandiandaka -p （mysql123）打开数据库
       还要从之前的服务器拷贝过来 mysqldump xxx.sql，要拷贝到的服务器create database之后用source复制
       
    5）安装nginx，apt-get install nginx，
        /usr/sbin/nginx：主程序
        /etc/nginx：存放配置文件（如果是迁移，记得把之前服务器这个目录下的的ssh file 1_zhoucanzhendevelop.com_bundle.crt/2_zhoucanzhendevelop.com.key也拷贝过来）
        nginx -c /etc/nginx/nginx.conf
        sudo systemctl restart nginx
        SSL证书也在 /etc/nginx/目录下
        
3. mysql建表
4. 主目录下运行npm install => pm2 start bin/www --watch --name diandiandaka，之后可用pm2 log diandiandaka查看运行日志。如果出问题了，pm2 delete diandiandaka
5. 运行定时任务，首先打开cron：sudo service cron start，其次到目录"/home/ubuntu/diandiandaka_server/script"下，运行crontab crontab_file，然后再检测是否成功运行：sudo service cron status，crontab -l查看定时任务是否被添加.

附录
1. 迁移mysql数据库
    1) In the "FROM" sever: shell> mysqldump -uroot -p databasename > dump.sql
    2) In the "TO" sever: shell> scp root@IPADDRESS:/home/dump.sql ./dump2.sql
    2) In the "TO" sever: shell > mysql -uroot -p diandiandaka < dump2.sql
2. 迁移redis数据库
    1) 备份
    - bash> redis-cli --raw -p 6226
    - redis> config get dir #查看aof文件保存路径
    - redis> config set appendonly yes #允许调用fsync将AOF日志同步到硬盘
    - redis> SLAVEOF localhost 6226 #需要备份的服务器的ip端口
    - bash > cat $dir/appendonly.aof #查看备份的aof日志
    - redis> SLAVEOF NO ONE #取消主从同步
    - redis> config set appendonly no #取消调用fsync
    2) 还原
    - bash> redis-cli --raw -p 6226
    - redis> config set appendonly yes #允许调用fsync将AOF日志同步到硬盘
    - redis> redis-cli --raw -p 6226 --pipe < appendonly.aof #将文件进行导入
    - redis> config set appendonly no #取消调用fsync
    - redis> keys * #查看备份的数据




小程序端

直接pull放到微信开发者工具即可运行





#### 待完成工作
1. 离开“今天”界面时，要往数据库里更新所有被修改过的数据 【完成】✔️ 2018.08.02 22:27
2. 目前所有的图片，都换成从七牛获取，加快速速 【完成】✔️ 2018.08.03 13:15
3. “新卡片”图标完成左右滑动，避免图标太多导致遮挡，体验不好 【完成】✔️ 2018.08.03 13:29
4. “新卡片”支持用户上传自定义图标，图标统一上传到七牛云 【完成】✔️2018.08.03 14:35
5. 利用moment.js，将utils里关于时间的函数都improve一下 【完成】✔️ 2018.08.03 16:03
6. 修改dbhelper为仅剩增删改查 【完成】✔️ 2018.08.04 14:47
7. “今天”离开页面时统一更新topic_check表 【完成】 ✔️ 2018.08.04 16:50
8. “历史”部分接入topic_check表 【完成】 ✔️ 2018.08.04 20:50
9. “历史”部分完成历史日志的数据简单显示 【完成】 ✔️ 2018.08.05 12:42
10. “历史”部分完成图表数据计算与展示 【完成】 ✔️ 2018.08.07 13:17
11. “历史”部分完成历史日志的界面优化 【完成】 ✔️ 2018.08.07 20:24
12. “今天”实现删除打卡功能 【完成】 ✔️ 2018.08.10 16:13
13. 显示每个卡片的完成度 【完成】 ✔️ 2018.08.12 18:53
14. “历史”图表新增单击显示当日完成计划（除了[一年]之外，因为[一年]显示的是平均值）
15. 完成“卡片设置”页面 【完成】 ✔️ 
16. 完成“卡片设置”后端数据库的增删改查 【完成】 ✔️ 
17. 完成设置里的【修改用户名】功能 【完成】 ✔️ 2018.08.12 22:15
18. 完成onload和onshow的功能重组和优化 【完成】 ✔️ 2018.08.13 09:38
19. 完成"我"->"设置"里的页面和功能 【完成】 ✔️
20. 这里是列表文本设置打卡的时候，如果已经设置，要自动打开 【完成】 ✔️ 2018.08.16 15:16
21. 完成打卡提醒推送通知  【完成】 ✔️ 2018.08.16 15:16
22. 安插多个搜集form_id的地方 【完成】 ✔️ 2018.08.16 15:16
23. 脚本，自动查看人数为0的topic和图片，删除之 【完成】 ✔️  2018.08.20 10:30
24. 接入promise，修改所有后端代码为异步执行  【完成】 ✔️ 2018.08.20 14:20
25. 完成我的榜单
26. 完成编辑个人资料





#### 待修复的bug
1. “打卡历史”每日完成度真机echarts页面穿透问题【完成】 ✔️ 2018.08.07 21:52
    
    原因：page设置了position:fix;所有的设置都反过来了，fix的跟着动，不fix的却不动。

2. “打卡历史”每日完成度真机无法触发拖拽事件【完成】 ✔️ 2018.08.07 22:05

    原因：echarts的微信小程序组件自带bindtouchstart和bindtouchmove，导致我自己设置的失效。只是不知道为什么在电脑端测试的时候不失效，真机反而失效了。

3. “打卡历史”每日完成度选择不同timelapse按钮会跟着上下移动的问题 【完成】 ✔️ 2018.08.12 15:18
4. 真机动画无效 1)打卡的动画 2)“我” -> “我的打卡”动画 【完成】 ✔️ 2018.08.10 18:55
5. 修复离开“今天”， 无法保存打卡数据的bug 【完成】 ✔️ 2018.08.11 15:09
6. 修复查看图表的时候，不同机型，timelapse button位置不同的bug 【完成】 ✔️ 2018.08.11 17:51
7. 修复无数据界面为空的bug（做一些可爱的错误提示）【完成】 ✔️ 2018.08.11 21:37
8. 修复图表时间显示，开始打卡日期到当天为止的时间内，如果没打卡要显示为0%，不能显示为null  【完成】 ✔️ 2018.08.13 10:06
9. 安卓手机添加新卡片的图片不显示 【完成】 ✔️ 2018.08.13 15:20
10. 安卓手机“历史” 无数据时提示不友好 【完成】 ✔️ 2018.08.13 15:29
11. 安卓手机“每日完成度” 标题不居中，错误标签重叠在一起【完成】 ✔️ 2018.08.13 16:33
12. 我的卡片，无卡片时需要提示 【完成】 ✔️ 2018.08.13 16:48
13. “我” 不换头像之前，无法单击换头像 【完成】 ✔️ 2018.08.13 16:57
14. 真机的地区选择框显示不全 【完成】 ✔️ 2018.08.16 16:11
15. 修改所有后端api为按照功能划分，而不是按照数据库






版本：

node -v
v10.7.0

npm -v
6.2.0

#### 使用说明

1. xxxx
2. xxxx
3. xxxx
