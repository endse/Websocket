package com.chat.service;

import com.chat.dto.ChatMessageDTO;
import com.chat.entity.Message;
import com.chat.entity.User;
import com.chat.repository.MessageRepository;
import com.chat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessageDTO saveMessage(ChatMessageDTO dto) {
        User sender = userRepository.findByUsername(dto.getSenderName())
                .orElseThrow(() -> new RuntimeException("Sender not found: " + dto.getSenderName()));

        Message.MessageBuilder builder = Message.builder()
                .sender(sender)
                .content(dto.getContent())
                .type(dto.getType() != null ? dto.getType() : "TEXT")
                .isPrivate(dto.isPrivate())
                .createdAt(LocalDateTime.now());

        if (dto.isPrivate() && dto.getRecipientId() != null) {
            User recipient = userRepository.findById(UUID.fromString(dto.getRecipientId()))
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));
            builder.recipient(recipient);
        }

        Message saved = messageRepository.save(builder.build());
        return toDTO(saved);
    }

    public List<ChatMessageDTO> getPublicMessages(int page, int size) {
        Page<Message> messages = messageRepository.findByIsPrivateFalseOrderByCreatedAtDesc(
                PageRequest.of(page, size));
        List<ChatMessageDTO> result = messages.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        Collections.reverse(result);
        return result;
    }

    public List<ChatMessageDTO> getPrivateMessages(UUID userId, UUID otherId, int page, int size) {
        Page<Message> messages = messageRepository.findPrivateMessages(userId, otherId,
                PageRequest.of(page, size));
        List<ChatMessageDTO> result = messages.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        Collections.reverse(result);
        return result;
    }

    private ChatMessageDTO toDTO(Message msg) {
        return ChatMessageDTO.builder()
                .id(msg.getId().toString())
                .senderId(msg.getSender().getId().toString())
                .senderName(msg.getSender().getUsername())
                .senderAvatar(msg.getSender().getAvatarUrl())
                .recipientId(msg.getRecipient() != null ? msg.getRecipient().getId().toString() : null)
                .recipientName(msg.getRecipient() != null ? msg.getRecipient().getUsername() : null)
                .content(msg.getContent())
                .type(msg.getType())
                .isPrivate(msg.getIsPrivate())
                .timestamp(msg.getCreatedAt())
                .build();
    }
}
