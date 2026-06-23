/**
 * 模板路由 - 预设字段模板
 */
import { Router } from 'express';

const router = Router();

const TEMPLATES = [
  {
    id: 'training', icon: '📚', name: '培训报名', desc: '课程培训、讲座活动',
    category: '信息登记',
    fields: [
      { type:'name', label:'姓名', required:true },
      { type:'phone', label:'手机号码', required:true },
      { type:'text', label:'单位/公司', required:false },
      { type:'select', label:'报名场次', options:['上午场','下午场','全天'], required:true },
    ],
  },
  {
    id: 'party', icon: '🎉', name: '聚会活动', desc: '同学聚会、团建活动',
    category: '活动促销',
    fields: [
      { type:'name', label:'姓名', required:true },
      { type:'phone', label:'手机号码', required:true },
      { type:'radio', label:'是否携带家属', options:['是','否'], required:true },
      { type:'textarea', label:'特殊需求', required:false },
    ],
  },
  {
    id: 'signup', icon: '📝', name: '通用登记', desc: '信息收集、意向登记',
    category: '信息登记',
    fields: [
      { type:'name', label:'姓名', required:true },
      { type:'phone', label:'手机号码', required:true },
      { type:'email', label:'电子邮箱', required:false },
      { type:'textarea', label:'备注', required:false },
    ],
  },
  {
    id: 'competition', icon: '🏆', name: '比赛报名', desc: '赛事、竞赛活动',
    category: '运动健身',
    fields: [
      { type:'name', label:'姓名', required:true },
      { type:'phone', label:'手机号码', required:true },
      { type:'idcard', label:'身份证号', required:true },
      { type:'select', label:'参赛组别', options:['青少年组','成人组','专业组'], required:true },
      { type:'image', label:'作品上传', maxImages:3, required:false },
    ],
  },
  {
    id: 'school', icon: '🏫', name: '招生报名', desc: '学校招生、课程报名',
    category: '招生报名',
    fields: [
      { type:'name', label:'学生姓名', required:true },
      { type:'text', label:'家长姓名', required:true },
      { type:'phone', label:'联系电话', required:true },
      { type:'number', label:'年龄', required:false },
      { type:'select', label:'意向课程', options:['数学','英语','语文','物理'], required:true },
    ],
  },
  {
    id: 'reserve', icon: '📅', name: '场馆预约', desc: '场地预约、挂号预约',
    category: '场馆预约',
    fields: [
      { type:'name', label:'预约人', required:true },
      { type:'phone', label:'手机号码', required:true },
      { type:'date', label:'预约日期', required:true },
      { type:'time', label:'预约时间', required:true },
      { type:'text', label:'预约场地', required:false },
    ],
  },
  {
    id: 'survey', icon: '📊', name: '问卷调查', desc: '满意度调查、投票',
    category: '问卷调查',
    fields: [
      { type:'name', label:'姓名', required:false },
      { type:'radio', label:'总体满意度', options:['非常满意','满意','一般','不满意'], required:true },
      { type:'checkbox', label:'改进建议（多选）', options:['服务质量','产品体验','响应速度','价格'], required:false },
      { type:'textarea', label:'详细意见', required:false },
    ],
  },
  {
    id: 'blank', icon: '📄', name: '空白表单', desc: '从零开始自定义',
    category: '办公效率',
    fields: [],
  },
];

// GET /api/templates
router.get('/', (req, res) => {
  const { category } = req.query;
  let list = TEMPLATES;
  if (category) {
    list = TEMPLATES.filter(t => t.category === category);
  }
  res.json({ templates: list, categories: [...new Set(TEMPLATES.map(t => t.category))] });
});

// GET /api/templates/:id
router.get('/:id', (req, res) => {
  const tpl = TEMPLATES.find(t => t.id === req.params.id);
  if (!tpl) return res.status(404).json({ error: '模板不存在' });
  res.json({ template: tpl });
});

export default router;
