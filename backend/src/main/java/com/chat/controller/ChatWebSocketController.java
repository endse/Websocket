package com.chat.controller;

import com.chat.dto.ChatMessageDTO;
import com.chat.service.ChatService;
import com.chat.service.OnlineUserService;
import com.chat.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final OnlineUserService onlineUserService;
    private final UserService userService;

    @MessageMapping("/chat")
    public void sendPublicMessage(@Payload ChatMessageDTO message) {
        log.info("Public message from {}: {}", message.getSenderName(), message.getContent());
        message.setType("TEXT");
        message.setPrivate(false);
        message.setTimestamp(LocalDateTime.now());

        ChatMessageDTO saved = chatService.saveMessage(message);
        messagingTemplate.convertAndSend("/topic/messages", saved);
    }

    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload ChatMessageDTO message) {
        log.info("Private message from {} to {}", message.getSenderName(), message.getRecipientName());
        message.setType("TEXT");
        message.setPrivate(true);
        message.setTimestamp(LocalDateTime.now());

        ChatMessageDTO saved = chatService.saveMessage(message);

        // Send to both sender and recipient
        messagingTemplate.convertAndSend("/queue/private-" + message.getSenderId(), saved);
        messagingTemplate.convertAndSend("/queue/private-" + message.getRecipientId(), saved);
    }

    @MessageMapping("/chat.join")
    public void addUser(@Payload ChatMessageDTO message) {
        log.info("User joined: {}", message.getSenderName());
        onlineUserService.addUser(message.getSenderName());
        userService.setUserOnline(message.getSenderName());

        message.setType("JOIN");
        message.setContent(message.getSenderName() + " joined the chat");
        message.setTimestamp(LocalDateTime.now());

        messagingTemplate.convertAndSend("/topic/messages", message);
        messagingTemplate.convertAndSend("/topic/online-users", onlineUserService.getOnlineUsers());
    }

    @MessageMapping("/chat.leave")
    public void removeUser(@Payload ChatMessageDTO message) {
        log.info("User left: {}", message.getSenderName());
        onlineUserService.removeUser(message.getSenderName());
        userService.setUserOffline(message.getSenderName());

        message.setType("LEAVE");
        message.setContent(message.getSenderName() + " left the chat");
        message.setTimestamp(LocalDateTime.now());

        messagingTemplate.convertAndSend("/topic/messages", message);
        messagingTemplate.convertAndSend("/topic/online-users", onlineUserService.getOnlineUsers());
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload ChatMessageDTO message) {
        message.setType("TYPING");
        messagingTemplate.convertAndSend("/topic/typing", message);
    }
}
