const qiniuhelper = require('../../vendor/qiniuhelper.js');
const api = require('../../ajax/api.js');
const utils = require('../../vendor/utils.js');
const COUNTRY_CODE_LIST = [
  '中国 86',
  '中国台湾 886',
  '中国澳门 853',
  '中国香港 852',
  '美国 1',
  '法国 33',
  '新加坡 65',
  '英国 44',
  '加拿大 1',
  '俄罗斯 7',
  '德国 49',
  '比利时 32',
  '捷克 420',
  '奥地利 43',
  '瑞士 41',
  '瑞典 46',
  '波兰 48',
  '荷兰 31',
  '挪威 47',
  '墨西哥 52',
  '马来西亚 60',
  '毛里求斯 230',
  '冰岛 354',
  '印度 91',
  '匈牙利 36',
  '希腊 30',
  '西班牙 34',
  '芬兰 358',
  '意大利 39',
  '安道尔 376',
  '阿拉伯联合酋长国 971',
  '阿富汗 93',
  '安提瓜和巴布达 1268',
  '安圭拉 1264',
  '阿尔巴尼亚 355',
  '亚美尼亚 374',
  '安哥拉 244',
  '阿根廷 54',
  '美属萨摩亚 1684',
  '澳大利亚 61',
  '阿鲁巴 297',
  '阿塞拜疆 994',
  '波斯尼亚和黑塞哥维那 387',
  '巴巴多斯 1246',
  '孟加拉国 880',
  '布基纳法索 226',
  '保加利亚 359',
  '巴林 973',
  '布隆迪 257',
  '贝宁 229',
  '百慕大群岛 1441',
  '文莱 673',
  '玻利维亚 591',
  '荷兰加勒比 599',
  '巴西 55',
  '巴哈马 1242',
  '不丹 975',
  '博茨瓦纳 267',
  '白俄罗斯 375',
  '伯利兹 501',
  '刚果民主共和国 243',
  '中非共和国 236',
  '刚果共和国 242',
  '象牙海岸 225',
  '库克群岛 682',
  '智利 56',
  '喀麦隆 237',
  '哥伦比亚 57',
  '哥斯达黎加 506',
  '古巴 53',
  '开普 238',
  '库拉索 599',
  '塞浦路斯 357',
  '吉布提 253',
  '丹麦 45',
  '多米尼加 1767',
  '多米尼加共和国 1809',
  '阿尔及利亚 213',
  '厄瓜多尔 593',
  '爱沙尼亚 372',
  '埃及 20',
  '厄立特里亚 291',
  '埃塞俄比亚 251',
  '斐济 679',
  '密克罗尼西亚 691',
  '法罗群岛 298',
  '加蓬 241',
  '格林纳达 1473',
  '格鲁吉亚 995',
  '法属圭亚那 594',
  '加纳 233',
  '直布罗陀 350',
  '格陵兰岛 299',
  '冈比亚 220',
  '几内亚 224',
  '瓜德罗普岛 590',
  '赤道几内亚 240',
  '瓜地马拉 502',
  '关岛 1671',
  '几内亚比绍共和国 245',
  '圭亚那 592',
  '洪都拉斯 504',
  '克罗地亚 385',
  '海地 509',
  '印度尼西亚 62',
  '爱尔兰 353',
  '以色列 972',
  '伊拉克 964',
  '伊朗 98',
  '牙买加 1876',
  '约旦 962',
  '日本 81',
  '肯尼亚 254',
  '吉尔吉斯斯坦 996',
  '柬埔寨 855',
  '基里巴斯 686',
  '科摩罗 269',
  '圣基茨和尼维斯 1869',
  '朝鲜 850',
  '韩国 82',
  '科威特 965',
  '开曼群岛 1345',
  '哈萨克斯坦 7',
  '老挝 856',
  '黎巴嫩 961',
  '圣露西亚 1758',
  '列支敦士登 423',
  '斯里兰卡 94',
  '利比里亚 231',
  '莱索托 266',
  '立陶宛 370',
  '卢森堡 352',
  '拉脱维亚 371',
  '利比亚 218',
  '摩洛哥 212',
  '摩纳哥 377',
  '摩尔多瓦 373',
  '黑山 382',
  '马达加斯加 261',
  '马绍尔群岛 692',
  '马其顿 389',
  '马里 223',
  '缅甸 95',
  '蒙古 976',
  '毛里塔尼亚 222',
  '蒙特塞拉特岛 1664',
  '马耳他 356',
  '马尔代夫 960',
  '马拉维 265',
  '莫桑比克 258',
  '纳米比亚 264',
  '新喀里多尼亚 687',
  '尼日尔 227',
  '尼日利亚 234',
  '尼加拉瓜 505',
  '尼泊尔 977',
  '拿鲁岛 674',
  '新西兰 64',
  '阿曼 968',
  '巴拿马 507',
  '秘鲁 51',
  '法属波利尼西亚 689',
  '巴布亚新几内亚 675',
  '菲律宾 63',
  '巴基斯坦 92',
  '圣彼埃尔和密克隆岛 508',
  '波多黎各 1787',
  '葡萄牙 351',
  '帕劳 680',
  '巴拉圭 595',
  '卡塔尔 974',
  '留尼汪 262',
  '罗马尼亚 40',
  '塞尔维亚 381',
  '卢旺达 250',
  '沙特阿拉伯 966',
  '所罗门群岛 677',
  '塞舌尔 248',
  '苏丹 249',
  '斯洛文尼亚 386',
  '斯洛伐克 421',
  '塞拉利昂 232',
  '圣马力诺 378',
  '塞内加尔 221',
  '索马里 252',
  '苏里南 597',
  '圣多美和普林西比 239',
  '萨尔瓦多 503',
  '叙利亚 963',
  '斯威士兰 268',
  '特克斯和凯科斯群岛 1649',
  '乍得 235',
  '多哥 228',
  '泰国 66',
  '塔吉克斯坦 992',
  '东帝汶 670',
  '土库曼斯坦 993',
  '突尼斯 216',
  '汤加 676',
  '土耳其 90',
  '特立尼达和多巴哥 1868',
  '坦桑尼亚 255',
  '乌克兰 380',
  '乌干达 256',
  '乌拉圭 598',
  '乌兹别克斯坦 998',
  '圣文森特和格林纳丁斯 1784',
  '委内瑞拉 58',
  '英属处女群岛 1284',
  '越南 84',
  '瓦努阿图 678',
  '萨摩亚 685',
  '也门 967',
  '马约特 269',
  '南非 27',
  '赞比亚 260',
  '津巴布韦 263',
];


Page({

  /**
   * 页面的初始数据
   */
  data: {
    areaPickerItem: {
      show: false
    },
    user_name: '',
    gender: -1, 
    province: '',
    city: '',
    county: '',
    is_check_area: false,
    is_reset_avatar: false, //默认用户没有修改头像
    is_reset_name: false, //默认用户没修改过名字
    genderItems: ['男', '女'],
    remind_time: '08:00',
    wechat_id: '', //微信号
    countryCode: '86', //国家号
    phone_number: '', //手机号，默认为中国大陆
    country_code_list: COUNTRY_CODE_LIST,
    birthday: '', //生日

    topic_list: [], //该用户的topic列表
    remind_topic_list: [], //该用户选择要提醒的topic列表
    is_remind_switch_on: false, //是否打开提醒的switch是否开着
    form_id_list: [], //用于存储用户单击所产生的form_id
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().selectAll('.topic-remind-oneline1').
        boundingClientRect((rects) => {
          that.setData({
            scrollHeight: res.windowHeight - 360
          });
        }).exec();
      }
    });

    if (wx.getStorageSync('avatarUrl')) {
      this.setData({
        avatar_url: wx.getStorageSync('avatarUrl'),
        is_reset_avatar: true,
      });
    }

    if (wx.getStorageSync('userName')) {
      this.setData({
        user_name: wx.getStorageSync('userName'),
        is_reset_name: true,
      });
    }

    if (!wx.getStorageSync('avatarUrl') ||
      !wx.getStorageSync('userName')) {
      /* 获取用户的个性化头像和姓名 */
      api.postRequest({
        'url': '/user/getNameAvatar',
        'data': [],
        'success': (res) => {
          if (res.error_code == 200 && res.result_list != []) {
            let reslist = res.result_list;
            if (reslist == undefined) return;
            if (reslist['user_name'] || reslist['avatar_url']) {
              this.setData({
                is_reset_name: !(reslist['user_name'] == false),
                is_reset_avatar: !(reslist['avatar_url'] == false),
                user_name: reslist['user_name'] ? reslist['user_name'] : '',
                avatar_url: reslist['avatar_url'] ? reslist['avatar_url'] : ''
              });
              wx.setStorageSync('avatarUrl', this.data.avatar_url);
              wx.setStorageSync('userName', this.data.user_name);
            }
          }
        }
      });
    }




    // 查看是否用户已经设置了地区、性别
    // 如果有，则直接显示出来
    api.postRequest({
      'url': '/me/getUserInfo',
      'data': [],
      'success': (res) => {
        if (res.error_code == 200 && res.result_list.length != 0) {
          let user_info = res.result_list[0];
          let phone = user_info['phone_number'];

          that.setData({
            province: user_info['province'] ? user_info['province'] : '北京市',
            city: user_info['city'] ? user_info['city'] : '市辖区',
            county: user_info['county'] ? user_info['county'] : '海淀区',
            gender: user_info['gender'] == '-1' ? '未设置' : user_info['gender'],
            wechat_id: user_info['wechat_id'] ? 
                      user_info['wechat_id'] : '未填写',
            countryCode: phone ? phone.split('-')[0] : '86',
            phone_number: phone ? phone.split('-')[1]: '',
            birthday: user_info['birthday'] ?
                      user_info['birthday'] : '未填写',
          });

          that.setData({
            region: [that.data.province, 
                     that.data.city,
                     that.data.county], 
          })
        }
      }
    });
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    var that = this;
  },


  //点击选择城市按钮显示picker-view
  translate: function (e) {
    // areaPicker.animationEvents(this, 0, true, 400);
  },


  // //隐藏picker-view
  // hiddenFloatView: function (e) {
  //   let id = e.currentTarget.dataset.id;
  //   if (id == 666){//确定 
  //     this.setData({
  //       province: areaPickerItem.provinces[areaPickerItem.value[0]].name,
  //       city: areaPickerItem.citys[areaPickerItem.value[1]].name,
  //       county: areaPickerItem.countys[areaPickerItem.value[2]].name
  //     });
  //   }
  //   areaPicker.animationEvents(this, 200, false, 400);
  // },

  
  //滑动事件
  // areaPickerChange: function (e) {
  //   areaPicker.updateAreaData(this, 1, e);
  //   areaPickerItem = this.data.areaPickerItem;
  // },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },


  /**
   * 选择性别的按钮变化时触发的函数
   */
  bindGenderChange: function(e){
    this.setData({
      gender: this.data.genderItems[parseInt(e.detail.value)]
    });
    console.log(this.data.gender)
    this._changeGender();
  },


  /**
   * 跳转到提醒设置界面
   */
  gotoReminder: function (e) {
    let url = '/pages/settings/reminder?phone_number=' +
                  this.data.phone_number + '&country_code=' +
                  this.data.countryCode;
      
    if (this.data.phone_number == '') {
      wx.showModal({
        title: '注意',
        content: '您尚未设置手机号，将只能设置微信提醒，无法设置短信提醒',
        showCancel: false,
        success: (res) => {
          wx.navigateTo({
            url: url
          })
        }
      })
    } else {
      wx.navigateTo({
        url: url
      })
    }
  },


  /**
   * 开启是否提醒的卡片checkbox变化时触发的函数
   */
  topicRemindChange: function (e) {

    let topic_list = this.data.topic_list;
    let index = e.currentTarget.dataset.index;

    if (e.detail.value.length != 0){ //选中
      topic_list[index].checked = true;
    } else {
      topic_list[index].checked = false;
    }

    this.setData({
      topic_list: topic_list
    });
  },


  /**
   * 用户选择提醒时间所触发的函数
   */
  bindTimeChange: function(e){
    let time = e.detail.value;
    this.setData({
      remind_time: time
    });
  },



  /**
   * 修改地区时所触发的函数
   */
  bindRegionChange: function (e) {
    let region = e.detail.value;
    this.setData({
      region: region
    })

    api.postRequest({
      'url': '/user/updateRegion',
      'data': {
        province: region[0],
        city: region[1],
        county: region[2]
      },
      'success': (res) => {
        if (res.error_code != 200) {
          console.log('修改地区失败');
          return;
        }
        console.log('修改地区成功');
        wx.showToast({
          title: '修改地区成功'
        })
      },
      'fail': (res) => {
        console.log('修改地区失败');
      }
    });
  },




  /**
   * 修改用户名
   */
  changeUserName: function(e){
    this.saveFormId(e.detail.formId);
    this.setData({
      show_modal: true,
      modal_title: '用户名',
      modal_input_value: this.data.user_name == '未填写' ?  '' : 
                            this.data.user_name,
      new_modal_input_value: this.data.user_name
    });
  },



  /**
   * 单击modal触发的函数
   */
  clickModal: function(e){
    this.saveFormId(e.detail.formId);
  },


  showFailToast: function(){
    wx.showToast({
      title: '啊呀，好像出现了点问题，我错了😞',
      icon: 'none'
    })
  },

  showSucceedToast: function (is_set_reminder){
    if (is_set_reminder){
      wx.showModal({
        title: '温馨提示',
        content: '开启提醒之后，将于次日生效喔~',
        showCancel: false,
        success: (res) => {
          wx.navigateBack({})
        }
      })
    } else {
      wx.showToast({
        title: '设置保存成功',
      })
      setTimeout(function(){
        wx.navigateBack({})
      }, 2000);
    }
  },



  /**
   * 用于保存formId的helper方法
   */
  saveFormId: function (formId) {
    console.log(formId);
    let form_id_list = this.data.form_id_list;
    form_id_list.push(formId);
    this.setData({
      form_id_list: form_id_list
    });
  },



  /** 
   * 页面隐藏函数
   * 监听页面的隐藏，
   * 当从当前A页跳转到其他页面，那么A页面处于隐藏状态
   * */
  onHide: function (event) {
    if (this.data.form_id_list.length == 0) return;
    utils.saveFormId(this.data.form_id_list);
    this.setData({
      form_id_list: []
    });
  },




  /**
   * 不再显示，隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      show_modal: false,
      show_phone_modal: false,
      modal_title: '',
      modal_input_value: '',
    });
  },


  /**
   * 用户在input框输入
   * 新用户名时触发的函数
   */
  newInputChange: function (e) {
    this.setData({
      new_modal_input_value: e.detail.value
    });
  },


  /**
   * 用户输入电话号码时触发的函数
   */
  phoneInputChange: function(e){
    this.setData({
      new_modal_input_value: e.detail.value
    });
  },

  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    let that = this;
    let new_input = that.data.new_modal_input_value;
    // 用户并没有修改名字
    let showInputNotChangedToast = function (){
      wx.showModal({
        title: '未修改',
        content: '你的' + that.data.modal_title + '好像没有任何修改喔~',
        confirmText: '继续修改',
        cancelText: '退出修改',
        success: (res) => {
          if (res.cancel) {
            that.hideModal();
            return;
          }
        }
      })
      // wx.showToast({
      //   title: that.data.modal_title+ '未修改',
      //   icon: 'none'
      // })
    }

    let changeColumn = function () {
      if (that.data.modal_title == '用户名'){
        if (new_input == that.data.user_name){
          showInputNotChangedToast();
          return;
        }
        that._changeUserName(new_input);
      } else if (that.data.modal_title == '微信号') {
        if (new_input == that.data.wechat_id) {
          showInputNotChangedToast();
          return;
        }
        that._changeWechatId(new_input);
      } else if (that.data.modal_title == '手机号') {
        console.log(new_input)
        if (!utils.isPhoneNumberLegal(new_input)) {
          wx.showModal({
            title: '手机不合法',
            content: '您填写的手机号好像不太对劲诶，修改一下再去设置短信提醒好不好~',
            confirmText: '好哒',
            cancelText: '宝宝拒绝',
            success: (res) => {
              if (res.cancel){
                that.hideModal();
                return;
              }
            }
          })
          return;
        }

        that._changePhone(new_input);
      }
      that.hideModal();
    }


    if (new_input == undefined || new_input == ''){
      wx.showModal({
        title: '内容为空',
        content: '您填写的' + this.data.modal_title + '为空' +
                  '，您确定要修改咩？',
        success: (res) => {
          if (res.cancel) return;
          changeColumn();
        }
      })
    }

    changeColumn();
  },




  _changeUserName: function (new_username) {
    let that = this;
    api.postRequest({
      'url': '/user/updateColumn',
      'data': {
        column_name: 'user_name',
        column_value: new_username
      },
      'success': (res) => {
        if (res.error_code != 200) {
          console.log('修改用户名失败');
          return;
        }
        console.log('修改用户名成功');
        showNewUserName();
        wx.setStorageSync('userName', new_username);
        wx.showToast({
          title: '修改用户名成功'
        })
      },
      'fail': (res) => {
        console.log('修改用户名失败');
      }
    });

    let showNewUserName = function () {
      that.setData({
        is_reset_name: true,
        user_name: new_username
      });
    };
  },


  /**
   * 修改地区时触发的函数
   */
  changeRegion: function (e) {
    this.saveFormId(e.detail.formId);
  },



  _changeWechatId: function (new_wechatid) {
    let that = this;
    api.postRequest({
      'url': '/user/updateColumn',
      'data': {
        column_name: 'wechat_id',
        column_value: new_wechatid
      },
      'success': (res) => {
        if (res.error_code != 200) {
          console.log('修改微信号失败');
          return;
        }
        console.log('修改微信号成功');

        that.setData({
          wechat_id: new_wechatid
        });
        wx.showToast({
          title: '修改微信号成功'
        })
      },
      'fail': (res) => {
        console.log('修改微信号失败');
      }
    });
  },



  _changePhone: function (new_phone_number) {
    console.log(new_phone_number)
    
    let that = this;
    api.postRequest({
      'url': '/user/updateColumn',
      'data': {
        column_name: 'phone_number',
        column_value: this.data.countryCode + '-' + new_phone_number
      },
      'success': (res) => {
        if (res.error_code != 200) {
          console.log('修改手机号失败');
          return;
        }
        console.log('修改手机号成功');

        that.setData({
          phone_number: new_phone_number
        });
        wx.showToast({
          title: '修改手机号成功'
        })
      },
      'fail': (res) => {
        console.log('修改手机号失败');
      }
    });
  },



  _changeBirthday: function () {
    let that = this;
    let new_birthday = this.data.birthday;
    api.postRequest({
      'url': '/user/updateColumn',
      'data': {
        column_name: 'birthday',
        column_value: new_birthday
      },
      'success': (res) => {
        if (res.error_code != 200) {
          console.log('修改生日失败');
          return;
        }
        console.log('修改生日成功');
        wx.showToast({
          title: '修改生日成功'
        })
      },
      'fail': (res) => {
        console.log('修改生日失败');
      }
    });
  },





  _changeGender: function () {
    let that = this;
    let new_gender = this.data.gender;
    api.postRequest({
      'url': '/user/updateColumn',
      'data': {
        column_name: 'gender',
        column_value: new_gender
      },
      'success': (res) => {
        if (res.error_code != 200) {
          console.log('修改性别失败');
          return;
        }
        console.log('修改性别成功');
        wx.showToast({
          title: '修改性别成功'
        })
      },
      'fail': (res) => {
        console.log('修改性别失败');
      }
    });
  },




  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },





  /**
   * 用户单击头像，修改头像
   */
  changeAvatar: function (e) {
    this.saveFormId(e.detail.formId);

    let that = this;
    let showFailToast = function () {
      wx.showToast({
        title: '大哥饶命，上传失败...',
        icon: 'none',
        duration: 2000
      })
    };

    //用七牛删除之前的头像（不继续保存）
    let deletePreAvatar = function () {
      if (that.data.avatar_url) {
        let avatar_string = that.data.avatar_url;
        avatar_string.replace(qiniuhelper.config.scaleAPI, '');
        avatar_string.replace(qiniuhelper.config.prefix, '');
        api.postRequest({
          'url': '/qiniu/delete',
          'data': {
            'key': avatar_string
          },
          'showLoading': false,
          'success': (res) => {
            if (res.error_code == 200) console.log('删除之前的头像成功');
            else console.log('删除之前头像失败');
          },
          'fail': (res) => {
            console.log('删除之前头像失败');
          }
        });
      }
    };

    let updateAvatarUrl = function (url) {
      api.postRequest({
        'url': '/user/updateColumn',
        'data': {
          column_name: 'avatar_url',
          column_value: url
        },
        'success': (res) => {
          wx.hideLoading()
          if (res.error_code != 200){
            console.log('更新数据库里的avatar_url字段失败');
            return;
          }
          console.log('更新数据库里的avatar_url字段成功');
          wx.showToast({
            title: '修改头像成功',
          })
        },
        'fail': (res) => {
          console.log('更新数据库里的avatar_url字段失败');
        }
      });
    }

    // 弹出选择图片的框
    wx.chooseImage({
      count: 1, // 允许选择的图片数
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showLoading({
          title: '更换头像中...',
        })
        let filepath = res.tempFilePaths[0];
        let filename = 'avatar/' + filepath.substring(filepath.indexOf('tmp/') + 4, filepath.lastIndexOf('.'));
        // 向服务器端获取token
        api.getRequest('/qiniu/getToken', {}, (res) => {
          if (res.error_code == 200) {
            deletePreAvatar(); //删除之前保存的头像，如果存在的话
            // 成功获取token之后，开始上传图片
            let token = res.token;
            console.log('成功获取token:' + token);
            qiniuhelper.upload(filepath, filename, token, (status, url) => {
              if (!status) { showFailToast(); return; }
              // 头像需要剪裁成正方形，所以需要加上特定api
              url += qiniuhelper.config.scaleAPI;
              // 设置当前显示的头像为上传到七牛的图片url
              that.setData({
                avatar_url: url,
                is_reset_avatar: true
              });
              // 更新数据库里的avatar_url字段
              updateAvatarUrl(url);
              // 更新storage里的url
              wx.setStorageSync('avatarUrl', url);
              console.log('成功上传新头像！地址是：' + that.data.avatar_url);
            });
          } else { showFailToast(); return; }
        });
      }
    });
  },



  /**
   * 修改微信号
   */
  changeWechatId: function (e) {
    this.saveFormId(e.detail.formId);
    this.setData({
      show_modal: true,
      modal_title: '微信号',
      modal_input_value: this.data.wechat_id == '未填写' ? '' : 
                          this.data.wechat_id,
      new_modal_input_value: this.data.wechat_id
    });
  },


  /**
   * 修改手机号
   */
  changePhone: function (e) {
    this.saveFormId(e.detail.formId);

    this.setData({
      show_phone_modal: true,
      modal_title: '手机号',
      new_modal_input_value: this.data.phone_number
    });
  },


  /**
   * 手机选择不同国家码所触发的函数
   */
  bindCountryPhoneCodeChange: function (e) {
    this.setData({
      countryCode: this.data.country_code_list[e.detail.value].split(' ')[1]
    })
  },


  /**
   * 保存修改后的生日
   */
  saveBirthday: function (e) {
    this.saveFormId(e.detail.formId);
  },


  /**
   * 保存生日到后台
   */
  bindBirthdayChange: function(e){
    this.setData({
      birthday: e.detail.value
    })
    this._changeBirthday();
  },

})
