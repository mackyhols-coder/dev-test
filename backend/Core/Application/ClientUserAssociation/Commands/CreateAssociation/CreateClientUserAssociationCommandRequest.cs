using MediatR;
using System;

namespace Application.ClientUserAssociation.Commands.CreateAssociation;

public class CreateClientUserAssociationCommandRequest : IRequest<Guid>
{
    public Guid ClientId { get; set; }
    public Guid UserId { get; set; }
}
