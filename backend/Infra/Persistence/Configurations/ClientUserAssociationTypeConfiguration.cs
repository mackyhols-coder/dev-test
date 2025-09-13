using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations;

public class ClientUserAssociationTypeConfiguration : IEntityTypeConfiguration<ClientUserAssociation>
{
    public void Configure(EntityTypeBuilder<ClientUserAssociation> builder)
    {
        builder.ToTable("ClientUserAssociation");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .IsRequired();

        builder.Property(a => a.ClientId)
            .IsRequired();

        builder.Property(a => a.UserId)
            .IsRequired();

        builder.Property(a => a.IsActive)
            .IsRequired();

        builder.Property(a => a.CreatedAt)
            .IsRequired();

        builder.Property(a => a.ModifiedAt)
            .IsRequired(false);

        builder.HasIndex(a => new { a.ClientId, a.UserId })
            .IsUnique()
            .HasFilter("IsActive = true");
    }
}