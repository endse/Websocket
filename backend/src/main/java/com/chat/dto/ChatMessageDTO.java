package com.chat.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ChatMessageDTO {
    private String id;
    private String senderId;
    private String senderName;
    private String senderAvatar;
    private String recipientId;
    private String recipientName;
    private String content;
    private String type;       // TEXT, JOIN, LEAVE, TYPING
    private boolean isPrivate;
    private LocalDateTime timestamp;
}
