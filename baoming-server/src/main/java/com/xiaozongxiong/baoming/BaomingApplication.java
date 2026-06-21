package com.xiaozongxiong.baoming;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.xiaozongxiong.baoming.**.mapper")
public class BaomingApplication {
    public static void main(String[] args) {
        SpringApplication.run(BaomingApplication.class, args);
    }
}
