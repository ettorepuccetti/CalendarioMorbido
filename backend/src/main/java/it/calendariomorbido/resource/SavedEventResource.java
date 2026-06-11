package it.calendariomorbido.resource;

import it.calendariomorbido.model.Event;
import it.calendariomorbido.model.SavedEvent;
import it.calendariomorbido.dto.EventDto;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import java.util.List;
import java.util.UUID;

@Path("/api/me/saved-events")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("user")
public class SavedEventResource {

    @Inject
    JsonWebToken jwt;

    @GET
    public List<EventDto> list() {
        UUID userId = UUID.fromString(jwt.getSubject());
        List<SavedEvent> saved = SavedEvent.list("userId", userId);
        List<UUID> eventIds = saved.stream().map(s -> s.eventId).toList();
        return Event.<Event>list("id in ?1", eventIds)
            .stream().map(EventDto::from).toList();
    }

    @POST
    @Path("/{eventId}")
    @Transactional
    public Response save(@PathParam("eventId") UUID eventId) {
        UUID userId = UUID.fromString(jwt.getSubject());

        boolean exists = SavedEvent.count("userId = ?1 and eventId = ?2", userId, eventId) > 0;
        if (exists) return Response.status(Response.Status.CONFLICT).build();

        SavedEvent s = new SavedEvent();
        s.userId = userId;
        s.eventId = eventId;
        s.persist();

        return Response.status(Response.Status.CREATED).build();
    }

    @DELETE
    @Path("/{eventId}")
    @Transactional
    public Response remove(@PathParam("eventId") UUID eventId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        SavedEvent.delete("userId = ?1 and eventId = ?2", userId, eventId);
        return Response.noContent().build();
    }
}
