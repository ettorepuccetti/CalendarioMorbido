package it.calendariomorbido.resource;

import it.calendariomorbido.model.Event;
import it.calendariomorbido.model.Proposal;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/api/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("admin")
public class AdminResource {

    @GET
    @Path("/proposals")
    public List<Proposal> pendingProposals() {
        return Proposal.list("status", "pending");
    }

    @POST
    @Path("/proposals/{id}/approve")
    @Transactional
    public Response approve(@PathParam("id") UUID proposalId) {
        Proposal p = Proposal.findById(proposalId);
        if (p == null) throw new NotFoundException();
        if (!"pending".equals(p.status)) throw new BadRequestException("Proposal is not pending");

        Event e = new Event();
        e.proposalId = p.id;
        e.title = p.title;
        e.description = p.description;
        e.startDate = p.startDate;
        e.endDate = p.endDate;
        e.region = p.region;
        e.officialUrl = p.officialUrl;
        e.coverImageKey = p.coverImageKey;
        e.startCity = p.startCity;
        e.startProvince = p.startProvince;
        e.endCity = p.endCity;
        e.endProvince = p.endProvince;
        e.persist();

        p.status = "approved";
        p.reviewedAt = LocalDateTime.now();

        return Response.ok(Map.of("eventId", e.id)).build();
    }

    @POST
    @Path("/proposals/{id}/reject")
    @Transactional
    public Response reject(
        @PathParam("id") UUID proposalId,
        Map<String, String> body
    ) {
        Proposal p = Proposal.findById(proposalId);
        if (p == null) throw new NotFoundException();
        if (!"pending".equals(p.status)) throw new BadRequestException("Proposal is not pending");

        p.status = "rejected";
        p.rejectionReason = body.get("reason");
        p.reviewedAt = LocalDateTime.now();

        return Response.ok(p).build();
    }

    @DELETE
    @Path("/events/{id}")
    @Transactional
    public Response deleteEvent(@PathParam("id") UUID eventId) {
        long deleted = Event.delete("id", eventId);
        if (deleted == 0) throw new NotFoundException();
        return Response.noContent().build();
    }
}
