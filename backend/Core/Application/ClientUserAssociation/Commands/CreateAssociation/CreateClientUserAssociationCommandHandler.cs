using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.ClientUserAssociation.Commands.CreateAssociation;

public class CreateClientUserAssociationCommandHandler : IRequestHandler<CreateClientUserAssociationCommandRequest, Guid>
{
    private readonly IClientControlContext _context;

    public CreateClientUserAssociationCommandHandler(IClientControlContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateClientUserAssociationCommandRequest request, CancellationToken cancellationToken)
    {
        if(!await _context.Clients.AnyAsync(c => c.Id == request.ClientId, cancellationToken))
        {
            throw new Exception("O cliente informado não foi encontrado.");
        }

        if(!await _context.Users.AnyAsync(u => u.Id == request.UserId, cancellationToken))
        {
            throw new Exception("O usuário informado não foi encontrado.");
        }

        var association = await _context.ClientUser
            .FirstOrDefaultAsync(a 
                => a.ClientId == request.ClientId 
                && a.UserId == request.UserId
                && a.IsActive);

        if (association is not null)
        {
            return association.Id;
        }

        association = new Domain.ClientUserAssociation(request.ClientId, request.UserId);

        _context.ClientUser.Add(association);

        await _context.SaveChangesAsync(cancellationToken);

        return association.Id;
    }
}
