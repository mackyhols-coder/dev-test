using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Common.Utils;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Client.Commands.UpdateClient;

public class UpdateClientCommandHandler : IRequestHandler<UpdateClientCommandRequest>
{
    private readonly IClientControlContext _context;
    public UpdateClientCommandHandler(IClientControlContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateClientCommandRequest request, CancellationToken cancellationToken)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (client == null)
        {
            throw new NotFoundException(nameof(Domain.Client), request.Id);
        }

        if (await _context.Clients.AnyAsync(x => x.DocumentNumber == client.DocumentNumber && x.Id != request.Id))
            throw new BadRequestException("Document already exists");

        client.UpdateInfo(
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.Email,
            request.DocumentNumber,
            DateValidatorUtils.ParseToDate(request.BirthDate)
        );

        client.UpdateAddress(new Address(
            request.Address.PostalCode,
            request.Address.AddressLine,
            request.Address.Number,
            request.Address.Complement,
            request.Address.Neighborhood,
            request.Address.City,
            request.Address.State
        ));

        client.SetModifiedAt(DateTime.Now);

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
