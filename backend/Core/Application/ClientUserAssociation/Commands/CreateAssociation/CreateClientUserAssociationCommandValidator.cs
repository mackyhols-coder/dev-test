using FluentValidation;

namespace Application.ClientUserAssociation.Commands.CreateAssociation;

public class CreateClientUserAssociationCommandValidator : AbstractValidator<CreateClientUserAssociationCommandRequest>
{
    public CreateClientUserAssociationCommandValidator()
    {
        RuleFor(x => x.ClientId)
           .NotEmpty()
           .WithMessage((obj, propertyValue) => $"ClientId obrigatório");

        RuleFor(x => x.UserId)
           .NotEmpty()
           .WithMessage((obj, propertyValue) => $"UserId obrigatório");
    }
}
