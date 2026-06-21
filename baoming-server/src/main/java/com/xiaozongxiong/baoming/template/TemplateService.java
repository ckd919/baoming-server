package com.xiaozongxiong.baoming.template;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TemplateService {

    private static final List<Map<String, Object>> TEMPLATES = List.of(
            createTemplate("training", "📚", "培训报名", List.of(
                    createField("name", "姓名", "text"),
                    createField("phone", "手机号", "text"),
                    createField("company", "单位/公司", "text"),
                    createField("session", "参加场次", "select")
            )),
            createTemplate("party", "🎉", "聚会活动", List.of(
                    createField("name", "姓名", "text"),
                    createField("phone", "手机号", "text"),
                    createField("plusOne", "是否携带家属", "radio"),
                    createField("diet", "饮食禁忌", "textarea")
            )),
            createTemplate("signup", "📝", "通用登记", List.of(
                    createField("name", "姓名", "text"),
                    createField("phone", "手机号", "text"),
                    createField("email", "邮箱", "text"),
                    createField("remark", "备注", "textarea")
            )),
            createTemplate("competition", "🏆", "比赛报名", List.of(
                    createField("name", "姓名", "text"),
                    createField("phone", "手机号", "text"),
                    createField("idcard", "身份证号", "text"),
                    createField("group", "参赛组别", "select"),
                    createField("photo", "照片上传", "image")
            )),
            createTemplate("blank", "📄", "空白表单", Collections.emptyList())
    );

    public List<Map<String, Object>> listTemplates(String category) {
        if (category == null || category.isEmpty()) return TEMPLATES;
        return TEMPLATES.stream().filter(t -> category.equals(t.get("id"))).toList();
    }

    public Map<String, Object> getTemplate(String id) {
        return TEMPLATES.stream().filter(t -> id.equals(t.get("id"))).findFirst()
                .orElseThrow(() -> new NoSuchElementException("模板不存在"));
    }

    private static Map<String, Object> createTemplate(String id, String icon, String name, List<Map<String, Object>> fields) {
        Map<String, Object> t = new LinkedHashMap<>();
        t.put("id", id);
        t.put("icon", icon);
        t.put("name", name);
        t.put("fields", fields);
        return t;
    }

    private static Map<String, Object> createField(String id, String label, String type) {
        Map<String, Object> f = new LinkedHashMap<>();
        f.put("id", id);
        f.put("label", label);
        f.put("type", type);
        f.put("required", true);
        return f;
    }
}
