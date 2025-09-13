using Application.Common.Interfaces;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

namespace Persistence
{
    public class ClientControlContext : DbContext, IClientControlContext
    {
        public DbSet<Client> Clients { get; set; }
        public DbSet<Domain.User> Users { get; set; }
        public DbSet<ClientUserAssociation> ClientUser { get; set; }

        public ClientControlContext(DbContextOptions<ClientControlContext> options) : base(options) { }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                if (entry.Entity.CreatedAt == DateTime.MinValue)
                {
                    entry.Entity.SetCreatedAt(DateTime.UtcNow);
                    entry.State = EntityState.Added;
                }
                else if (entry.State == EntityState.Modified)
                    entry.Entity.SetModifiedAt(DateTime.UtcNow);
            }
            return await base.SaveChangesAsync(cancellationToken);
        }

        public void AttachModelToContext<T>(T entity)
        {
            base.Attach(entity);
        }

        public IExecutionStrategy CreateExecutionStrategy()
        {
            return Database.CreateExecutionStrategy();
        }

        public void SetModifiedState<T>(T entity)
        {
            base.Entry(entity).State = EntityState.Modified;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ClientControlContext).Assembly);

            // Seed default user for testing purposes
            modelBuilder.Entity<Domain.User>().HasData(
                new Domain.User("admin", BCrypt.Net.BCrypt.HashPassword("admin"), Profile.Administrator) { Id = Guid.Parse("a1b2c3d4-e5f6-7890-1234-567890abcdef") }
            );
        }
    }
}
