package it.calendariomorbido.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ProposalRequest(
    @NotBlank String title,
    String description,
    @NotNull LocalDate startDate,
    @NotNull LocalDate endDate,
    @NotBlank String region,
    String officialUrl,
    String coverImageKey,
    @NotBlank String startCity,
    @NotBlank String startProvince,
    String endCity,
    String endProvince
) {}
