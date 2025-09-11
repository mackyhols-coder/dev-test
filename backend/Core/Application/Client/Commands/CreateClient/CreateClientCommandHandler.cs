using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Common.Utils;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Client.Commands.CreateClient
{
    public class CreateClientCommandHandler : IRequestHandler<CreateClientCommandRequest, Guid>
    {
        private readonly IClientControlContext _context;

        public CreateClientCommandHandler(IClientControlContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateClientCommandRequest request, CancellationToken cancellationToken)
        {
            var client = new Domain.Client(
                request.FirstName,
                request.LastName,
                request.PhoneNumber,
                request.Email,
                request.DocumentNumber,
                DateValidatorUtils.ParseToDate(request.BirthDate),
                new Domain.Address(
                    request.Address.PostalCode,
                    request.Address.AddressLine,
                    request.Address.Number,
                    request.Address.Complement,
                    request.Address.Neighborhood,
                    request.Address.City,
                    request.Address.State));

            if (await _context.Clients.AnyAsync(x => x.DocumentNumber == client.DocumentNumber))
                throw new BadRequestException("Document already exists");

            await _context.Clients.AddAsync(client, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return client.Id;
        }
    }
}
