using Application.Client.Models;
using System;

namespace Application.Client.Queries.ClientByDocumentQuery;

public class ClientByDocumentQueryResponse : ClientModel
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
}
