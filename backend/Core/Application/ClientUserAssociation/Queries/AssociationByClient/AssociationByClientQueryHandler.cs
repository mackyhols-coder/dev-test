using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.ClientUserAssociation.Queries.AssociationByClient;

public class AssociationByClientQueryHandler : IRequestHandler<AssociationByClientQueryRequest, IEnumerable<AssociationByClientQueryResponse>>
{
    private readonly IClientControlContext _context;

    public AssociationByClientQueryHandler(IClientControlContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AssociationByClientQueryResponse>> Handle(AssociationByClientQueryRequest request, CancellationToken cancellationToken)
    {
        var associations = await _context.ClientUser
            .Where(x => x.ClientId == request.ClientId && x.IsActive)
            .ToListAsync(cancellationToken);

        var userIds = associations.Select(x => x.UserId).Distinct().ToList();

        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        var userDict = users.ToDictionary(u => u.Id, u => u.Username);

        var result = associations.Select(a => new AssociationByClientQueryResponse
        {
            Id = a.Id,
            ClientId = a.ClientId,
            UserId = a.UserId,
            Username = userDict.GetValueOrDefault(a.UserId) ?? string.Empty,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt,
            ModifiedAt = a.ModifiedAt
        });

        return result;
    }
}