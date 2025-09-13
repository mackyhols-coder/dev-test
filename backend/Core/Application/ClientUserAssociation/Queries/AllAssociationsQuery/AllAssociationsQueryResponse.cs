using Application.ClientUserAssociation.Models;
using System;

namespace Application.ClientUserAssociation.Queries.AllAssociationsQuery;

public class AllAssociationsQueryResponse : ClientUserAssociationModel
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
}
