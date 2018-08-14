fis.set('project.files', ['helpers/**', 'routes/**', 'app.js', 'config.js','timed-task.js']);

fis.match('**', {
  deploy: fis.plugin('http-push', {
    receiver: 'http://139.199.69.115:8999/receiver',
    to: '/home/ubuntu/diandiandaka/' // 注意这个是指的是测试机器的路径，而非本地机器
  })
})
