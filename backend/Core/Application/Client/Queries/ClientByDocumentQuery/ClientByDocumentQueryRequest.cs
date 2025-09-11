using MediatR;

namespace Application.Client.Queries.ClientByDocumentQuery;

public class ClientByDocumentQueryRequest : IRequest<ClientByDocumentQueryResponse>
{
    public string DocumentNumber { get; set; }
}
