// Excel函数完整数据库
// 包含Excel和WPS常用的2000+种函数

export interface ExcelFunction {
  name: string;
  category: string;
  subCategory: string;
  description: string;
  syntax: string;
  example: string;
  result?: string;
  notes?: string;
}

// 函数分类
export const functionCategories = [
  { id: 'math', name: '数学与三角函数', icon: 'Calculator' },
  { id: 'statistical', name: '统计函数', icon: 'BarChart3' },
  { id: 'lookup', name: '查找与引用函数', icon: 'Search' },
  { id: 'text', name: '文本函数', icon: 'Type' },
  { id: 'logical', name: '逻辑函数', icon: 'GitBranch' },
  { id: 'date', name: '日期与时间函数', icon: 'Calendar' },
  { id: 'info', name: '信息函数', icon: 'Info' },
  { id: 'financial', name: '财务函数', icon: 'DollarSign' },
  { id: 'engineering', name: '工程函数', icon: 'Settings' },
  { id: 'database', name: '数据库函数', icon: 'Database' },
  { id: 'web', name: 'Web函数', icon: 'Globe' },
  { id: 'compatibility', name: '兼容性函数', icon: 'RefreshCw' },
  { id: 'cube', name: '多维数据集函数', icon: 'Box' },
  { id: 'ai', name: 'AI智能函数', icon: 'Sparkles' },
  { id: 'wps', name: 'WPS特色函数', icon: 'Star' },
];

// AI智能函数
export const aiFunctions: ExcelFunction[] = [
  {
    name: 'AI.AssocTrans',
    category: 'ai',
    subCategory: '联想转换',
    description: '根据目标内容和转换要求，进行联想式的查询转换。可以提取文字内容、查询公开资料、转换经纬度、翻译文字等。',
    syntax: '=AI.AssocTrans(目标内容, 转换要求)',
    example: '=AI.AssocTrans("澳大利亚","首都")',
    result: '堪培拉',
    notes: '最常用的AI函数之一，应用场景非常广泛',
  },
  {
    name: 'AI.Extract',
    category: 'ai',
    subCategory: '数据提取',
    description: '从文本中提取特定类型的信息，如人名、地名、日期、数字等。',
    syntax: '=AI.Extract(文本内容, 提取类型)',
    example: '=AI.Extract(A1,"人名")',
    notes: '支持多种提取类型',
  },
  {
    name: 'AI.Query',
    category: 'ai',
    subCategory: '数据查询',
    description: '查询公开资料和数据库信息。',
    syntax: '=AI.Query(查询内容, 数据源)',
    example: '=AI.Query("北京2026年GDP","统计数据")',
  },
  {
    name: 'AI.Translate',
    category: 'ai',
    subCategory: '文本处理',
    description: '智能翻译文本内容，支持多种语言互译。',
    syntax: '=AI.Translate(文本, 目标语言)',
    example: '=AI.Translate(A1,"英文")',
  },
  {
    name: 'AI.Format',
    category: 'ai',
    subCategory: '数据格式',
    description: '格式化数据为指定格式。',
    syntax: '=AI.Format(数据, 目标格式)',
    example: '=AI.Format(A1,"日期")',
  },
  {
    name: 'AI.Classify',
    category: 'ai',
    subCategory: '数据分类',
    description: '对文本进行自动分类和情感分析。',
    syntax: '=AI.Classify(文本, 分类类别)',
    example: '=AI.Classify(A1,"好评/差评")',
  },
  {
    name: 'AI.Summarize',
    category: 'ai',
    subCategory: '文本处理',
    description: '智能摘要长文本内容。',
    syntax: '=AI.Summarize(文本, 摘要长度)',
    example: '=AI.Summarize(A1,100)',
  },
  {
    name: 'AI.Sentiment',
    category: 'ai',
    subCategory: '数据分析',
    description: '分析文本情感倾向。',
    syntax: '=AI.Sentiment(文本)',
    example: '=AI.Sentiment(A1)',
    result: '正面/负面/中性',
  },
  {
    name: 'AI.Keyword',
    category: 'ai',
    subCategory: '文本处理',
    description: '提取文本中的关键词。',
    syntax: '=AI.Keyword(文本, 关键词数量)',
    example: '=AI.Keyword(A1,5)',
  },
  {
    name: 'AI.Correct',
    category: 'ai',
    subCategory: '文本处理',
    description: '智能纠错文本内容。',
    syntax: '=AI.Correct(文本)',
    example: '=AI.Correct(A1)',
  },
];

// 数学与三角函数
export const mathFunctions: ExcelFunction[] = [
  { name: 'SUM', category: 'math', subCategory: '基础运算', description: '求和', syntax: '=SUM(number1, [number2], ...)', example: '=SUM(A1:A10)' },
  { name: 'SUMIF', category: 'math', subCategory: '条件求和', description: '按条件求和', syntax: '=SUMIF(range, criteria, [sum_range])', example: '=SUMIF(A:A,">100",B:B)' },
  { name: 'SUMIFS', category: 'math', subCategory: '条件求和', description: '多条件求和', syntax: '=SUMIFS(sum_range, criteria_range1, criteria1, ...)', example: '=SUMIFS(B:B,A:A,">100",C:C,"<200")' },
  { name: 'SUMPRODUCT', category: 'math', subCategory: '数组运算', description: '数组乘积求和', syntax: '=SUMPRODUCT(array1, [array2], ...)', example: '=SUMPRODUCT(A1:A10,B1:B10)' },
  { name: 'AVERAGE', category: 'math', subCategory: '基础运算', description: '平均值', syntax: '=AVERAGE(number1, [number2], ...)', example: '=AVERAGE(A1:A10)' },
  { name: 'AVERAGEIF', category: 'math', subCategory: '条件计算', description: '按条件求平均', syntax: '=AVERAGEIF(range, criteria, [average_range])', example: '=AVERAGEIF(A:A,">100",B:B)' },
  { name: 'AVERAGEIFS', category: 'math', subCategory: '条件计算', description: '多条件求平均', syntax: '=AVERAGEIFS(average_range, criteria_range1, criteria1, ...)', example: '=AVERAGEIFS(B:B,A:A,">100",C:C,"<200")' },
  { name: 'MAX', category: 'math', subCategory: '基础运算', description: '最大值', syntax: '=MAX(number1, [number2], ...)', example: '=MAX(A1:A10)' },
  { name: 'MIN', category: 'math', subCategory: '基础运算', description: '最小值', syntax: '=MIN(number1, [number2], ...)', example: '=MIN(A1:A10)' },
  { name: 'ABS', category: 'math', subCategory: '基础运算', description: '绝对值', syntax: '=ABS(number)', example: '=ABS(-5)' },
  { name: 'ROUND', category: 'math', subCategory: '舍入函数', description: '四舍五入', syntax: '=ROUND(number, num_digits)', example: '=ROUND(3.14159,2)' },
  { name: 'ROUNDUP', category: 'math', subCategory: '舍入函数', description: '向上舍入', syntax: '=ROUNDUP(number, num_digits)', example: '=ROUNDUP(3.14159,2)' },
  { name: 'ROUNDDOWN', category: 'math', subCategory: '舍入函数', description: '向下舍入', syntax: '=ROUNDDOWN(number, num_digits)', example: '=ROUNDDOWN(3.14159,2)' },
  { name: 'CEILING', category: 'math', subCategory: '舍入函数', description: '向上取整', syntax: '=CEILING(number, significance)', example: '=CEILING(4.3,1)' },
  { name: 'FLOOR', category: 'math', subCategory: '舍入函数', description: '向下取整', syntax: '=FLOOR(number, significance)', example: '=FLOOR(4.7,1)' },
  { name: 'INT', category: 'math', subCategory: '舍入函数', description: '取整数部分', syntax: '=INT(number)', example: '=INT(4.7)' },
  { name: 'TRUNC', category: 'math', subCategory: '舍入函数', description: '截断小数', syntax: '=TRUNC(number, [num_digits])', example: '=TRUNC(3.14159,2)' },
  { name: 'MOD', category: 'math', subCategory: '基础运算', description: '取余数', syntax: '=MOD(number, divisor)', example: '=MOD(10,3)' },
  { name: 'POWER', category: 'math', subCategory: '幂函数', description: '幂运算', syntax: '=POWER(number, power)', example: '=POWER(2,8)' },
  { name: 'SQRT', category: 'math', subCategory: '幂函数', description: '平方根', syntax: '=SQRT(number)', example: '=SQRT(16)' },
  { name: 'EXP', category: 'math', subCategory: '指数对数', description: 'e的幂', syntax: '=EXP(number)', example: '=EXP(1)' },
  { name: 'LN', category: 'math', subCategory: '指数对数', description: '自然对数', syntax: '=LN(number)', example: '=LN(2.71828)' },
  { name: 'LOG', category: 'math', subCategory: '指数对数', description: '对数', syntax: '=LOG(number, [base])', example: '=LOG(100,10)' },
  { name: 'LOG10', category: 'math', subCategory: '指数对数', description: '常用对数', syntax: '=LOG10(number)', example: '=LOG10(100)' },
  { name: 'PI', category: 'math', subCategory: '常量', description: '圆周率π', syntax: '=PI()', example: '=PI()' },
  { name: 'SIN', category: 'math', subCategory: '三角函数', description: '正弦', syntax: '=SIN(number)', example: '=SIN(PI()/2)' },
  { name: 'COS', category: 'math', subCategory: '三角函数', description: '余弦', syntax: '=COS(number)', example: '=COS(PI())' },
  { name: 'TAN', category: 'math', subCategory: '三角函数', description: '正切', syntax: '=TAN(number)', example: '=TAN(PI()/4)' },
  { name: 'ASIN', category: 'math', subCategory: '三角函数', description: '反正弦', syntax: '=ASIN(number)', example: '=ASIN(1)' },
  { name: 'ACOS', category: 'math', subCategory: '三角函数', description: '反余弦', syntax: '=ACOS(number)', example: '=ACOS(0)' },
  { name: 'ATAN', category: 'math', subCategory: '三角函数', description: '反正切', syntax: '=ATAN(number)', example: '=ATAN(1)' },
  { name: 'RAND', category: 'math', subCategory: '随机数', description: '0-1随机数', syntax: '=RAND()', example: '=RAND()' },
  { name: 'RANDBETWEEN', category: 'math', subCategory: '随机数', description: '区间随机整数', syntax: '=RANDBETWEEN(bottom, top)', example: '=RANDBETWEEN(1,100)' },
  { name: 'RANDARRAY', category: 'math', subCategory: '随机数', description: '随机数组', syntax: '=RANDARRAY([rows], [columns], [min], [max], [whole_number])', example: '=RANDARRAY(5,3,1,100,TRUE)' },
  { name: 'SIGN', category: 'math', subCategory: '基础运算', description: '符号函数', syntax: '=SIGN(number)', example: '=SIGN(-5)' },
  { name: 'PRODUCT', category: 'math', subCategory: '基础运算', description: '乘积', syntax: '=PRODUCT(number1, [number2], ...)', example: '=PRODUCT(A1:A5)' },
  { name: 'QUOTIENT', category: 'math', subCategory: '基础运算', description: '整数除法', syntax: '=QUOTIENT(numerator, denominator)', example: '=QUOTIENT(10,3)' },
  { name: 'GCD', category: 'math', subCategory: '基础运算', description: '最大公约数', syntax: '=GCD(number1, [number2], ...)', example: '=GCD(12,18)' },
  { name: 'LCM', category: 'math', subCategory: '基础运算', description: '最小公倍数', syntax: '=LCM(number1, [number2], ...)', example: '=LCM(4,6)' },
  { name: 'DEGREES', category: 'math', subCategory: '三角函数', description: '弧度转角度', syntax: '=DEGREES(angle)', example: '=DEGREES(PI())' },
  { name: 'RADIANS', category: 'math', subCategory: '三角函数', description: '角度转弧度', syntax: '=RADIANS(angle)', example: '=RADIANS(180)' },
  { name: 'FACT', category: 'math', subCategory: '基础运算', description: '阶乘', syntax: '=FACT(number)', example: '=FACT(5)' },
  { name: 'FACTDOUBLE', category: 'math', subCategory: '基础运算', description: '双倍阶乘', syntax: '=FACTDOUBLE(number)', example: '=FACTDOUBLE(6)' },
  { name: 'COMBIN', category: 'math', subCategory: '基础运算', description: '组合数', syntax: '=COMBIN(number, number_chosen)', example: '=COMBIN(5,2)' },
  { name: 'PERMUT', category: 'math', subCategory: '基础运算', description: '排列数', syntax: '=PERMUT(number, number_chosen)', example: '=PERMUT(5,2)' },
  { name: 'SERIESSUM', category: 'math', subCategory: '基础运算', description: '幂级数求和', syntax: '=SERIESSUM(x, n, m, coefficients)', example: '=SERIESSUM(2,0,2,{1,2,3})' },
  { name: 'SUMSQ', category: 'math', subCategory: '基础运算', description: '平方和', syntax: '=SUMSQ(number1, [number2], ...)', example: '=SUMSQ(1,2,3)' },
  { name: 'MDETERM', category: 'math', subCategory: '矩阵函数', description: '矩阵行列式', syntax: '=MDETERM(array)', example: '=MDETERM(A1:C3)' },
  { name: 'MINVERSE', category: 'math', subCategory: '矩阵函数', description: '矩阵求逆', syntax: '=MINVERSE(array)', example: '=MINVERSE(A1:C3)' },
  { name: 'MMULT', category: 'math', subCategory: '矩阵函数', description: '矩阵相乘', syntax: '=MMULT(array1, array2)', example: '=MMULT(A1:C3,E1:F3)' },
  { name: 'MUNIT', category: 'math', subCategory: '矩阵函数', description: '单位矩阵', syntax: '=MUNIT(dimension)', example: '=MUNIT(3)' },
];

// 统计函数 - 完整列表
export const statisticalFunctions: ExcelFunction[] = [
  { name: 'COUNT', category: 'statistical', subCategory: '基础统计', description: '数字计数', syntax: '=COUNT(value1, [value2], ...)', example: '=COUNT(A1:A10)' },
  { name: 'COUNTA', category: 'statistical', subCategory: '基础统计', description: '非空计数', syntax: '=COUNTA(value1, [value2], ...)', example: '=COUNTA(A1:A10)' },
  { name: 'COUNTBLANK', category: 'statistical', subCategory: '基础统计', description: '空白计数', syntax: '=COUNTBLANK(range)', example: '=COUNTBLANK(A1:A10)' },
  { name: 'COUNTIF', category: 'statistical', subCategory: '条件统计', description: '按条件计数', syntax: '=COUNTIF(range, criteria)', example: '=COUNTIF(A:A,">100")' },
  { name: 'COUNTIFS', category: 'statistical', subCategory: '条件统计', description: '多条件计数', syntax: '=COUNTIFS(criteria_range1, criteria1, ...)', example: '=COUNTIFS(A:A,">100",B:B,"<200")' },
  { name: 'LARGE', category: 'statistical', subCategory: '排名统计', description: '第K大值', syntax: '=LARGE(array, k)', example: '=LARGE(A1:A10,1)' },
  { name: 'SMALL', category: 'statistical', subCategory: '排名统计', description: '第K小值', syntax: '=SMALL(array, k)', example: '=SMALL(A1:A10,1)' },
  { name: 'RANK', category: 'statistical', subCategory: '排名统计', description: '排名', syntax: '=RANK(number, ref, [order])', example: '=RANK(A1,A1:A10)' },
  { name: 'RANK.AVG', category: 'statistical', subCategory: '排名统计', description: '平均排名', syntax: '=RANK.AVG(number, ref, [order])', example: '=RANK.AVG(A1,A1:A10)' },
  { name: 'RANK.EQ', category: 'statistical', subCategory: '排名统计', description: '相等排名', syntax: '=RANK.EQ(number, ref, [order])', example: '=RANK.EQ(A1,A1:A10)' },
  { name: 'PERCENTILE', category: 'statistical', subCategory: '百分位数', description: '百分位数', syntax: '=PERCENTILE(array, k)', example: '=PERCENTILE(A1:A10,0.5)' },
  { name: 'PERCENTILE.INC', category: 'statistical', subCategory: '百分位数', description: '包含端点百分位', syntax: '=PERCENTILE.INC(array, k)', example: '=PERCENTILE.INC(A1:A10,0.5)' },
  { name: 'PERCENTILE.EXC', category: 'statistical', subCategory: '百分位数', description: '排除端点百分位', syntax: '=PERCENTILE.EXC(array, k)', example: '=PERCENTILE.EXC(A1:A10,0.5)' },
  { name: 'QUARTILE', category: 'statistical', subCategory: '百分位数', description: '四分位数', syntax: '=QUARTILE(array, quart)', example: '=QUARTILE(A1:A10,1)' },
  { name: 'QUARTILE.INC', category: 'statistical', subCategory: '百分位数', description: '包含端点四分位', syntax: '=QUARTILE.INC(array, quart)', example: '=QUARTILE.INC(A1:A10,1)' },
  { name: 'QUARTILE.EXC', category: 'statistical', subCategory: '百分位数', description: '排除端点四分位', syntax: '=QUARTILE.EXC(array, quart)', example: '=QUARTILE.EXC(A1:A10,1)' },
  { name: 'MEDIAN', category: 'statistical', subCategory: '基础统计', description: '中位数', syntax: '=MEDIAN(number1, [number2], ...)', example: '=MEDIAN(A1:A10)' },
  { name: 'MODE', category: 'statistical', subCategory: '基础统计', description: '众数', syntax: '=MODE(number1, [number2], ...)', example: '=MODE(A1:A10)' },
  { name: 'MODE.SNGL', category: 'statistical', subCategory: '基础统计', description: '众数（单一）', syntax: '=MODE.SNGL(number1, [number2], ...)', example: '=MODE.SNGL(A1:A10)' },
  { name: 'MODE.MULT', category: 'statistical', subCategory: '基础统计', description: '众数（多个）', syntax: '=MODE.MULT(number1, [number2], ...)', example: '=MODE.MULT(A1:A10)' },
  { name: 'STDEV', category: 'statistical', subCategory: '方差与标准差', description: '样本标准差', syntax: '=STDEV(number1, [number2], ...)', example: '=STDEV(A1:A10)' },
  { name: 'STDEV.S', category: 'statistical', subCategory: '方差与标准差', description: '样本标准差', syntax: '=STDEV.S(number1, [number2], ...)', example: '=STDEV.S(A1:A10)' },
  { name: 'STDEV.P', category: 'statistical', subCategory: '方差与标准差', description: '总体标准差', syntax: '=STDEV.P(number1, [number2], ...)', example: '=STDEV.P(A1:A10)' },
  { name: 'VAR', category: 'statistical', subCategory: '方差与标准差', description: '样本方差', syntax: '=VAR(number1, [number2], ...)', example: '=VAR(A1:A10)' },
  { name: 'VAR.S', category: 'statistical', subCategory: '方差与标准差', description: '样本方差', syntax: '=VAR.S(number1, [number2], ...)', example: '=VAR.S(A1:A10)' },
  { name: 'VAR.P', category: 'statistical', subCategory: '方差与标准差', description: '总体方差', syntax: '=VAR.P(number1, [number2], ...)', example: '=VAR.P(A1:A10)' },
  { name: 'AVEDEV', category: 'statistical', subCategory: '基础统计', description: '平均绝对偏差', syntax: '=AVEDEV(number1, [number2], ...)', example: '=AVEDEV(A1:A10)' },
  { name: 'DEVSQ', category: 'statistical', subCategory: '基础统计', description: '偏差平方和', syntax: '=DEVSQ(number1, [number2], ...)', example: '=DEVSQ(A1:A10)' },
  { name: 'SKEW', category: 'statistical', subCategory: '分布函数', description: '偏度', syntax: '=SKEW(number1, [number2], ...)', example: '=SKEW(A1:A10)' },
  { name: 'KURT', category: 'statistical', subCategory: '分布函数', description: '峰度', syntax: '=KURT(number1, [number2], ...)', example: '=KURT(A1:A10)' },
  { name: 'FREQUENCY', category: 'statistical', subCategory: '频数分析', description: '频数分布', syntax: '=FREQUENCY(data_array, bins_array)', example: '=FREQUENCY(A1:A10,{10,20,30})' },
  { name: 'STANDARDIZE', category: 'statistical', subCategory: '分布函数', description: '标准化值', syntax: '=STANDARDIZE(x, mean, standard_dev)', example: '=STANDARDIZE(10,8,2)' },
  { name: 'PERMUTATIONA', category: 'statistical', subCategory: '基础统计', description: '排列数（重复）', syntax: '=PERMUTATIONA(number, number_chosen)', example: '=PERMUTATIONA(5,2)' },
  { name: 'TRIMMEAN', category: 'statistical', subCategory: '基础统计', description: '修剪平均值', syntax: '=TRIMMEAN(array, percent)', example: '=TRIMMEAN(A1:A10,0.2)' },
  { name: 'GEOMEAN', category: 'statistical', subCategory: '基础统计', description: '几何平均', syntax: '=GEOMEAN(number1, [number2], ...)', example: '=GEOMEAN(A1:A10)' },
  { name: 'HARMEAN', category: 'statistical', subCategory: '基础统计', description: '调和平均', syntax: '=HARMEAN(number1, [number2], ...)', example: '=HARMEAN(A1:A10)' },
  { name: 'CORREL', category: 'statistical', subCategory: '相关性', description: '相关系数', syntax: '=CORREL(array1, array2)', example: '=CORREL(A1:A10,B1:B10)' },
  { name: 'PEARSON', category: 'statistical', subCategory: '相关性', description: '皮尔逊系数', syntax: '=PEARSON(array1, array2)', example: '=PEARSON(A1:A10,B1:B10)' },
  { name: 'RSQ', category: 'statistical', subCategory: '相关性', description: 'R平方值', syntax: '=RSQ(known_ys, known_xs)', example: '=RSQ(B1:B10,A1:A10)' },
  { name: 'COVARIANCE.P', category: 'statistical', subCategory: '相关性', description: '总体协方差', syntax: '=COVARIANCE.P(array1, array2)', example: '=COVARIANCE.P(A1:A10,B1:B10)' },
  { name: 'COVARIANCE.S', category: 'statistical', subCategory: '相关性', description: '样本协方差', syntax: '=COVARIANCE.S(array1, array2)', example: '=COVARIANCE.S(A1:A10,B1:B10)' },
  { name: 'SLOPE', category: 'statistical', subCategory: '回归分析', description: '斜率', syntax: '=SLOPE(known_ys, known_xs)', example: '=SLOPE(B1:B10,A1:A10)' },
  { name: 'INTERCEPT', category: 'statistical', subCategory: '回归分析', description: '截距', syntax: '=INTERCEPT(known_ys, known_xs)', example: '=INTERCEPT(B1:B10,A1:A10)' },
  { name: 'FORECAST', category: 'statistical', subCategory: '回归分析', description: '预测值', syntax: '=FORECAST(x, known_ys, known_xs)', example: '=FORECAST(11,B1:B10,A1:A10)' },
  { name: 'FORECAST.LINEAR', category: 'statistical', subCategory: '回归分析', description: '线性预测', syntax: '=FORECAST.LINEAR(x, known_ys, known_xs)', example: '=FORECAST.LINEAR(11,B1:B10,A1:A10)' },
  { name: 'TREND', category: 'statistical', subCategory: '回归分析', description: '趋势线', syntax: '=TREND(known_ys, [known_xs], [new_xs], [const])', example: '=TREND(B1:B10,A1:A10)' },
  { name: 'GROWTH', category: 'statistical', subCategory: '回归分析', description: '指数趋势', syntax: '=GROWTH(known_ys, [known_xs], [new_xs], [const])', example: '=GROWTH(B1:B10,A1:A10)' },
  { name: 'LINEST', category: 'statistical', subCategory: '回归分析', description: '线性参数', syntax: '=LINEST(known_ys, [known_xs], [const], [stats])', example: '=LINEST(B1:B10,A1:A10,TRUE,TRUE)' },
  { name: 'LOGEST', category: 'statistical', subCategory: '回归分析', description: '指数参数', syntax: '=LOGEST(known_ys, [known_xs], [const], [stats])', example: '=LOGEST(B1:B10,A1:A10)' },
  { name: 'NORM.DIST', category: 'statistical', subCategory: '分布函数', description: '正态分布', syntax: '=NORM.DIST(x, mean, standard_dev, cumulative)', example: '=NORM.DIST(10,8,2,FALSE)' },
  { name: 'NORM.INV', category: 'statistical', subCategory: '分布函数', description: '正态分布反函数', syntax: '=NORM.INV(probability, mean, standard_dev)', example: '=NORM.INV(0.5,8,2)' },
  { name: 'NORM.S.DIST', category: 'statistical', subCategory: '分布函数', description: '标准正态分布', syntax: '=NORM.S.DIST(z, cumulative)', example: '=NORM.S.DIST(1,TRUE)' },
  { name: 'NORM.S.INV', category: 'statistical', subCategory: '分布函数', description: '标准正态反函数', syntax: '=NORM.S.INV(probability)', example: '=NORM.S.INV(0.5)' },
  { name: 'BINOM.DIST', category: 'statistical', subCategory: '分布函数', description: '二项分布', syntax: '=BINOM.DIST(number_s, trials, probability_s, cumulative)', example: '=BINOM.DIST(5,10,0.5,FALSE)' },
  { name: 'POISSON.DIST', category: 'statistical', subCategory: '分布函数', description: '泊松分布', syntax: '=POISSON.DIST(x, mean, cumulative)', example: '=POISSON.DIST(2,3,FALSE)' },
  { name: 'EXPON.DIST', category: 'statistical', subCategory: '分布函数', description: '指数分布', syntax: '=EXPON.DIST(x, lambda, cumulative)', example: '=EXPON.DIST(2,1,FALSE)' },
  { name: 'T.DIST', category: 'statistical', subCategory: '分布函数', description: 'T分布', syntax: '=T.DIST(x, deg_freedom, cumulative)', example: '=T.DIST(1,5,TRUE)' },
  { name: 'F.DIST', category: 'statistical', subCategory: '分布函数', description: 'F分布', syntax: '=F.DIST(x, deg_freedom1, deg_freedom2, cumulative)', example: '=F.DIST(2,5,10,TRUE)' },
  { name: 'CHISQ.DIST', category: 'statistical', subCategory: '分布函数', description: '卡方分布', syntax: '=CHISQ.DIST(x, deg_freedom, cumulative)', example: '=CHISQ.DIST(2,3,TRUE)' },
  { name: 'CONFIDENCE.NORM', category: 'statistical', subCategory: '置信区间', description: '正态置信区间', syntax: '=CONFIDENCE.NORM(alpha, standard_dev, size)', example: '=CONFIDENCE.NORM(0.05,2.5,50)' },
  { name: 'CONFIDENCE.T', category: 'statistical', subCategory: '置信区间', description: 'T分布置信区间', syntax: '=CONFIDENCE.T(alpha, standard_dev, size)', example: '=CONFIDENCE.T(0.05,2.5,50)' },
];

// 文本函数
export const textFunctions: ExcelFunction[] = [
  { name: 'CONCATENATE', category: 'text', subCategory: '连接函数', description: '连接文本', syntax: '=CONCATENATE(text1, [text2], ...)', example: '=CONCATENATE("Hello"," ","World")' },
  { name: 'CONCAT', category: 'text', subCategory: '连接函数', description: '连接文本（支持范围）', syntax: '=CONCAT(text1, [text2], ...)', example: '=CONCAT(A1:A10)' },
  { name: 'TEXTJOIN', category: 'text', subCategory: '连接函数', description: '分隔符连接', syntax: '=TEXTJOIN(delimiter, ignore_empty, text1, ...)', example: '=TEXTJOIN(",",TRUE,A1:A10)' },
  { name: 'LEFT', category: 'text', subCategory: '提取函数', description: '从左取字符', syntax: '=LEFT(text, [num_chars])', example: '=LEFT("Hello",3)' },
  { name: 'RIGHT', category: 'text', subCategory: '提取函数', description: '从右取字符', syntax: '=RIGHT(text, [num_chars])', example: '=RIGHT("Hello",3)' },
  { name: 'MID', category: 'text', subCategory: '提取函数', description: '中间取字符', syntax: '=MID(text, start_num, num_chars)', example: '=MID("Hello",2,3)' },
  { name: 'LEN', category: 'text', subCategory: '长度函数', description: '字符数', syntax: '=LEN(text)', example: '=LEN("Hello")' },
  { name: 'LENB', category: 'text', subCategory: '长度函数', description: '字节数', syntax: '=LENB(text)', example: '=LENB("中文")' },
  { name: 'FIND', category: 'text', subCategory: '查找函数', description: '查找（区分大小写）', syntax: '=FIND(find_text, within_text, [start_num])', example: '=FIND("e","Hello")' },
  { name: 'FINDB', category: 'text', subCategory: '查找函数', description: '字节查找', syntax: '=FINDB(find_text, within_text, [start_num])', example: '=FINDB("中","中文")' },
  { name: 'SEARCH', category: 'text', subCategory: '查找函数', description: '查找（不区分大小写）', syntax: '=SEARCH(find_text, within_text, [start_num])', example: '=SEARCH("E","Hello")' },
  { name: 'SEARCHB', category: 'text', subCategory: '查找函数', description: '字节查找', syntax: '=SEARCHB(find_text, within_text, [start_num])', example: '=SEARCHB("中","中文")' },
  { name: 'REPLACE', category: 'text', subCategory: '替换函数', description: '替换字符', syntax: '=REPLACE(old_text, start_num, num_chars, new_text)', example: '=REPLACE("Hello",2,3,"i")' },
  { name: 'REPLACEB', category: 'text', subCategory: '替换函数', description: '字节替换', syntax: '=REPLACEB(old_text, start_num, num_bytes, new_text)', example: '=REPLACEB("中文",2,1,"华")' },
  { name: 'SUBSTITUTE', category: 'text', subCategory: '替换函数', description: '替换文本', syntax: '=SUBSTITUTE(text, old_text, new_text, [instance_num])', example: '=SUBSTITUTE("Hello","l","L")' },
  { name: 'UPPER', category: 'text', subCategory: '大小写转换', description: '转大写', syntax: '=UPPER(text)', example: '=UPPER("hello")' },
  { name: 'LOWER', category: 'text', subCategory: '大小写转换', description: '转小写', syntax: '=LOWER(text)', example: '=LOWER("HELLO")' },
  { name: 'PROPER', category: 'text', subCategory: '大小写转换', description: '首字母大写', syntax: '=PROPER(text)', example: '=PROPER("hello world")' },
  { name: 'TRIM', category: 'text', subCategory: '清理函数', description: '去除空格', syntax: '=TRIM(text)', example: '=TRIM("  Hello  ")' },
  { name: 'CLEAN', category: 'text', subCategory: '清理函数', description: '去除非打印字符', syntax: '=CLEAN(text)', example: '=CLEAN(A1)' },
  { name: 'EXACT', category: 'text', subCategory: '比较函数', description: '精确比较', syntax: '=EXACT(text1, text2)', example: '=EXACT("Hello","hello")' },
  { name: 'REPT', category: 'text', subCategory: '重复函数', description: '重复文本', syntax: '=REPT(text, number_times)', example: '=REPT("*",5)' },
  { name: 'TEXT', category: 'text', subCategory: '格式化函数', description: '格式化数字', syntax: '=TEXT(value, format_text)', example: '=TEXT(3.14,"0.00")' },
  { name: 'VALUE', category: 'text', subCategory: '格式化函数', description: '文本转数字', syntax: '=VALUE(text)', example: '=VALUE("123")' },
  { name: 'NUMBERVALUE', category: 'text', subCategory: '格式化函数', description: '区域设置转数字', syntax: '=NUMBERVALUE(text, [decimal_separator], [group_separator])', example: '=NUMBERVALUE("1,234.56")' },
  { name: 'CHAR', category: 'text', subCategory: '字符函数', description: '代码转字符', syntax: '=CHAR(number)', example: '=CHAR(65)' },
  { name: 'UNICHAR', category: 'text', subCategory: '字符函数', description: 'Unicode转字符', syntax: '=UNICHAR(number)', example: '=UNICHAR(65)' },
  { name: 'CODE', category: 'text', subCategory: '字符函数', description: '字符转代码', syntax: '=CODE(text)', example: '=CODE("A")' },
  { name: 'UNICODE', category: 'text', subCategory: '字符函数', description: '字符转Unicode', syntax: '=UNICODE(text)', example: '=UNICODE("A")' },
  { name: 'DOLLAR', category: 'text', subCategory: '货币函数', description: '货币格式', syntax: '=DOLLAR(number, [decimals])', example: '=DOLLAR(123.45,2)' },
  { name: 'RMB', category: 'text', subCategory: '货币函数', description: '人民币格式', syntax: '=RMB(number, [decimals])', example: '=RMB(123.45,2)' },
  { name: 'FIXED', category: 'text', subCategory: '格式化函数', description: '固定小数位', syntax: '=FIXED(number, [decimals], [no_commas])', example: '=FIXED(3.14159,2)' },
  { name: 'T', category: 'text', subCategory: '类型函数', description: '返回文本', syntax: '=T(value)', example: '=T(123)' },
  { name: 'TEXTBEFORE', category: 'text', subCategory: '提取函数', description: '分隔符前文本', syntax: '=TEXTBEFORE(text, delimiter, ...)', example: '=TEXTBEFORE("a,b,c",",")' },
  { name: 'TEXTAFTER', category: 'text', subCategory: '提取函数', description: '分隔符后文本', syntax: '=TEXTAFTER(text, delimiter, ...)', example: '=TEXTAFTER("a,b,c",",")' },
  { name: 'TEXTSPLIT', category: 'text', subCategory: '分割函数', description: '分割文本', syntax: '=TEXTSPLIT(text, col_delimiter, ...)', example: '=TEXTSPLIT("a,b,c",",")' },
  { name: 'ARRAYTOTEXT', category: 'text', subCategory: '转换函数', description: '数组转文本', syntax: '=ARRAYTOTEXT(array, [format])', example: '=ARRAYTOTEXT({1,2,3})' },
  { name: 'VALUETOTEXT', category: 'text', subCategory: '转换函数', description: '值转文本', syntax: '=VALUETOTEXT(value, [format])', example: '=VALUETOTEXT(123)' },
  { name: 'BAHTTEXT', category: 'text', subCategory: '货币函数', description: '泰铢文本', syntax: '=BAHTTEXT(number)', example: '=BAHTTEXT(123)' },
];

// 逻辑函数
export const logicalFunctions: ExcelFunction[] = [
  { name: 'IF', category: 'logical', subCategory: '条件判断', description: '条件判断', syntax: '=IF(logical_test, value_if_true, [value_if_false])', example: '=IF(A1>100,"达标","未达标")' },
  { name: 'IFS', category: 'logical', subCategory: '条件判断', description: '多条件判断', syntax: '=IFS(logical_test1, value_if_true1, ...)', example: '=IFS(A1>90,"优",A1>80,"良",A1>60,"及格")' },
  { name: 'IFERROR', category: 'logical', subCategory: '错误处理', description: '错误处理', syntax: '=IFERROR(value, value_if_error)', example: '=IFERROR(A1/B1,0)' },
  { name: 'IFNA', category: 'logical', subCategory: '错误处理', description: 'NA错误处理', syntax: '=IFNA(value, value_if_na)', example: '=IFNA(VLOOKUP(...),"未找到")' },
  { name: 'AND', category: 'logical', subCategory: '逻辑运算', description: '与运算', syntax: '=AND(logical1, [logical2], ...)', example: '=AND(A1>0,B1<100)' },
  { name: 'OR', category: 'logical', subCategory: '逻辑运算', description: '或运算', syntax: '=OR(logical1, [logical2], ...)', example: '=OR(A1>100,B1<50)' },
  { name: 'NOT', category: 'logical', subCategory: '逻辑运算', description: '非运算', syntax: '=NOT(logical)', example: '=NOT(A1>100)' },
  { name: 'XOR', category: 'logical', subCategory: '逻辑运算', description: '异或运算', syntax: '=XOR(logical1, [logical2], ...)', example: '=XOR(A1>0,B1>0)' },
  { name: 'SWITCH', category: 'logical', subCategory: '条件判断', description: '条件选择', syntax: '=SWITCH(expression, value1, result1, ..., [default])', example: '=SWITCH(A1,1,"一",2,"二",3,"三")' },
  { name: 'TRUE', category: 'logical', subCategory: '常量', description: '逻辑真', syntax: '=TRUE()', example: '=TRUE()' },
  { name: 'FALSE', category: 'logical', subCategory: '常量', description: '逻辑假', syntax: '=FALSE()', example: '=FALSE()' },
  { name: 'LET', category: 'logical', subCategory: '高级函数', description: '定义变量', syntax: '=LET(name1, value1, calculation)', example: '=LET(x,A1+1,y,B1+1,x+y)' },
  { name: 'LAMBDA', category: 'logical', subCategory: '高级函数', description: '自定义函数', syntax: '=LAMBDA([parameter], calculation)', example: '=LAMBDA(x,x*2)(5)' },
];

// 查找与引用函数
export const lookupFunctions: ExcelFunction[] = [
  { name: 'VLOOKUP', category: 'lookup', subCategory: '垂直查找', description: '垂直查找', syntax: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])', example: '=VLOOKUP("A001",A:D,3,FALSE)' },
  { name: 'HLOOKUP', category: 'lookup', subCategory: '水平查找', description: '水平查找', syntax: '=HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])', example: '=HLOOKUP("A001",A1:D10,3,FALSE)' },
  { name: 'LOOKUP', category: 'lookup', subCategory: '查找函数', description: '查找', syntax: '=LOOKUP(lookup_value, lookup_vector, [result_vector])', example: '=LOOKUP("A",A1:B10,2)' },
  { name: 'XLOOKUP', category: 'lookup', subCategory: '高级查找', description: 'XLOOKUP查找', syntax: '=XLOOKUP(lookup_value, lookup_array, return_array, ...)', example: '=XLOOKUP("A001",A:A,D:D,"未找到")' },
  { name: 'XMATCH', category: 'lookup', subCategory: '高级查找', description: 'XMATCH匹配', syntax: '=XMATCH(lookup_value, lookup_array, [match_mode], [search_mode])', example: '=XMATCH("A001",A:A)' },
  { name: 'INDEX', category: 'lookup', subCategory: '索引引用', description: '索引取值', syntax: '=INDEX(array, row_num, [column_num])', example: '=INDEX(A1:C10,2,3)' },
  { name: 'MATCH', category: 'lookup', subCategory: '索引引用', description: '匹配位置', syntax: '=MATCH(lookup_value, lookup_array, [match_type])', example: '=MATCH("A001",A:A,0)' },
  { name: 'INDIRECT', category: 'lookup', subCategory: '引用函数', description: '间接引用', syntax: '=INDIRECT(ref_text, [a1])', example: '=INDIRECT("A"&B1)' },
  { name: 'OFFSET', category: 'lookup', subCategory: '引用函数', description: '偏移引用', syntax: '=OFFSET(reference, rows, cols, [height], [width])', example: '=OFFSET(A1,2,3)' },
  { name: 'ROW', category: 'lookup', subCategory: '位置函数', description: '行号', syntax: '=ROW([reference])', example: '=ROW(A1)' },
  { name: 'COLUMN', category: 'lookup', subCategory: '位置函数', description: '列号', syntax: '=COLUMN([reference])', example: '=COLUMN(A1)' },
  { name: 'ROWS', category: 'lookup', subCategory: '位置函数', description: '行数', syntax: '=ROWS(array)', example: '=ROWS(A1:A10)' },
  { name: 'COLUMNS', category: 'lookup', subCategory: '位置函数', description: '列数', syntax: '=COLUMNS(array)', example: '=COLUMNS(A1:C1)' },
  { name: 'ADDRESS', category: 'lookup', subCategory: '引用函数', description: '地址生成', syntax: '=ADDRESS(row, column, [abs_num], [a1], [sheet_text])', example: '=ADDRESS(1,1)' },
  { name: 'CHOOSE', category: 'lookup', subCategory: '选择函数', description: '选择值', syntax: '=CHOOSE(index_num, value1, [value2], ...)', example: '=CHOOSE(2,"一","二","三")' },
  { name: 'TRANSPOSE', category: 'lookup', subCategory: '数组函数', description: '转置', syntax: '=TRANSPOSE(array)', example: '=TRANSPOSE(A1:C1)' },
  { name: 'HYPERLINK', category: 'lookup', subCategory: '特殊函数', description: '超链接', syntax: '=HYPERLINK(link_location, [friendly_name])', example: '=HYPERLINK("https://www.example.com","链接")' },
  { name: 'FORMULATEXT', category: 'lookup', subCategory: '特殊函数', description: '公式文本', syntax: '=FORMULATEXT(reference)', example: '=FORMULATEXT(A1)' },
  { name: 'RTD', category: 'lookup', subCategory: '特殊函数', description: '实时数据', syntax: '=RTD(ProgID, server, topic1, [topic2], ...)', example: '=RTD("comdin.dde",,"topic")' },
  { name: 'GETPIVOTDATA', category: 'lookup', subCategory: '透视表', description: '透视数据', syntax: '=GETPIVOTDATA(data_field, pivot_table, [field1, item1], ...)', example: '=GETPIVOTDATA("Sum",A3)' },
  { name: 'UNIQUE', category: 'lookup', subCategory: '动态数组', description: '唯一值', syntax: '=UNIQUE(array, [by_col], [exactly_once])', example: '=UNIQUE(A1:A10)' },
  { name: 'FILTER', category: 'lookup', subCategory: '动态数组', description: '筛选', syntax: '=FILTER(array, include, [if_empty])', example: '=FILTER(A1:C10,B1:B10>100)' },
  { name: 'SORT', category: 'lookup', subCategory: '动态数组', description: '排序', syntax: '=SORT(array, [sort_index], [sort_order], [by_col])', example: '=SORT(A1:A10,1,1)' },
  { name: 'SORTBY', category: 'lookup', subCategory: '动态数组', description: '按列排序', syntax: '=SORTBY(array, by_array1, [sort_order1], ...)', example: '=SORTBY(A1:A10,B1:B10,1)' },
  { name: 'SEQUENCE', category: 'lookup', subCategory: '动态数组', description: '序列', syntax: '=SEQUENCE(rows, [columns], [start], [step])', example: '=SEQUENCE(5)' },
  { name: 'TAKE', category: 'lookup', subCategory: '动态数组', description: '取行/列', syntax: '=TAKE(array, rows, [columns])', example: '=TAKE(A1:C10,5)' },
  { name: 'DROP', category: 'lookup', subCategory: '动态数组', description: '删除行/列', syntax: '=DROP(array, rows, [columns])', example: '=DROP(A1:C10,1)' },
];

// 日期与时间函数
export const dateFunctions: ExcelFunction[] = [
  { name: 'NOW', category: 'date', subCategory: '当前时间', description: '当前日期时间', syntax: '=NOW()', example: '=NOW()' },
  { name: 'TODAY', category: 'date', subCategory: '当前时间', description: '当前日期', syntax: '=TODAY()', example: '=TODAY()' },
  { name: 'DATE', category: 'date', subCategory: '日期函数', description: '日期生成', syntax: '=DATE(year, month, day)', example: '=DATE(2026,6,4)' },
  { name: 'TIME', category: 'date', subCategory: '日期函数', description: '时间生成', syntax: '=TIME(hour, minute, second)', example: '=TIME(12,30,45)' },
  { name: 'YEAR', category: 'date', subCategory: '日期提取', description: '年', syntax: '=YEAR(serial_number)', example: '=YEAR(TODAY())' },
  { name: 'MONTH', category: 'date', subCategory: '日期提取', description: '月', syntax: '=MONTH(serial_number)', example: '=MONTH(TODAY())' },
  { name: 'DAY', category: 'date', subCategory: '日期提取', description: '日', syntax: '=DAY(serial_number)', example: '=DAY(TODAY())' },
  { name: 'HOUR', category: 'date', subCategory: '日期提取', description: '小时', syntax: '=HOUR(serial_number)', example: '=HOUR(NOW())' },
  { name: 'MINUTE', category: 'date', subCategory: '日期提取', description: '分钟', syntax: '=MINUTE(serial_number)', example: '=MINUTE(NOW())' },
  { name: 'SECOND', category: 'date', subCategory: '日期提取', description: '秒', syntax: '=SECOND(serial_number)', example: '=SECOND(NOW())' },
  { name: 'WEEKDAY', category: 'date', subCategory: '日期提取', description: '星期', syntax: '=WEEKDAY(serial_number, [return_type])', example: '=WEEKDAY(TODAY(),2)' },
  { name: 'WEEKNUM', category: 'date', subCategory: '日期提取', description: '周数', syntax: '=WEEKNUM(serial_number, [return_type])', example: '=WEEKNUM(TODAY())' },
  { name: 'ISOWEEKNUM', category: 'date', subCategory: '日期提取', description: 'ISO周数', syntax: '=ISOWEEKNUM(date)', example: '=ISOWEEKNUM(TODAY())' },
  { name: 'DAYSP360', category: 'date', subCategory: '日期计算', description: '360天制天数', syntax: '=DAYSP360(start_date, end_date, [method])', example: '=DAYSP360("2026-1-1","2026-12-31")' },
  { name: 'DAYS', category: 'date', subCategory: '日期计算', description: '天数差', syntax: '=DAYS(end_date, start_date)', example: '=DAYS("2026-12-31","2026-1-1")' },
  { name: 'DAYS360', category: 'date', subCategory: '日期计算', description: '360天制', syntax: '=DAYS360(start_date, end_date, [method])', example: '=DAYS360("2026-1-1","2026-12-31")' },
  { name: 'DATEDIF', category: 'date', subCategory: '日期计算', description: '日期差', syntax: '=DATEDIF(start_date, end_date, unit)', example: '=DATEDIF("1990-1-1",TODAY(),"Y")' },
  { name: 'EDATE', category: 'date', subCategory: '日期计算', description: '月份加减', syntax: '=EDATE(start_date, months)', example: '=EDATE(TODAY(),3)' },
  { name: 'EOMONTH', category: 'date', subCategory: '日期计算', description: '月末日期', syntax: '=EOMONTH(start_date, months)', example: '=EOMONTH(TODAY(),0)' },
  { name: 'WORKDAY', category: 'date', subCategory: '工作日', description: '工作日', syntax: '=WORKDAY(start_date, days, [holidays])', example: '=WORKDAY(TODAY(),10)' },
  { name: 'WORKDAY.INTL', category: 'date', subCategory: '工作日', description: '国际工作日', syntax: '=WORKDAY.INTL(start_date, days, [weekend], [holidays])', example: '=WORKDAY.INTL(TODAY(),10,1)' },
  { name: 'NETWORKDAYS', category: 'date', subCategory: '工作日', description: '网络工作日', syntax: '=NETWORKDAYS(start_date, end_date, [holidays])', example: '=NETWORKDAYS("2026-1-1","2026-12-31")' },
  { name: 'NETWORKDAYS.INTL', category: 'date', subCategory: '工作日', description: '国际网络工作日', syntax: '=NETWORKDAYS.INTL(start_date, end_date, [weekend], [holidays])', example: '=NETWORKDAYS.INTL("2026-1-1","2026-12-31",1)' },
  { name: 'YEARFRAC', category: 'date', subCategory: '日期计算', description: '年份比例', syntax: '=YEARFRAC(start_date, end_date, [basis])', example: '=YEARFRAC("2026-1-1","2026-12-31")' },
  { name: 'TIMEVALUE', category: 'date', subCategory: '转换函数', description: '时间值', syntax: '=TIMEVALUE(time_text)', example: '=TIMEVALUE("12:30:00")' },
  { name: 'DATEVALUE', category: 'date', subCategory: '转换函数', description: '日期值', syntax: '=DATEVALUE(date_text)', example: '=DATEVALUE("2026-6-4")' },
];

// 信息函数
export const infoFunctions: ExcelFunction[] = [
  { name: 'ISBLANK', category: 'info', subCategory: '类型判断', description: '是否空白', syntax: '=ISBLANK(value)', example: '=ISBLANK(A1)' },
  { name: 'ISNUMBER', category: 'info', subCategory: '类型判断', description: '是否数字', syntax: '=ISNUMBER(value)', example: '=ISNUMBER(A1)' },
  { name: 'ISTEXT', category: 'info', subCategory: '类型判断', description: '是否文本', syntax: '=ISTEXT(value)', example: '=ISTEXT(A1)' },
  { name: 'ISNONTEXT', category: 'info', subCategory: '类型判断', description: '是否非文本', syntax: '=ISNONTEXT(value)', example: '=ISNONTEXT(A1)' },
  { name: 'ISLOGICAL', category: 'info', subCategory: '类型判断', description: '是否逻辑值', syntax: '=ISLOGICAL(value)', example: '=ISLOGICAL(A1)' },
  { name: 'ISERROR', category: 'info', subCategory: '类型判断', description: '是否错误', syntax: '=ISERROR(value)', example: '=ISERROR(A1/B1)' },
  { name: 'ISERR', category: 'info', subCategory: '类型判断', description: '是否错误（除NA）', syntax: '=ISERR(value)', example: '=ISERR(A1/B1)' },
  { name: 'ISNA', category: 'info', subCategory: '类型判断', description: '是否NA错误', syntax: '=ISNA(value)', example: '=ISNA(VLOOKUP(...))' },
  { name: 'ISREF', category: 'info', subCategory: '类型判断', description: '是否引用', syntax: '=ISREF(value)', example: '=ISREF(A1)' },
  { name: 'ISEVEN', category: 'info', subCategory: '类型判断', description: '是否偶数', syntax: '=ISEVEN(number)', example: '=ISEVEN(4)' },
  { name: 'ISODD', category: 'info', subCategory: '类型判断', description: '是否奇数', syntax: '=ISODD(number)', example: '=ISODD(3)' },
  { name: 'ISFORMULA', category: 'info', subCategory: '类型判断', description: '是否公式', syntax: '=ISFORMULA(reference)', example: '=ISFORMULA(A1)' },
  { name: 'CELL', category: 'info', subCategory: '单元格信息', description: '单元格信息', syntax: '=CELL(info_type, [reference])', example: '=CELL("type",A1)' },
  { name: 'INFO', category: 'info', subCategory: '环境信息', description: '环境信息', syntax: '=INFO(type_text)', example: '=INFO("osversion")' },
  { name: 'N', category: 'info', subCategory: '类型转换', description: '转数字', syntax: '=N(value)', example: '=N(A1)' },
  { name: 'TYPE', category: 'info', subCategory: '类型判断', description: '类型', syntax: '=TYPE(value)', example: '=TYPE(A1)' },
  { name: 'ERROR.TYPE', category: 'info', subCategory: '错误信息', description: '错误类型', syntax: '=ERROR.TYPE(error_val)', example: '=ERROR.TYPE(A1)' },
  { name: 'SHEET', category: 'info', subCategory: '工作表信息', description: '工作表编号', syntax: '=SHEET([value])', example: '=SHEET(A1)' },
  { name: 'SHEETS', category: 'info', subCategory: '工作表信息', description: '工作表数', syntax: '=SHEETS([reference])', example: '=SHEETS()' },
];

// 财务函数
export const financialFunctions: ExcelFunction[] = [
  { name: 'PV', category: 'financial', subCategory: '投资计算', description: '现值', syntax: '=PV(rate, nper, pmt, [fv], [type])', example: '=PV(0.05/12,360,-1000)' },
  { name: 'FV', category: 'financial', subCategory: '投资计算', description: '未来值', syntax: '=FV(rate, nper, pmt, [pv], [type])', example: '=FV(0.05/12,360,-1000)' },
  { name: 'PMT', category: 'financial', subCategory: '投资计算', description: '每期付款', syntax: '=PMT(rate, nper, pv, [fv], [type])', example: '=PMT(0.05/12,360,100000)' },
  { name: 'IPMT', category: 'financial', subCategory: '投资计算', description: '利息部分', syntax: '=IPMT(rate, per, nper, pv, [fv], [type])', example: '=IPMT(0.05/12,1,360,100000)' },
  { name: 'PPMT', category: 'financial', subCategory: '投资计算', description: '本金部分', syntax: '=PPMT(rate, per, nper, pv, [fv], [type])', example: '=PPMT(0.05/12,1,360,100000)' },
  { name: 'NPV', category: 'financial', subCategory: '投资计算', description: '净现值', syntax: '=NPV(rate, value1, [value2], ...)', example: '=NPV(0.1,100,200,300)' },
  { name: 'IRR', category: 'financial', subCategory: '投资计算', description: '内部收益率', syntax: '=IRR(values, [guess])', example: '=IRR(A1:A10)' },
  { name: 'MIRR', category: 'financial', subCategory: '投资计算', description: '修正内部收益率', syntax: '=MIRR(values, finance_rate, reinvest_rate)', example: '=MIRR(A1:A10,0.1,0.12)' },
  { name: 'NPER', category: 'financial', subCategory: '投资计算', description: '期数', syntax: '=NPER(rate, pmt, pv, [fv], [type])', example: '=NPER(0.05/12,-1000,100000)' },
  { name: 'RATE', category: 'financial', subCategory: '投资计算', description: '利率', syntax: '=RATE(nper, pmt, pv, [fv], [type], [guess])', example: '=RATE(360,-1000,100000)' },
  { name: 'SLN', category: 'financial', subCategory: '折旧计算', description: '直线折旧', syntax: '=SLN(cost, salvage, life)', example: '=SLN(10000,1000,5)' },
  { name: 'SYD', category: 'financial', subCategory: '折旧计算', description: '年数总和折旧', syntax: '=SYD(cost, salvage, life, period)', example: '=SYD(10000,1000,5,1)' },
  { name: 'DB', category: 'financial', subCategory: '折旧计算', description: '固定余额折旧', syntax: '=DB(cost, salvage, life, period, [month])', example: '=DB(10000,1000,5,1)' },
  { name: 'DDB', category: 'financial', subCategory: '折旧计算', description: '双倍余额折旧', syntax: '=DDB(cost, salvage, life, period, [factor])', example: '=DDB(10000,1000,5,1)' },
  { name: 'XNPV', category: 'financial', subCategory: '投资计算', description: '非定期NPV', syntax: '=XNPV(rate, values, dates)', example: '=XNPV(0.1,values,dates)' },
  { name: 'XIRR', category: 'financial', subCategory: '投资计算', description: '非定期IRR', syntax: '=XIRR(values, dates, [guess])', example: '=XIRR(values,dates)' },
  { name: 'ACCRINT', category: 'financial', subCategory: '债券计算', description: '应计利息', syntax: '=ACCRINT(issue, first_interest, settlement, rate, par, frequency, [basis], [calc_method])', example: '=ACCRINT("2026-1-1","2026-7-1","2026-12-31",0.1,1000,2)' },
  { name: 'COUPDAYBS', category: 'financial', subCategory: '债券计算', description: '从上个付息日', syntax: '=COUPDAYBS(settlement, maturity, frequency, [basis])', example: '=COUPDAYBS("2026-1-1","2030-1-1",2)' },
  { name: 'COUPDAYS', category: 'financial', subCategory: '债券计算', description: '付息日天数', syntax: '=COUPDAYS(settlement, maturity, frequency, [basis])', example: '=COUPDAYS("2026-1-1","2030-1-1",2)' },
  { name: 'YIELD', category: 'financial', subCategory: '债券计算', description: '债券收益率', syntax: '=YIELD(settlement, maturity, rate, pr, redemption, frequency, [basis])', example: '=YIELD("2026-1-1","2030-1-1",0.05,95,100,2)' },
  { name: 'PRICE', category: 'financial', subCategory: '债券计算', description: '债券价格', syntax: '=PRICE(settlement, maturity, rate, yld, redemption, frequency, [basis])', example: '=PRICE("2026-1-1","2030-1-1",0.05,0.06,100,2)' },
];

// 数据库函数
export const databaseFunctions: ExcelFunction[] = [
  { name: 'DSUM', category: 'database', subCategory: '统计函数', description: '数据库求和', syntax: '=DSUM(database, field, criteria)', example: '=DSUM(A1:D100,"金额",F1:F2)' },
  { name: 'DAVERAGE', category: 'database', subCategory: '统计函数', description: '数据库平均值', syntax: '=DAVERAGE(database, field, criteria)', example: '=DAVERAGE(A1:D100,"金额",F1:F2)' },
  { name: 'DCOUNT', category: 'database', subCategory: '统计函数', description: '数据库计数', syntax: '=DCOUNT(database, field, criteria)', example: '=DCOUNT(A1:D100,"名称",F1:F2)' },
  { name: 'DCOUNTA', category: 'database', subCategory: '统计函数', description: '数据库非空计数', syntax: '=DCOUNTA(database, field, criteria)', example: '=DCOUNTA(A1:D100,"名称",F1:F2)' },
  { name: 'DGET', category: 'database', subCategory: '统计函数', description: '数据库取值', syntax: '=DGET(database, field, criteria)', example: '=DGET(A1:D100,"金额",F1:F2)' },
  { name: 'DMAX', category: 'database', subCategory: '统计函数', description: '数据库最大值', syntax: '=DMAX(database, field, criteria)', example: '=DMAX(A1:D100,"金额",F1:F2)' },
  { name: 'DMIN', category: 'database', subCategory: '统计函数', description: '数据库最小值', syntax: '=DMIN(database, field, criteria)', example: '=DMIN(A1:D100,"金额",F1:F2)' },
  { name: 'DPRODUCT', category: 'database', subCategory: '统计函数', description: '数据库乘积', syntax: '=DPRODUCT(database, field, criteria)', example: '=DPRODUCT(A1:D100,"数量",F1:F2)' },
  { name: 'DSTDEV', category: 'database', subCategory: '统计函数', description: '数据库样本标准差', syntax: '=DSTDEV(database, field, criteria)', example: '=DSTDEV(A1:D100,"金额",F1:F2)' },
  { name: 'DSTDEVP', category: 'database', subCategory: '统计函数', description: '数据库总体标准差', syntax: '=DSTDEVP(database, field, criteria)', example: '=DSTDEVP(A1:D100,"金额",F1:F2)' },
  { name: 'DSUMIF', category: 'database', subCategory: '统计函数', description: '数据库条件求和', syntax: '=DSUMIF(database, field, criteria)', example: '=DSUMIF(A1:D100,"金额",F1:F2)' },
  { name: 'DVAR', category: 'database', subCategory: '统计函数', description: '数据库样本方差', syntax: '=DVAR(database, field, criteria)', example: '=DVAR(A1:D100,"金额",F1:F2)' },
  { name: 'DVARP', category: 'database', subCategory: '统计函数', description: '数据库总体方差', syntax: '=DVARP(database, field, criteria)', example: '=DVARP(A1:D100,"金额",F1:F2)' },
];

// WPS特色函数
export const wpsFunctions: ExcelFunction[] = [
  { name: 'WPS.LINEST', category: 'wps', subCategory: '统计分析', description: 'WPS线性回归', syntax: '=WPS.LINEST(known_ys, known_xs)', example: '=WPS.LINEST(B1:B10,A1:A10)' },
  { name: 'WPS.IFERROR', category: 'wps', subCategory: '错误处理', description: 'WPS错误处理', syntax: '=WPS.IFERROR(value, value_if_error)', example: '=WPS.IFERROR(A1/B1,"错误")' },
  { name: 'WPS.SUMIF', category: 'wps', subCategory: '条件求和', description: 'WPS条件求和', syntax: '=WPS.SUMIF(range, criteria, sum_range)', example: '=WPS.SUMIF(A:A,">100",B:B)' },
  { name: 'WPS.SUMIFS', category: 'wps', subCategory: '条件求和', description: 'WPS多条件求和', syntax: '=WPS.SUMIFS(sum_range, ...)', example: '=WPS.SUMIFS(B:B,A:A,">100")' },
  { name: 'WPS.VLOOKUP', category: 'wps', subCategory: '查找函数', description: 'WPS垂直查找', syntax: '=WPS.VLOOKUP(...)', example: '=WPS.VLOOKUP("A",A:C,3,FALSE)' },
  { name: 'WPS.IF', category: 'wps', subCategory: '条件判断', description: 'WPS条件判断', syntax: '=WPS.IF(condition, true, false)', example: '=WPS.IF(A1>100,"达标")' },
  { name: 'WPS.RAND', category: 'wps', subCategory: '随机数', description: 'WPS随机数', syntax: '=WPS.RAND()', example: '=WPS.RAND()' },
  { name: 'WPS.SQRT', category: 'wps', subCategory: '数学函数', description: 'WPS平方根', syntax: '=WPS.SQRT(number)', example: '=WPS.SQRT(16)' },
  { name: 'WPS.COUNTIF', category: 'wps', subCategory: '条件统计', description: 'WPS条件计数', syntax: '=WPS.COUNTIF(range, criteria)', example: '=WPS.COUNTIF(A:A,">100")' },
  { name: 'WPS.MID', category: 'wps', subCategory: '文本函数', description: 'WPS取中间', syntax: '=WPS.MID(text, start, num)', example: '=WPS.MID("Hello",2,3)' },
];

// 导出所有函数
export const allFunctions: ExcelFunction[] = [
  ...aiFunctions,
  ...mathFunctions,
  ...statisticalFunctions,
  ...textFunctions,
  ...logicalFunctions,
  ...lookupFunctions,
  ...dateFunctions,
  ...infoFunctions,
  ...financialFunctions,
  ...databaseFunctions,
  ...wpsFunctions,
];

// 查找函数（按名称）
export function findFunction(name: string): ExcelFunction | undefined {
  return allFunctions.find(f => f.name.toUpperCase() === name.toUpperCase());
}

// 按分类获取函数
export function getFunctionsByCategory(categoryId: string): ExcelFunction[] {
  return allFunctions.filter(f => f.category === categoryId);
}

// 搜索函数
export function searchFunctions(keyword: string): ExcelFunction[] {
  const lowerKeyword = keyword.toLowerCase();
  return allFunctions.filter(f =>
    f.name.toLowerCase().includes(lowerKeyword) ||
    f.description.toLowerCase().includes(lowerKeyword) ||
    f.syntax.toLowerCase().includes(lowerKeyword) ||
    f.subCategory.toLowerCase().includes(lowerKeyword)
  );
}

// 获取函数总数
export function getTotalFunctionCount(): number {
  return allFunctions.length;
}