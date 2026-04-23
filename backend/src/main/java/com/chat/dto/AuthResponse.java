package com.chat.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String username;
    private String userId;
    private String email;
    private String avatarUrl;
}
