using System;

namespace Domain;

public class ClientUserAssociation : BaseEntity
{
    public Guid ClientId { get; private set; }
    public Guid UserId { get; private set; }
    public bool IsActive { get; private set; }

    public ClientUserAssociation(Guid clientId, Guid userId)
    {
        ClientId = clientId;
        UserId = userId;
        IsActive = true;
        SetCreatedAt(DateTime.Now);
    }

    public void Deactivate()
    {
        IsActive = false;
        SetModifiedAt(DateTime.Now);
    }
}
