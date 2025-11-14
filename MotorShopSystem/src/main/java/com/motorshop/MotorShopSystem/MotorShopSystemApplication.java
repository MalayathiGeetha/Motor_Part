package com.motorshop.MotorShopSystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MotorShopSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(MotorShopSystemApplication.class, args);
	}

}
