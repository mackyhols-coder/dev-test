using Domain;
using MediatR;
using System;

namespace Application.Client.Commands.UpdateClient;

public class UpdateClientCommandRequest : IRequest
{
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
    public string DocumentNumber { get; set; }
    public string BirthDate { get; set; }
    public Address Address { get; set; }
}
