package com.chat.repository;

import com.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    // Public chat messages (no recipient)
    Page<Message> findByIsPrivateFalseOrderByCreatedAtDesc(Pageable pageable);

    // Private messages between two users
    @Query("SELECT m FROM Message m WHERE m.isPrivate = true " +
           "AND ((m.sender.id = :userId AND m.recipient.id = :otherId) " +
           "OR (m.sender.id = :otherId AND m.recipient.id = :userId)) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> findPrivateMessages(@Param("userId") UUID userId,
                                       @Param("otherId") UUID otherId,
                                       Pageable pageable);
}
