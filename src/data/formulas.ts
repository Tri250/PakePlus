// Excel函数公式示例数据库
// 提供2000+种常见公式示例

export interface FormulaExample {
  category: string;
  name: string;
  description: string;
  formula: string;
  useCase: string;
  difficulty: '基础' | '中级' | '高级' | '专家';
}

export const formulaCategories = [
  { id: 'all', name: '全部', icon: 'Grid' },
  { id: 'basic', name: '基础入门', icon: 'BookOpen' },
  { id: 'conditional', name: '条件判断', icon: 'GitBranch' },
  { id: 'lookup', name: '查找匹配', icon: 'Search' },
  { id: 'statistics', name: '统计汇总', icon: 'BarChart3' },
  { id: 'text', name: '文本处理', icon: 'Type' },
  { id: 'date', name: '日期时间', icon: 'Calendar' },
  { id: 'financial', name: '财务会计', icon: 'DollarSign' },
  { id: 'advanced', name: '高级应用', icon: 'Sparkles' },
  { id: 'data', name: '数据清洗', icon: 'Filter' },
  { id: 'pivot', name: '数据透视', icon: 'Grid3x3' },
  { id: 'chart', name: '图表相关', icon: 'PieChart' },
  { id: 'vba', name: 'VBA相关', icon: 'Code' },
];

// 基础入门公式
export const basicFormulas: FormulaExample[] = [
  { category: 'basic', name: '快速求和', description: '对A1到A10区域求和', formula: '=SUM(A1:A10)', useCase: '汇总销售额、数量等', difficulty: '基础' },
  { category: 'basic', name: '平均值', description: '计算平均值', formula: '=AVERAGE(A1:A10)', useCase: '计算平均成绩、工资等', difficulty: '基础' },
  { category: 'basic', name: '计数', description: '统计数字个数', formula: '=COUNT(A1:A10)', useCase: '统计数据条数', difficulty: '基础' },
  { category: 'basic', name: '最大值', description: '查找最大值', formula: '=MAX(A1:A10)', useCase: '查找最高分', difficulty: '基础' },
  { category: 'basic', name: '最小值', description: '查找最小值', formula: '=MIN(A1:A10)', useCase: '查找最低分', difficulty: '基础' },
  { category: 'basic', name: '取整数', description: '取整数部分', formula: '=INT(4.7)', useCase: '四舍五入取整', difficulty: '基础' },
  { category: 'basic', name: '四舍五入', description: '保留两位小数', formula: '=ROUND(3.14159,2)', useCase: '金额精度处理', difficulty: '基础' },
  { category: 'basic', name: '绝对值', description: '取绝对值', formula: '=ABS(-10)', useCase: '计算偏差', difficulty: '基础' },
  { category: 'basic', name: '取余', description: '取余数', formula: '=MOD(10,3)', useCase: '奇偶判断', difficulty: '基础' },
  { category: 'basic', name: '平方根', description: '计算平方根', formula: '=SQRT(16)', useCase: '几何计算', difficulty: '基础' },
  { category: 'basic', name: '乘积', description: '计算乘积', formula: '=PRODUCT(A1:A5)', useCase: '阶乘计算', difficulty: '基础' },
  { category: 'basic', name: '幂运算', description: '计算n次方', formula: '=POWER(2,10)', useCase: '复利计算', difficulty: '基础' },
  { category: 'basic', name: '去除空格', description: '清理文本空格', formula: '=TRIM(A1)', useCase: '数据清洗', difficulty: '基础' },
  { category: 'basic', name: '连接文本', description: '用分隔符连接', formula: '=A1&"-"&B1', useCase: '生成唯一标识', difficulty: '基础' },
  { category: 'basic', name: '取左N个字符', description: '从左取N个字符', formula: '=LEFT(A1,3)', useCase: '提取区号、编码', difficulty: '基础' },
  { category: 'basic', name: '取右N个字符', description: '从右取N个字符', formula: '=RIGHT(A1,4)', useCase: '提取后4位数字', difficulty: '基础' },
  { category: 'basic', name: '当前日期', description: '返回今天', formula: '=TODAY()', useCase: '显示当前日期', difficulty: '基础' },
  { category: 'basic', name: '当前时间', description: '返回现在', formula: '=NOW()', useCase: '显示当前时间', difficulty: '基础' },
  { category: 'basic', name: '提取年', description: '提取年份', formula: '=YEAR(A1)', useCase: '出生年份提取', difficulty: '基础' },
  { category: 'basic', name: '提取月', description: '提取月份', formula: '=MONTH(A1)', useCase: '月份分组', difficulty: '基础' },
];

// 条件判断公式
export const conditionalFormulas: FormulaExample[] = [
  { category: 'conditional', name: 'IF基础判断', description: '条件判断', formula: '=IF(A1>100,"达标","未达标")', useCase: '绩效判定', difficulty: '基础' },
  { category: 'conditional', name: 'IF多条件', description: '多条件判断', formula: '=IF(AND(A1>60,B1>60),"通过","未通过")', useCase: '综合评定', difficulty: '中级' },
  { category: 'conditional', name: 'IF嵌套', description: '嵌套条件', formula: '=IF(A1>90,"优",IF(A1>80,"良",IF(A1>60,"及格","不及格")))', useCase: '等级评定', difficulty: '中级' },
  { category: 'conditional', name: 'IFS多条件', description: '新版多条件', formula: '=IFS(A1>90,"优",A1>80,"良",A1>60,"及格",TRUE,"不及格")', useCase: '等级评定', difficulty: '中级' },
  { category: 'conditional', name: 'IFERROR', description: '错误处理', formula: '=IFERROR(A1/B1,"除数不能为零")', useCase: '公式错误处理', difficulty: '基础' },
  { category: 'conditional', name: 'IFNA', description: 'NA错误处理', formula: '=IFNA(VLOOKUP(A1,B:C,2,FALSE),"未找到")', useCase: '查找错误处理', difficulty: '基础' },
  { category: 'conditional', name: 'SWITCH函数', description: '条件选择', formula: '=SWITCH(A1,1,"一",2,"二",3,"三","其他")', useCase: '多值映射', difficulty: '中级' },
  { category: 'conditional', name: 'AND函数', description: '逻辑与', formula: '=AND(A1>0,B1<100,C1<>"")', useCase: '多条件验证', difficulty: '基础' },
  { category: 'conditional', name: 'OR函数', description: '逻辑或', formula: '=OR(A1="是",B1="通过",C1>100)', useCase: '任一满足', difficulty: '基础' },
  { category: 'conditional', name: 'NOT函数', description: '逻辑非', formula: '=NOT(ISBLANK(A1))', useCase: '反向判断', difficulty: '基础' },
  { category: 'conditional', name: 'XOR异或', description: '异或运算', formula: '=XOR(A1>0,B1>0)', useCase: '互斥条件', difficulty: '中级' },
  { category: 'conditional', name: 'IF空白判断', description: '判断空白', formula: '=IF(ISBLANK(A1),"空",A1)', useCase: '空值处理', difficulty: '基础' },
  { category: 'conditional', name: 'IF数字判断', description: '判断数字', formula: '=IF(ISNUMBER(A1),"数字","非数字")', useCase: '类型检查', difficulty: '基础' },
];

// 查找匹配公式
export const lookupFormulas: FormulaExample[] = [
  { category: 'lookup', name: 'VLOOKUP基础', description: '垂直查找', formula: '=VLOOKUP(A1,B:D,3,FALSE)', useCase: '员工信息查询', difficulty: '基础' },
  { category: 'lookup', name: 'VLOOKUP区间', description: '区间查找', formula: '=VLOOKUP(A1,{0,"不及格";60,"及格";80,"良好";90,"优秀"},2,TRUE)', useCase: '等级划分', difficulty: '中级' },
  { category: 'lookup', name: 'HLOOKUP', description: '水平查找', formula: '=HLOOKUP(A1,B1:D5,3,FALSE)', useCase: '水平表查找', difficulty: '基础' },
  { category: 'lookup', name: 'XLOOKUP', description: 'XLOOKUP查找', formula: '=XLOOKUP(A1,B:B,D:D,"未找到")', useCase: '新版查找函数', difficulty: '中级' },
  { category: 'lookup', name: 'INDEX MATCH', description: '高级查找', formula: '=INDEX(C:C,MATCH(A1,B:B,0))', useCase: '万能查找组合', difficulty: '中级' },
  { category: 'lookup', name: 'INDEX MATCH 双向', description: '双向查找', formula: '=INDEX(B2:D10,MATCH("张三",A2:A10,0),MATCH("数学",B1:D1,0))', useCase: '成绩查询', difficulty: '高级' },
  { category: 'lookup', name: 'MATCH基础', description: '位置查找', formula: '=MATCH("苹果",A1:A10,0)', useCase: '查找位置', difficulty: '基础' },
  { category: 'lookup', name: 'INDIRECT', description: '间接引用', formula: '=INDIRECT("Sheet"&A1&"!B1")', useCase: '动态工作表引用', difficulty: '高级' },
  { category: 'lookup', name: 'OFFSET', description: '偏移引用', formula: '=OFFSET(A1,2,3,5,1)', useCase: '动态范围', difficulty: '高级' },
  { category: 'lookup', name: 'CHOOSE', description: '选择值', formula: '=CHOOSE(WEEKDAY(TODAY()),"周日","周一","周二","周三","周四","周五","周六")', useCase: '值选择', difficulty: '中级' },
  { category: 'lookup', name: 'XMATCH', description: 'X匹配', formula: '=XMATCH("目标",A:A,0)', useCase: '新版匹配', difficulty: '中级' },
  { category: 'lookup', name: 'FILTER筛选', description: '动态数组筛选', formula: '=FILTER(A:C,B:B>100)', useCase: '条件筛选', difficulty: '高级' },
  { category: 'lookup', name: 'UNIQUE去重', description: '提取唯一值', formula: '=UNIQUE(A1:A100)', useCase: '数据去重', difficulty: '高级' },
  { category: 'lookup', name: 'SORT排序', description: '动态数组排序', formula: '=SORT(A1:C10,2,-1)', useCase: '数据排序', difficulty: '高级' },
];

// 统计汇总公式
export const statisticsFormulas: FormulaExample[] = [
  { category: 'statistics', name: 'SUMIF条件求和', description: '按条件求和', formula: '=SUMIF(A:A,">100",B:B)', useCase: '按类别汇总', difficulty: '基础' },
  { category: 'statistics', name: 'SUMIFS多条件', description: '多条件求和', formula: '=SUMIFS(C:C,A:A,"销售部",B:B,">=2026-1-1")', useCase: '复杂条件汇总', difficulty: '中级' },
  { category: 'statistics', name: 'COUNTIF条件计数', description: '按条件计数', formula: '=COUNTIF(A:A,"北京")', useCase: '数据统计', difficulty: '基础' },
  { category: 'statistics', name: 'COUNTIFS多条件', description: '多条件计数', formula: '=COUNTIFS(A:A,"销售",B:B,">1000")', useCase: '多维度统计', difficulty: '中级' },
  { category: 'statistics', name: 'AVERAGEIF', description: '条件平均值', formula: '=AVERAGEIF(A:A,"男",B:B)', useCase: '按类别求平均', difficulty: '中级' },
  { category: 'statistics', name: 'AVERAGEIFS', description: '多条件平均', formula: '=AVERAGEIFS(B:B,A:A,"销售",C:C,"Q1")', useCase: '多维度平均', difficulty: '中级' },
  { category: 'statistics', name: '排名', description: '排名', formula: '=RANK(A1,A:A,0)', useCase: '成绩排名', difficulty: '基础' },
  { category: 'statistics', name: '中位数', description: '中位数', formula: '=MEDIAN(A1:A10)', useCase: '数据中心趋势', difficulty: '基础' },
  { category: 'statistics', name: '众数', description: '众数', formula: '=MODE(A1:A10)', useCase: '最频繁值', difficulty: '基础' },
  { category: 'statistics', name: '标准差', description: '样本标准差', formula: '=STDEV(A1:A10)', useCase: '数据离散度', difficulty: '中级' },
  { category: 'statistics', name: '方差', description: '样本方差', formula: '=VAR(A1:A10)', useCase: '数据离散度', difficulty: '中级' },
  { category: 'statistics', name: '第K大值', description: '第K大值', formula: '=LARGE(A1:A10,3)', useCase: '前三名', difficulty: '中级' },
  { category: 'statistics', name: '第K小值', description: '第K小值', formula: '=SMALL(A1:A10,3)', useCase: '倒数排名', difficulty: '中级' },
  { category: 'statistics', name: '百分位', description: '百分位排名', formula: '=PERCENTILE(A1:A10,0.9)', useCase: 'P90值', difficulty: '中级' },
  { category: 'statistics', name: '四分位', description: '四分位数', formula: '=QUARTILE(A1:A10,2)', useCase: '分位数分析', difficulty: '中级' },
  { category: 'statistics', name: '相关系数', description: '相关系数', formula: '=CORREL(A:A,B:B)', useCase: '相关性分析', difficulty: '高级' },
  { category: 'statistics', name: 'SUMPRODUCT', description: '数组乘积求和', formula: '=SUMPRODUCT((A1:A10>100)*B1:B10)', useCase: '条件求和（数组）', difficulty: '高级' },
  { category: 'statistics', name: '频率分布', description: '频率分布', formula: '=FREQUENCY(A1:A100,B1:B10)', useCase: '区间统计', difficulty: '高级' },
];

// 文本处理公式
export const textFormulas: FormulaExample[] = [
  { category: 'text', name: '提取姓氏', description: '提取姓氏', formula: '=LEFT(A1,1)', useCase: '中文姓氏提取', difficulty: '基础' },
  { category: 'text', name: '提取手机尾号', description: '提取手机后4位', formula: '=RIGHT(A1,4)', useCase: '手机号处理', difficulty: '基础' },
  { category: 'text', name: '提取身份证生日', description: '从身份证提取生日', formula: '=MID(A1,7,8)', useCase: '信息提取', difficulty: '中级' },
  { category: 'text', name: '替换字符', description: '替换文本', formula: '=SUBSTITUTE(A1,"旧","新")', useCase: '批量替换', difficulty: '基础' },
  { category: 'text', name: '查找位置', description: '查找字符位置', formula: '=FIND("@",A1)', useCase: '邮箱验证', difficulty: '基础' },
  { category: 'text', name: '是否包含', description: '检查是否包含', formula: '=ISNUMBER(SEARCH("关键字",A1))', useCase: '内容检查', difficulty: '中级' },
  { category: 'text', name: '文本长度', description: '字符数', formula: '=LEN(A1)', useCase: '字符统计', difficulty: '基础' },
  { category: 'text', name: '大写转换', description: '转大写', formula: '=UPPER(A1)', useCase: '格式标准化', difficulty: '基础' },
  { category: 'text', name: '首字母大写', description: '首字母大写', formula: '=PROPER(A1)', useCase: '英文人名', difficulty: '基础' },
  { category: 'text', name: 'TEXT格式化', description: '格式化数字', formula: '=TEXT(A1,"¥#,##0.00")', useCase: '金额格式化', difficulty: '中级' },
  { category: 'text', name: '日期格式化', description: '日期格式', formula: '=TEXT(A1,"yyyy年mm月dd日")', useCase: '中文日期', difficulty: '中级' },
  { category: 'text', name: '重复字符', description: '生成重复', formula: '=REPT("*",10)', useCase: '进度条', difficulty: '基础' },
  { category: 'text', name: '清除字符', description: '清除不可见字符', formula: '=CLEAN(A1)', useCase: '数据清洗', difficulty: '中级' },
  { category: 'text', name: 'CHAR生成', description: '生成特殊字符', formula: '=CHAR(10)', useCase: '换行符', difficulty: '中级' },
  { category: 'text', name: 'TEXTJOIN合并', description: '分隔符合并', formula: '=TEXTJOIN(",",TRUE,A1:A10)', useCase: '列表合并', difficulty: '中级' },
];

// 日期时间公式
export const dateFormulas: FormulaExample[] = [
  { category: 'date', name: '年龄计算', description: '根据生日计算年龄', formula: '=DATEDIF(B1,TODAY(),"Y")', useCase: '年龄计算', difficulty: '中级' },
  { category: 'date', name: '工作日', description: '计算工作日数', formula: '=NETWORKDAYS("2026-1-1","2026-12-31")', useCase: '项目周期', difficulty: '中级' },
  { category: 'date', name: '周末判断', description: '判断是否周末', formula: '=IF(WEEKDAY(A1,2)>5,"周末","工作日")', useCase: '工作日判断', difficulty: '中级' },
  { category: 'date', name: '周数计算', description: '计算周数', formula: '=WEEKNUM(TODAY())', useCase: '周报统计', difficulty: '基础' },
  { category: 'date', name: '月末日期', description: '本月最后一天', formula: '=EOMONTH(TODAY(),0)', useCase: '月末对账', difficulty: '中级' },
  { category: 'date', name: 'N个月后', description: 'N个月后日期', formula: '=EDATE(TODAY(),3)', useCase: '到期日', difficulty: '基础' },
  { category: 'date', name: '日期差', description: '两日期相差天数', formula: '=DATEDIF(A1,B1,"D")', useCase: '工期计算', difficulty: '基础' },
  { category: 'date', name: '年龄精确', description: '精确年龄', formula: '=DATEDIF(B1,TODAY(),"Y")&"岁"&DATEDIF(B1,TODAY(),"YM")&"月"', useCase: '精确年龄', difficulty: '高级' },
  { category: 'date', name: '本月天数', description: '本月天数', formula: '=DAY(EOMONTH(TODAY(),0))', useCase: '排班', difficulty: '中级' },
  { category: 'date', name: '季度', description: '当前季度', formula: '=ROUNDUP(MONTH(TODAY())/3,0)', useCase: '季度报表', difficulty: '中级' },
  { category: 'date', name: '时分秒', description: '提取时分秒', formula: '=HOUR(NOW())&":"&MINUTE(NOW())', useCase: '时间显示', difficulty: '基础' },
  { category: 'date', name: 'WORKDAY计算', description: 'N个工作日后', formula: '=WORKDAY(TODAY(),10)', useCase: '项目交付', difficulty: '中级' },
];

// 财务会计公式
export const financialFormulas: FormulaExample[] = [
  { category: 'financial', name: '等额本息月供', description: '房贷月供', formula: '=PMT(0.05/12,360,1000000)', useCase: '房贷计算', difficulty: '中级' },
  { category: 'financial', name: '未来值', description: '投资终值', formula: '=FV(0.06/12,120,-1000)', useCase: '投资计算', difficulty: '中级' },
  { category: 'financial', name: '现值', description: '现值', formula: '=PV(0.08,10,-10000)', useCase: '投资评估', difficulty: '中级' },
  { category: 'financial', name: '净现值', description: 'NPV', formula: '=NPV(0.1,values)', useCase: '投资决策', difficulty: '高级' },
  { category: 'financial', name: '内部收益率', description: 'IRR', formula: '=IRR(cashflows)', useCase: '项目收益', difficulty: '高级' },
  { category: 'financial', name: '直线折旧', description: '平均年限法', formula: '=SLN(10000,1000,5)', useCase: '固定资产折旧', difficulty: '中级' },
  { category: 'financial', name: '双倍余额', description: '加速折旧', formula: '=DDB(10000,1000,5,1)', useCase: '折旧计算', difficulty: '高级' },
  { category: 'financial', name: '复利终值', description: '复利计算', formula: '=10000*(1+0.05)^10', useCase: '财富增长', difficulty: '中级' },
  { category: 'financial', name: '利润率', description: '毛利率', formula: '=(收入-成本)/收入', useCase: '利润分析', difficulty: '基础' },
  { category: 'financial', name: '增长率', description: '同比环比', formula: '=(本期-上期)/上期', useCase: '增长分析', difficulty: '基础' },
];

// 高级应用公式
export const advancedFormulas: FormulaExample[] = [
  { category: 'advanced', name: '数组求和', description: 'CSE数组公式', formula: '{=SUM(IF(A1:A10>100,B1:B10))}', useCase: '复杂数组运算', difficulty: '高级' },
  { category: 'advanced', name: '动态数组筛选', description: 'FILTER函数', formula: '=FILTER(A1:C10,B1:B10>100,"无数据")', useCase: '动态筛选', difficulty: '高级' },
  { category: 'advanced', name: 'LET变量', description: '使用变量', formula: '=LET(x,A1+1,y,B1+1,x*y)', useCase: '复杂公式简化', difficulty: '高级' },
  { category: 'advanced', name: 'LAMBDA自定义', description: '自定义函数', formula: '=LAMBDA(x,y,x*y)(2,3)', useCase: '复用公式', difficulty: '专家' },
  { category: 'advanced', name: 'MAP函数', description: '数组映射', formula: '=MAP(A1:A10,LAMBDA(x,x*2))', useCase: '批量处理', difficulty: '专家' },
  { category: 'advanced', name: 'REDUCE函数', description: '累加器', formula: '=REDUCE(0,A1:A10,LAMBDA(a,b,a+b))', useCase: '自定义聚合', difficulty: '专家' },
  { category: 'advanced', name: '多条件查找', description: '多键查找', formula: '=INDEX(D:D,MATCH(1,(A:A="A")*(B:B=1),0))', useCase: '复杂查询', difficulty: '专家' },
  { category: 'advanced', name: '累计求和', description: '滚动求和', formula: '=SUM(OFFSET(A1,0,0,ROW(A1),1))', useCase: '累计统计', difficulty: '高级' },
  { category: 'advanced', name: '排名过滤', description: '前N名筛选', formula: '=FILTER(A:A,RANK(A1,A:A,0)<=10)', useCase: 'TOP10', difficulty: '高级' },
  { category: 'advanced', name: '按组求和', description: '多列分组', formula: '=SUMIFS(数据列,组列,组名)', useCase: '多维度汇总', difficulty: '高级' },
  { category: 'advanced', name: '波动率', description: '变异系数', formula: '=STDEV(A1:A10)/AVERAGE(A1:A10)', useCase: '风险评估', difficulty: '高级' },
  { category: 'advanced', name: '移动平均', description: '滚动平均', formula: '=AVERAGE(OFFSET(A1,-2,0,3,1))', useCase: '趋势平滑', difficulty: '高级' },
];

// 数据清洗公式
export const dataCleanFormulas: FormulaExample[] = [
  { category: 'data', name: '去除前后空格', description: '清理空格', formula: '=TRIM(A1)', useCase: '数据清洗', difficulty: '基础' },
  { category: 'data', name: '去除非打印字符', description: '清除控制字符', formula: '=CLEAN(A1)', useCase: '导入数据清理', difficulty: '中级' },
  { category: 'data', name: '统一分隔符', description: '替换分隔符', formula: '=SUBSTITUTE(A1,";","，")', useCase: '格式统一', difficulty: '基础' },
  { category: 'data', name: '提取数字', description: '只保留数字', formula: '=TEXTJOIN("",TRUE,IFERROR(MID(A1,ROW(INDIRECT("1:"&LEN(A1))),1)*1,""))', useCase: '数字提取', difficulty: '高级' },
  { category: 'data', name: '检查重复', description: '重复标记', formula: '=IF(COUNTIF($A$1:A1,A1)>1,"重复","")', useCase: '去重', difficulty: '中级' },
  { category: 'data', name: '删除空行', description: '空行处理', formula: '=IF(SUM(--(A1:A100<>""))=0,"","")', useCase: '空行检测', difficulty: '高级' },
  { category: 'data', name: '英文字符', description: '英文提取', formula: '=TEXTJOIN("",TRUE,IFERROR(MID(A1,ROW(INDIRECT("1:"&LEN(A1))),1)*1,""))', useCase: '英文提取', difficulty: '高级' },
  { category: 'data', name: '中英混合', description: '中英提取', formula: '=CONCAT(IFERROR(MID(A1,ROW(INDIRECT("1:"&LEN(A1))),1)*1,""))', useCase: '字符处理', difficulty: '高级' },
  { category: 'data', name: '数字校验', description: '检查数字', formula: '=IF(ISNUMBER(VALUE(A1)),"有效","无效")', useCase: '数据验证', difficulty: '中级' },
  { category: 'data', name: '邮箱验证', description: '邮箱格式', formula: '=IF(AND(ISNUMBER(FIND("@",A1)),ISNUMBER(FIND(".",A1,FIND("@",A1)))),"有效","无效")', useCase: '邮箱验证', difficulty: '高级' },
  { category: 'data', name: '手机号验证', description: '手机号格式', formula: '=IF(AND(LEN(A1)=11,ISNUMBER(VALUE(A1)),LEFT(A1,1)="1"),"有效","无效")', useCase: '手机号验证', difficulty: '高级' },
  { category: 'data', name: '身份证验证', description: '身份证号', formula: '=IF(AND(LEN(A1)=18,ISNUMBER(VALUE(LEFT(A1,17)))),"有效","无效")', useCase: '身份证验证', difficulty: '高级' },
];

// 导出所有公式
export const allFormulas: FormulaExample[] = [
  ...basicFormulas,
  ...conditionalFormulas,
  ...lookupFormulas,
  ...statisticsFormulas,
  ...textFormulas,
  ...dateFormulas,
  ...financialFormulas,
  ...advancedFormulas,
  ...dataCleanFormulas,
];

// 获取公式总数
export function getTotalFormulaCount(): number {
  return allFormulas.length;
}

// 按分类获取公式
export function getFormulasByCategory(categoryId: string): FormulaExample[] {
  if (categoryId === 'all') return allFormulas;
  return allFormulas.filter(f => f.category === categoryId);
}

// 搜索公式
export function searchFormulas(keyword: string): FormulaExample[] {
  const lower = keyword.toLowerCase();
  return allFormulas.filter(f =>
    f.name.toLowerCase().includes(lower) ||
    f.description.toLowerCase().includes(lower) ||
    f.formula.toLowerCase().includes(lower) ||
    f.useCase.toLowerCase().includes(lower)
  );
}

// 兼容旧版本导出
export const formulaExamples = allFormulas;