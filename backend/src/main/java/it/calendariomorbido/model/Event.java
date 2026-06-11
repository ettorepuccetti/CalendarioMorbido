package it.calendariomorbido.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "proposal_id")
    public UUID proposalId;

    @Column(nullable = false)
    public String title;

    public String description;

    @Column(name = "start_date", nullable = false)
    public LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    public LocalDate endDate;

    @Column(nullable = false)
    public String region;

    @Column(name = "official_url")
    public String officialUrl;

    @Column(name = "cover_image_key")
    public String coverImageKey;

    @Column(name = "start_comune", nullable = false)
    public String startCity;

    @Column(name = "start_provincia", nullable = false)
    public String startProvince;

    @Column(name = "end_comune")
    public String endCity;

    @Column(name = "end_provincia")
    public String endProvince;

    @Column(name = "created_at")
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
