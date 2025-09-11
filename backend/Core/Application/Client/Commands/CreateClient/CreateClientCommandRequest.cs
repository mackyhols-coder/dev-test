using Application.Client.Models;
using MediatR;
using System;

namespace Application.Client.Commands.CreateClient
{
    public class CreateClientCommandRequest : IRequest<Guid>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string DocumentNumber { get; set; }

        public string BirthDate { get; set; }
        public AddressModel Address { get; set; }
    }
}
