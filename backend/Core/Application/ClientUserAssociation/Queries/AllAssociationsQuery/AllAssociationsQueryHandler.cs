using Application.ClientUserAssociation.Queries.AssociationByClient;
using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.ClientUserAssociation.Queries.AllAssociationsQuery;

public class AllAssociationsQueryHandler : IRequestHandler<AllAssociationsQueryRequest, IEnumerable<AllAssociationsQueryResponse>>
{
    private readonly IClientControlContext _context;

    public AllAssociationsQueryHandler(IClientControlContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AllAssociationsQueryResponse>> Handle(AllAssociationsQueryRequest request, CancellationToken cancellationToken)
    {
        var associations = await _context.ClientUser
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        var userIds = associations
            .Select(x => x.UserId)
            .Distinct()
            .ToList();

        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        var userDict = users.ToDictionary(u => u.Id, u => u.Username);

        var result = associations.Select(a => new AllAssociationsQueryResponse
        {
            Id = a.Id,
            ClientId = a.ClientId,
            UserId = a.UserId,
            Username = userDict.GetValueOrDefault(a.UserId) ?? string.Empty,
            CreatedAt = a.CreatedAt,
            ModifiedAt = a.ModifiedAt
        });

        return result;
    }
}
