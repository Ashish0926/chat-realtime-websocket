package com.ashish.realtime_notification_system.controller;

import com.ashish.realtime_notification_system.enums.MessageType;
import com.ashish.realtime_notification_system.model.ChatMessage;
import java.time.LocalDateTime;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {

    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(ChatMessage chatMessage) {
        chatMessage.setTime(LocalDateTime.now().toString());
        return chatMessage;
    }

    @MessageMapping("/chat.join")
    @SendTo("/topic/public")
    public ChatMessage joinChat(ChatMessage chatMessage) {
        chatMessage.setType(MessageType.JOIN);
        chatMessage.setTime(LocalDateTime.now().toString());
        return chatMessage;
    }

    @MessageMapping("/chat.leave")
    @SendTo("/topic/public")
    public ChatMessage leaveChat(ChatMessage chatMessage) {
        chatMessage.setType(MessageType.LEAVE);
        chatMessage.setTime(LocalDateTime.now().toString());
        return chatMessage;
    }
}
