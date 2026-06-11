package it.calendariomorbido.model;

import java.io.Serializable;
import java.util.UUID;

public class SavedEventId implements Serializable {
    public UUID userId;
    public UUID eventId;
}
