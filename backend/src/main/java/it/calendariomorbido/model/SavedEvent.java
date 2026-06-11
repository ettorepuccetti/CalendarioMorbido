package it.calendariomorbido.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_events")
@IdClass(SavedEventId.class)
public class SavedEvent extends PanacheEntityBase {

    @Id
    @Column(name = "user_id", nullable = false)
    public UUID userId;

    @Id
    @Column(name = "event_id", nullable = false)
    public UUID eventId;

    @Column(name = "saved_at")
    public OffsetDateTime savedAt;

    @PrePersist
    void onCreate() {
        savedAt = OffsetDateTime.now();
    }
}
