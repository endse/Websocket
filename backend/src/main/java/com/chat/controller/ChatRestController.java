package com.chat.controller;

import com.chat.dto.ChatMessageDTO;
import com.chat.dto.UserDTO;
import com.chat.service.ChatService;
import com.chat.service.OnlineUserService;
import com.chat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;
    private final UserService userService;
    private final OnlineUserService onlineUserService;

    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessageDTO>> getPublicMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getPublicMessages(page, size));
    }

    @GetMapping("/messages/private/{otherUserId}")
    public ResponseEntity<List<ChatMessageDTO>> getPrivateMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        UserDTO currentUser = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(chatService.getPrivateMessages(
                UUID.fromString(currentUser.getId()), otherUserId, page, size));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/online")
    public ResponseEntity<Set<String>> getOnlineUsers() {
        return ResponseEntity.ok(onlineUserService.getOnlineUsers());
    }

    @GetMapping("/users/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserByUsername(userDetails.getUsername()));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "websocket-chat"));
    }
}
