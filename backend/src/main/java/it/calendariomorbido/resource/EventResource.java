package it.calendariomorbido.resource;

import it.calendariomorbido.dto.EventDto;
import it.calendariomorbido.model.Event;
import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.UUID;

@Path("/api/events")
@Produces(MediaType.APPLICATION_JSON)
public class EventResource {

    @GET
    @PermitAll
    public List<EventDto> list(
        @QueryParam("region") String region
    ) {
        if (region != null && !region.isBlank()) {
            return Event.<Event>list("region", region)
                .stream().map(EventDto::from).toList();
        }
        return Event.<Event>listAll()
            .stream().map(EventDto::from).toList();
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public EventDto get(@PathParam("id") UUID id) {
        Event event = Event.findById(id);
        if (event == null) throw new NotFoundException();
        return EventDto.from(event);
    }
}
