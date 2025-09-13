using System;

namespace Application.ClientUserAssociation.Models;

public class ClientUserAssociationModel
{
    public Guid ClientId { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; }
    public bool IsActive { get; set; }
}
