package it.calendariomorbido.dto;

import it.calendariomorbido.model.Event;
import java.time.LocalDate;
import java.util.UUID;

public record EventDto(
    UUID id,
    String title,
    String description,
    LocalDate startDate,
    LocalDate endDate,
    String region,
    String officialUrl,
    String coverImageKey,
    String startCity,
    String startProvince,
    String endCity,
    String endProvince
) {
    public static EventDto from(Event e) {
        return new EventDto(
            e.id, e.title, e.description,
            e.startDate, e.endDate, e.region,
            e.officialUrl, e.coverImageKey,
            e.startCity, e.startProvince,
            e.endCity, e.endProvince
        );
    }
}
