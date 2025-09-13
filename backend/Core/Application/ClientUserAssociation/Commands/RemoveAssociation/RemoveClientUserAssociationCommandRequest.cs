using MediatR;
using System;

namespace Application.ClientUserAssociation.Commands.RemoveAssociation;

public class RemoveClientUserAssociationCommandRequest : IRequest<bool>
{
    public Guid AssociationId { get; set; }
}
