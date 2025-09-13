using MediatR;
using System.Collections.Generic;

namespace Application.ClientUserAssociation.Queries.AllAssociationsQuery;

public class AllAssociationsQueryRequest : IRequest<IEnumerable<AllAssociationsQueryResponse>>
{
}
