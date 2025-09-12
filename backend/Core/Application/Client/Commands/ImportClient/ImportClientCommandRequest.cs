using Application.Client.Queries.ImportClient;
using Application.Common.Interfaces;
using MediatR;

namespace Application.Client.Commands.ImportClient;

public class ImportClientCommandRequest : IRequest<ImportClientQueryResponse>
{
    public IFileUpload File { get; set; }
}
