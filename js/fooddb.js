// ===== 食物数据库（每100克）=====
const FOOD_DB = [
  // 主食
  { name:'白米饭',      cat:'主食', per100:{kcal:116,protein:2.6,carb:25.6,fat:0.3} },
  { name:'糙米饭',      cat:'主食', per100:{kcal:111,protein:2.6,carb:23.5,fat:0.9} },
  { name:'燕麦片',      cat:'主食', per100:{kcal:389,protein:17, carb:66,  fat:7}   },
  { name:'面条(熟)',    cat:'主食', per100:{kcal:137,protein:4.5,carb:28,  fat:0.6} },
  { name:'全麦面包',    cat:'主食', per100:{kcal:247,protein:9,  carb:45,  fat:3.4} },
  { name:'白面包',      cat:'主食', per100:{kcal:265,protein:9,  carb:49,  fat:3.2} },
  { name:'馒头',        cat:'主食', per100:{kcal:223,protein:7,  carb:47,  fat:1}   },
  { name:'包子(肉馅)',  cat:'主食', per100:{kcal:226,protein:9,  carb:33,  fat:7}   },
  { name:'饺子(猪肉)',  cat:'主食', per100:{kcal:240,protein:12, carb:30,  fat:8}   },
  { name:'玉米',        cat:'主食', per100:{kcal:86, protein:3.3,carb:19,  fat:1.2} },
  { name:'红薯',        cat:'主食', per100:{kcal:86, protein:1.6,carb:20,  fat:0.1} },
  { name:'土豆',        cat:'主食', per100:{kcal:77, protein:2,  carb:17,  fat:0.1} },
  { name:'藜麦(熟)',    cat:'主食', per100:{kcal:120,protein:4.4,carb:22,  fat:1.9} },
  // 蛋白质
  { name:'鸡胸肉',      cat:'蛋白质', per100:{kcal:133,protein:31,carb:0,  fat:2.5} },
  { name:'鸡腿肉(去皮)',cat:'蛋白质', per100:{kcal:153,protein:26,carb:0,  fat:5}   },
  { name:'鸡翅',        cat:'蛋白质', per100:{kcal:215,protein:18,carb:0,  fat:15}  },
  { name:'猪里脊',      cat:'蛋白质', per100:{kcal:143,protein:20,carb:1,  fat:6.5} },
  { name:'猪五花肉',    cat:'蛋白质', per100:{kcal:395,protein:14,carb:1,  fat:37}  },
  { name:'牛里脊(瘦)',  cat:'蛋白质', per100:{kcal:121,protein:22,carb:0,  fat:3.2} },
  { name:'牛肉(肥瘦)',  cat:'蛋白质', per100:{kcal:193,protein:19,carb:0,  fat:13}  },
  { name:'羊肉(瘦)',    cat:'蛋白质', per100:{kcal:118,protein:21,carb:0,  fat:3.9} },
  { name:'三文鱼',      cat:'蛋白质', per100:{kcal:208,protein:20,carb:0,  fat:13}  },
  { name:'金枪鱼(罐头)',cat:'蛋白质', per100:{kcal:132,protein:29,carb:0,  fat:1.2} },
  { name:'草鱼',        cat:'蛋白质', per100:{kcal:113,protein:17,carb:0,  fat:5}   },
  { name:'虾仁',        cat:'蛋白质', per100:{kcal:93, protein:18,carb:2,  fat:1.4} },
  { name:'鸡蛋(全)',    cat:'蛋白质', per100:{kcal:155,protein:13,carb:1.1,fat:11}  },
  { name:'蛋白(蛋清)',  cat:'蛋白质', per100:{kcal:52, protein:11,carb:0.7,fat:0.2} },
  { name:'北豆腐',      cat:'蛋白质', per100:{kcal:98, protein:9, carb:4,  fat:6}   },
  { name:'嫩豆腐',      cat:'蛋白质', per100:{kcal:63, protein:6, carb:2,  fat:3.5} },
  // 乳制品
  { name:'全脂牛奶',        cat:'乳制品', per100:{kcal:61, protein:3.2,carb:4.8,fat:3.3} },
  { name:'脱脂牛奶',        cat:'乳制品', per100:{kcal:35, protein:3.6,carb:5,  fat:0.1} },
  { name:'希腊酸奶(无糖)',  cat:'乳制品', per100:{kcal:97, protein:10, carb:6,  fat:4}   },
  { name:'普通酸奶',        cat:'乳制品', per100:{kcal:72, protein:3.5,carb:10, fat:2}   },
  { name:'奶酪(切达)',      cat:'乳制品', per100:{kcal:402,protein:25, carb:1,  fat:33}  },
  { name:'乳清蛋白粉',      cat:'乳制品', per100:{kcal:375,protein:80, carb:8,  fat:4}   },
  // 蔬菜
  { name:'西兰花', cat:'蔬菜', per100:{kcal:34, protein:2.8,carb:7,  fat:0.4} },
  { name:'菠菜',   cat:'蔬菜', per100:{kcal:23, protein:2.9,carb:3.6,fat:0.4} },
  { name:'黄瓜',   cat:'蔬菜', per100:{kcal:15, protein:0.7,carb:3.6,fat:0.1} },
  { name:'番茄',   cat:'蔬菜', per100:{kcal:18, protein:0.9,carb:3.9,fat:0.2} },
  { name:'白菜',   cat:'蔬菜', per100:{kcal:13, protein:1,  carb:2.4,fat:0.2} },
  { name:'青椒',   cat:'蔬菜', per100:{kcal:20, protein:1,  carb:4.6,fat:0.2} },
  { name:'胡萝卜', cat:'蔬菜', per100:{kcal:41, protein:0.9,carb:10, fat:0.2} },
  { name:'芹菜',   cat:'蔬菜', per100:{kcal:16, protein:0.7,carb:3.6,fat:0.1} },
  { name:'生菜',   cat:'蔬菜', per100:{kcal:15, protein:1.3,carb:2.4,fat:0.2} },
  { name:'冬瓜',   cat:'蔬菜', per100:{kcal:11, protein:0.4,carb:2.6,fat:0.2} },
  { name:'花椰菜', cat:'蔬菜', per100:{kcal:25, protein:2,  carb:5,  fat:0.3} },
  { name:'蘑菇',   cat:'蔬菜', per100:{kcal:22, protein:3.1,carb:3.3,fat:0.3} },
  { name:'豆芽',   cat:'蔬菜', per100:{kcal:30, protein:3,  carb:5.9,fat:0.1} },
  { name:'西葫芦', cat:'蔬菜', per100:{kcal:17, protein:1.2,carb:3.1,fat:0.3} },
  { name:'茄子',   cat:'蔬菜', per100:{kcal:25, protein:1,  carb:6,  fat:0.2} },
  // 水果
  { name:'苹果',   cat:'水果', per100:{kcal:52, protein:0.3,carb:14, fat:0.2} },
  { name:'香蕉',   cat:'水果', per100:{kcal:89, protein:1.1,carb:23, fat:0.3} },
  { name:'橙子',   cat:'水果', per100:{kcal:47, protein:0.9,carb:12, fat:0.1} },
  { name:'草莓',   cat:'水果', per100:{kcal:32, protein:0.7,carb:7.7,fat:0.3} },
  { name:'葡萄',   cat:'水果', per100:{kcal:69, protein:0.7,carb:18, fat:0.2} },
  { name:'西瓜',   cat:'水果', per100:{kcal:30, protein:0.6,carb:7.6,fat:0.2} },
  { name:'牛油果', cat:'水果', per100:{kcal:160,protein:2,  carb:9,  fat:15}  },
  { name:'蓝莓',   cat:'水果', per100:{kcal:57, protein:0.7,carb:14, fat:0.3} },
  { name:'猕猴桃', cat:'水果', per100:{kcal:61, protein:1.1,carb:15, fat:0.5} },
  { name:'芒果',   cat:'水果', per100:{kcal:60, protein:0.8,carb:15, fat:0.4} },
  { name:'梨',     cat:'水果', per100:{kcal:57, protein:0.4,carb:15, fat:0.1} },
  { name:'桃子',   cat:'水果', per100:{kcal:39, protein:0.9,carb:10, fat:0.3} },
  // 坚果油脂
  { name:'花生',   cat:'坚果', per100:{kcal:567,protein:26,carb:16,fat:49}  },
  { name:'核桃',   cat:'坚果', per100:{kcal:654,protein:15,carb:14,fat:65}  },
  { name:'杏仁',   cat:'坚果', per100:{kcal:579,protein:21,carb:22,fat:50}  },
  { name:'腰果',   cat:'坚果', per100:{kcal:553,protein:18,carb:30,fat:44}  },
  { name:'芝麻',   cat:'坚果', per100:{kcal:573,protein:17,carb:23,fat:50}  },
  { name:'橄榄油', cat:'油脂', per100:{kcal:884,protein:0, carb:0, fat:100} },
  { name:'黄油',   cat:'油脂', per100:{kcal:717,protein:0.9,carb:0.1,fat:81} },
  // 其他
  { name:'白砂糖',   cat:'其他', per100:{kcal:387,protein:0,  carb:100,fat:0}  },
  { name:'蜂蜜',     cat:'其他', per100:{kcal:304,protein:0.3,carb:82, fat:0}  },
  { name:'可乐',     cat:'其他', per100:{kcal:42, protein:0,  carb:10.6,fat:0} },
  { name:'薯片',     cat:'其他', per100:{kcal:536,protein:7,  carb:53, fat:34} },
  { name:'黑巧克力', cat:'其他', per100:{kcal:546,protein:5,  carb:60, fat:31} },
];

// ===== 运动 MET 数据库 =====
const EXERCISE_DB = [
  { name:'散步 (4km/h)',     met:3.0,  icon:'🚶'  },
  { name:'快走 (6km/h)',     met:4.3,  icon:'🚶‍♂️' },
  { name:'慢跑 (8km/h)',     met:8.0,  icon:'🏃'  },
  { name:'跑步 (10km/h)',    met:10.0, icon:'🏃‍♂️' },
  { name:'快跑 (12km/h)',    met:11.8, icon:'💨'  },
  { name:'骑单车 (轻松)',    met:5.5,  icon:'🚴'  },
  { name:'骑单车 (中等)',    met:8.0,  icon:'🚴‍♂️' },
  { name:'骑单车 (激烈)',    met:11.0, icon:'🚵'  },
  { name:'游泳 (中等)',      met:8.0,  icon:'🏊'  },
  { name:'游泳 (激烈)',      met:11.0, icon:'🏊‍♂️' },
  { name:'跳绳',             met:12.3, icon:'⛹️'  },
  { name:'HIIT 高强度间歇',  met:10.0, icon:'🔥'  },
  { name:'力量训练',         met:4.5,  icon:'🏋️'  },
  { name:'深蹲/硬拉',        met:5.0,  icon:'💪'  },
  { name:'瑜伽',             met:2.5,  icon:'🧘'  },
  { name:'有氧操/舞蹈',      met:7.5,  icon:'💃'  },
  { name:'椭圆机',           met:5.0,  icon:'🏃'  },
  { name:'划船机',           met:7.0,  icon:'🚣'  },
  { name:'爬楼梯',           met:8.0,  icon:'🏃'  },
  { name:'打篮球',           met:8.0,  icon:'🏀'  },
  { name:'打羽毛球',         met:5.5,  icon:'🏸'  },
  { name:'踢足球',           met:10.0, icon:'⚽'  },
  { name:'打网球',           met:7.3,  icon:'🎾'  },
  { name:'普拉提',           met:3.0,  icon:'🤸'  },
  { name:'拳击/搏击操',      met:9.0,  icon:'🥊'  },
];

// ===== 饮食计划模板 =====
const MEAL_TEMPLATES = [
  {
    name: '🥗 减脂轻食日',
    desc: '高蛋白控卡，适合日常减脂期直接套用',
    meals: {
      '早餐':    [{name:'希腊酸奶燕麦杯',kcal:220,protein:18,carb:28,fat:6},{name:'水煮蛋×2',kcal:140,protein:12,carb:1,fat:10},{name:'蓝莓100g',kcal:57,protein:1,carb:14,fat:0}],
      '午餐':    [{name:'香煎鸡胸肉180g',kcal:240,protein:40,carb:0,fat:5},{name:'糙米饭120g',kcal:130,protein:3,carb:28,fat:1},{name:'西兰花胡萝卜',kcal:90,protein:4,carb:12,fat:3}],
      '下午加餐':[{name:'乳清蛋白1份',kcal:120,protein:24,carb:3,fat:2}],
      '晚餐':    [{name:'清蒸鳕鱼180g',kcal:190,protein:38,carb:0,fat:3},{name:'烤南瓜150g',kcal:90,protein:2,carb:20,fat:0},{name:'生菜番茄沙拉',kcal:60,protein:2,carb:8,fat:2}],
    }
  },
  {
    name: '💪 增肌高蛋白日',
    desc: '提高蛋白和主食摄入，适合力量训练日',
    meals: {
      '早餐':    [{name:'全蛋炒蛋×3',kcal:210,protein:18,carb:2,fat:15},{name:'全麦吐司×2',kcal:160,protein:6,carb:30,fat:2},{name:'牛奶250ml',kcal:150,protein:8,carb:12,fat:8}],
      '上午加餐':[{name:'乳清蛋白粉',kcal:120,protein:25,carb:3,fat:1},{name:'香蕉1根',kcal:90,protein:1,carb:22,fat:0}],
      '午餐':    [{name:'牛肉200g',kcal:280,protein:40,carb:0,fat:13},{name:'米饭150g',kcal:174,protein:4,carb:38,fat:1},{name:'炒西兰花',kcal:80,protein:4,carb:10,fat:3}],
      '下午加餐':[{name:'希腊酸奶150g',kcal:145,protein:15,carb:9,fat:6},{name:'坚果一小把',kcal:120,protein:4,carb:4,fat:10}],
      '晚餐':    [{name:'三文鱼180g',kcal:250,protein:32,carb:0,fat:14},{name:'藜麦100g',kcal:120,protein:4,carb:22,fat:2},{name:'混合蔬菜',kcal:100,protein:4,carb:14,fat:2}],
    }
  },
  {
    name: '🌿 低碳生酮日',
    desc: '减少主食摄入，适合阶段性低碳安排',
    meals: {
      '早餐':    [{name:'荷包蛋×2',kcal:140,protein:12,carb:1,fat:10},{name:'牛油果半个',kcal:120,protein:2,carb:7,fat:11},{name:'希腊酸奶150g',kcal:145,protein:15,carb:9,fat:6}],
      '午餐':    [{name:'煎鸡腿排200g',kcal:320,protein:32,carb:0,fat:20},{name:'牛油果蔬菜沙拉',kcal:120,protein:3,carb:8,fat:10},{name:'橄榄油蘑菇',kcal:110,protein:3,carb:6,fat:9}],
      '下午加餐':[{name:'奶酪30g',kcal:120,protein:7,carb:1,fat:10},{name:'杏仁20g',kcal:120,protein:4,carb:4,fat:10}],
      '晚餐':    [{name:'猪里脊180g',kcal:250,protein:32,carb:0,fat:13},{name:'蒜香西兰花',kcal:80,protein:4,carb:10,fat:3},{name:'嫩豆腐150g',kcal:100,protein:11,carb:3,fat:5}],
    }
  },
  {
    name: '🌾 均衡饮食日',
    desc: '三餐稳定不激进，适合长期坚持',
    meals: {
      '早餐':    [{name:'杂粮粥',kcal:180,protein:5,carb:38,fat:1},{name:'煮鸡蛋×2',kcal:140,protein:12,carb:2,fat:10},{name:'豆浆250ml',kcal:90,protein:7,carb:9,fat:3}],
      '上午加餐':[{name:'苹果1个',kcal:80,protein:0,carb:20,fat:0}],
      '午餐':    [{name:'去皮鸡腿肉150g',kcal:230,protein:32,carb:0,fat:9},{name:'米饭150g',kcal:174,protein:4,carb:38,fat:1},{name:'番茄炒蛋',kcal:160,protein:9,carb:10,fat:10},{name:'冬瓜汤',kcal:30,protein:1,carb:6,fat:0}],
      '下午加餐':[{name:'低脂酸奶',kcal:100,protein:8,carb:12,fat:2}],
      '晚餐':    [{name:'虾仁150g',kcal:130,protein:26,carb:1,fat:2},{name:'杂粮馒头×1',kcal:120,protein:4,carb:25,fat:1},{name:'清炒时蔬',kcal:80,protein:3,carb:10,fat:3},{name:'紫菜蛋花汤',kcal:50,protein:4,carb:4,fat:2}],
    }
  },
  {
    name: '🍱 上班便当日',
    desc: '备餐友好，带饭和提前准备都很顺手',
    meals: {
      '早餐':    [{name:'隔夜燕麦杯',kcal:280,protein:15,carb:38,fat:8},{name:'水煮蛋×2',kcal:140,protein:12,carb:1,fat:10}],
      '午餐':    [{name:'便当鸡胸肉160g',kcal:220,protein:36,carb:0,fat:5},{name:'紫米饭120g',kcal:150,protein:4,carb:32,fat:1},{name:'彩椒西兰花',kcal:90,protein:4,carb:12,fat:3}],
      '下午加餐':[{name:'无糖酸奶200g',kcal:120,protein:12,carb:10,fat:2},{name:'香蕉1根',kcal:90,protein:1,carb:23,fat:0}],
      '晚餐':    [{name:'牛肉土豆便当',kcal:360,protein:28,carb:28,fat:14},{name:'凉拌黄瓜',kcal:30,protein:1,carb:6,fat:0},{name:'玉米100g',kcal:86,protein:3,carb:19,fat:1}],
    }
  },
  {
    name: '🥬 素食高纤日',
    desc: '豆制品和全谷物为主，清爽但有饱腹感',
    meals: {
      '早餐':    [{name:'无糖豆浆300ml',kcal:110,protein:10,carb:8,fat:4},{name:'全麦面包3片',kcal:220,protein:9,carb:40,fat:3},{name:'花生酱20g',kcal:118,protein:5,carb:4,fat:10}],
      '午餐':    [{name:'香煎豆腐200g',kcal:210,protein:18,carb:8,fat:12},{name:'藜麦150g',kcal:180,protein:6,carb:33,fat:3},{name:'西兰花蘑菇',kcal:90,protein:6,carb:14,fat:2}],
      '下午加餐':[{name:'希腊酸奶200g',kcal:194,protein:20,carb:12,fat:8},{name:'蓝莓100g',kcal:57,protein:1,carb:14,fat:0}],
      '晚餐':    [{name:'毛豆150g',kcal:180,protein:17,carb:14,fat:8},{name:'全麦意面150g',kcal:230,protein:9,carb:43,fat:2},{name:'番茄蔬菜酱',kcal:90,protein:3,carb:14,fat:3}],
    }
  },
  {
    name: '🏃 训练恢复日',
    desc: '补碳补蛋白，适合跑步或力量训练后',
    meals: {
      '早餐':    [{name:'燕麦牛奶杯',kcal:300,protein:16,carb:50,fat:6},{name:'鸡蛋×2',kcal:140,protein:12,carb:2,fat:10},{name:'香蕉1根',kcal:90,protein:1,carb:23,fat:0}],
      '上午加餐':[{name:'乳清蛋白1份',kcal:120,protein:24,carb:3,fat:2}],
      '午餐':    [{name:'鸡胸肉180g',kcal:240,protein:42,carb:0,fat:5},{name:'米饭200g',kcal:232,protein:5,carb:51,fat:1},{name:'西兰花',kcal:60,protein:3,carb:10,fat:1}],
      '下午加餐':[{name:'希腊酸奶200g',kcal:194,protein:20,carb:12,fat:8},{name:'蓝莓100g',kcal:57,protein:1,carb:14,fat:0}],
      '晚餐':    [{name:'三文鱼180g',kcal:250,protein:32,carb:0,fat:14},{name:'红薯250g',kcal:215,protein:4,carb:50,fat:0},{name:'菠菜蘑菇',kcal:70,protein:4,carb:9,fat:2}],
    }
  },
  {
    name: '🍜 外卖控卡日',
    desc: '用常见外卖组合控热量，忙的时候也能照抄',
    meals: {
      '早餐':    [{name:'茶叶蛋×2',kcal:150,protein:12,carb:2,fat:10},{name:'无糖豆浆300ml',kcal:110,protein:10,carb:8,fat:4},{name:'全麦三明治1份',kcal:280,protein:16,carb:28,fat:10}],
      '午餐':    [{name:'黄焖鸡米饭(控量版)',kcal:520,protein:32,carb:52,fat:18},{name:'凉拌海带丝',kcal:40,protein:2,carb:6,fat:1}],
      '下午加餐':[{name:'低糖酸奶1杯',kcal:120,protein:10,carb:12,fat:3}],
      '晚餐':    [{name:'Poke饭(半饭版)',kcal:480,protein:30,carb:45,fat:18},{name:'味噌汤',kcal:40,protein:3,carb:4,fat:1}],
    }
  }
];
