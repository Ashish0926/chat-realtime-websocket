package com.ashish.realtime_notification_system;

import com.ashish.realtime_notification_system.model.ChatMessage;
import java.lang.reflect.Method;

public class LombokTest {
    public static void main(String[] args) {
        Method[] methods = ChatMessage.class.getDeclaredMethods();
        for (Method method : methods) {
            System.out.println(method.getName());
        }
    }
}
