using Common.Utils;
using FluentValidation;

namespace Application.Client.Commands.UpdateClient;

public class UpdateClientCommandValidator : AbstractValidator<UpdateClientCommandRequest>
{
    public UpdateClientCommandValidator()
    {
        RuleFor(x => x.FirstName)
           .NotEmpty()
           .WithMessage((obj, propertyValue) => $"FirstName obrigatório");

        RuleFor(x => x.LastName)
           .NotEmpty()
           .WithMessage((obj, propertyValue) => $"LastName obrigatório");

        RuleFor(x => x.PhoneNumber)
           .NotEmpty()
           .WithMessage((obj, propertyValue) => $"PhoneNumber obrigatório");

        RuleFor(x => x.Email)
           .NotEmpty()
           .WithMessage((obj, propertyValue) => $"Email obrigatório");

        RuleFor(x => x.DocumentNumber)
           .NotEmpty()
           .WithMessage((obj, propertyValue) => $"DocumentNumber obrigatório")
            .Must(DocumentValidatorUtils.IsValidCpfOrCnpj)
            .WithMessage((obj, propertyValue) => $"DocumentNumber inválido. Deve ser um CPF ou CNPJ válido");

        RuleFor(x => x.Address)
            .NotNull()
            .WithMessage((obj, propertyValue) => $"Address obrigatório")
            .ChildRules(child =>
            {
                child
                    .RuleFor(x => x.PostalCode)
                    .NotEmpty()
                    .WithMessage((obj, propertyValue) => $"Address.PostalCode obrigatório");

                child
                    .RuleFor(x => x.AddressLine)
                    .NotEmpty()
                    .WithMessage((obj, propertyValue) => $"Address.AddressLine obrigatório");

                child
                    .RuleFor(x => x.Number)
                    .NotEmpty()
                    .WithMessage((obj, propertyValue) => $"Address.Number obrigatório");

                child
                    .RuleFor(x => x.Neighborhood)
                    .NotEmpty()
                    .WithMessage((obj, propertyValue) => $"Address.Neighborhood obrigatório");

                child
                    .RuleFor(x => x.City)
                    .NotEmpty()
                    .WithMessage((obj, propertyValue) => $"Address.City obrigatório");

                child
                    .RuleFor(x => x.State)
                    .NotEmpty()
                    .WithMessage((obj, propertyValue) => $"Address.State obrigatório");
            });
    }
}
