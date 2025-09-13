using FluentValidation;

namespace Application.ClientUserAssociation.Commands.RemoveAssociation;

public class RemoveClientUserAssociationCommandValidator : AbstractValidator<RemoveClientUserAssociationCommandRequest>
{
    public RemoveClientUserAssociationCommandValidator()
    {
        RuleFor(x => x.AssociationId)
           .NotEmpty()
           .WithMessage((obj, propertyValue) => $"AssociationId obrigatório");
    }
}
