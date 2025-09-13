using Application.ClientUserAssociation.Models;
using System;

namespace Application.ClientUserAssociation.Queries.AssociationByClient;

public class AssociationByClientQueryResponse : ClientUserAssociationModel
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
}
