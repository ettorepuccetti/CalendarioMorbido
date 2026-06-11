package it.calendariomorbido.resource;

import it.calendariomorbido.dto.ProposalRequest;
import it.calendariomorbido.model.Proposal;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import java.util.List;
import java.util.UUID;

@Path("/api/me/proposals")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("user")
public class ProposalResource {

    @Inject
    JsonWebToken jwt;

    @GET
    public List<Proposal> list() {
        UUID userId = UUID.fromString(jwt.getSubject());
        return Proposal.list("userId", userId);
    }

    @POST
    @Transactional
    public Response submit(@Valid ProposalRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());

        Proposal p = new Proposal();
        p.userId = userId;
        p.title = req.title();
        p.description = req.description();
        p.startDate = req.startDate();
        p.endDate = req.endDate();
        p.region = req.region();
        p.officialUrl = req.officialUrl();
        p.coverImageKey = req.coverImageKey();
        p.startCity = req.startCity();
        p.startProvince = req.startProvince();
        p.endCity = req.endCity();
        p.endProvince = req.endProvince();
        p.persist();

        return Response.status(Response.Status.CREATED).entity(p).build();
    }
}
