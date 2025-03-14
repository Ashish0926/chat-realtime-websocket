package com.ashish.realtime_notification_system.model;

import com.ashish.realtime_notification_system.enums.MessageType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {

    private String content;
    private String sender;
    private String time;
    private MessageType type;
}
