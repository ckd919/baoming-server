package com.xiaozongxiong.baoming.activity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaozongxiong.baoming.model.ActivityComment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentMapper extends BaseMapper<ActivityComment> {
}
