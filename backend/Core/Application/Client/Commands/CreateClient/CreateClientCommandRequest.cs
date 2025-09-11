using Application.Client.Models;
using MediatR;
using System;

namespace Application.Client.Commands.CreateClient
{
    public class CreateClientCommandRequest : ClientModel, IRequest<Guid>
    {
    }
}
