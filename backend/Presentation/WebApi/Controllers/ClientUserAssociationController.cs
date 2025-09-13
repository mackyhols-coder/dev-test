using Application.ClientUserAssociation.Commands.CreateAssociation;
using Application.ClientUserAssociation.Commands.RemoveAssociation;
using Application.ClientUserAssociation.Queries.AllAssociationsQuery;
using Application.ClientUserAssociation.Queries.AssociationByClient;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebApi.Controllers;

[ApiController]
[Route("api/association/client")]
[Authorize]
public class ClientUserAssociationController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClientUserAssociationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    public async Task<IActionResult> Create([FromBody] CreateClientUserAssociationCommandRequest request)
    {
        var response = await _mediator.Send(request);
        return Ok(response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AllAssociationsQueryRequest>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListAll()
    {
        var response = await _mediator.Send(new AllAssociationsQueryRequest());
        return Ok(response);
    }

    [HttpGet("{clientId}")]
    [ProducesResponseType(typeof(IEnumerable<AssociationByClientQueryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByClient([FromRoute] Guid clientId)
    {
        var response = await _mediator.Send(new AssociationByClientQueryRequest() { ClientId = clientId});
        return Ok(response);
    }

    [HttpDelete("{associationId}")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<IActionResult> Remove([FromRoute] Guid associationId)
    {
        var response = await _mediator.Send(new RemoveClientUserAssociationCommandRequest() { AssociationId = associationId});
        return Ok(response);
    }
}