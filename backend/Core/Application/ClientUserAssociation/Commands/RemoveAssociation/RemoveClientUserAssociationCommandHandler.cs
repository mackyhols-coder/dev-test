using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.ClientUserAssociation.Commands.RemoveAssociation;

public class RemoveClientUserAssociationCommandHandler : IRequestHandler<RemoveClientUserAssociationCommandRequest, bool>
{
    private readonly IClientControlContext _context;

    public RemoveClientUserAssociationCommandHandler(IClientControlContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(RemoveClientUserAssociationCommandRequest request, CancellationToken cancellationToken)
    {
        var association = await _context.ClientUser.FirstOrDefaultAsync(a => a.Id == request.AssociationId);

        if (association is null || !association.IsActive)
        {
            throw new Exception("A associação informada não foi encontrada.");
        }

        _context.ClientUser.Remove(association);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
