using MediatR;
using System;
using System.Collections.Generic;

namespace Application.ClientUserAssociation.Queries.AssociationByClient;

public class AssociationByClientQueryRequest : IRequest<IEnumerable<AssociationByClientQueryResponse>>
{
    public Guid ClientId { get; set; }
}
