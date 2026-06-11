package it.calendariomorbido.model;

// Public fields are intentional: Panache's Active Record pattern uses bytecode enhancement at
// compile time to rewrite direct field access into getter/setter calls, preserving encapsulation
// at runtime. See: https://quarkus.io/guides/hibernate-orm-panache#solution-1-using-the-active-record-pattern

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proposals")
public class Proposal extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "user_id", nullable = false)
    public UUID userId;

    @Column(nullable = false)
    public String status = "pending";

    @Column(name = "rejection_reason")
    public String rejectionReason;

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

    @Column(name = "submitted_at")
    public OffsetDateTime submittedAt;

    @Column(name = "reviewed_at")
    public OffsetDateTime reviewedAt;

    @PrePersist
    void onCreate() {
        submittedAt = OffsetDateTime.now();
    }
}
