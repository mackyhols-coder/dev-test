using System;
using System.Linq;
using FluentValidation;

namespace Application.Client.Commands.ImportClient;

public class ImportClientCommandValidator : AbstractValidator<ImportClientCommandRequest>
{
    public ImportClientCommandValidator()
    {
        RuleFor(x => x.File)
            .NotNull()
            .WithMessage("Arquivo é obrigatório");

        RuleFor(x => x.File.Length)
            .GreaterThan(0)
            .WithMessage("Arquivo não pode estar vazio")
            .When(x => x.File != null);

        RuleFor(x => x.File.ContentType)
            .Must(contentType => IsValidCsvContentType(contentType))
            .WithMessage("Arquivo deve ser do tipo CSV (.csv)")
            .When(x => x.File != null);

        RuleFor(x => x.File.Length)
            .LessThan(10 * 1024 * 1024)
            .WithMessage("Arquivo não pode ser maior que 10MB")
            .When(x => x.File != null);

        RuleFor(x => x.File.FileName)
            .Must(fileName => fileName != null && fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Arquivo deve ter extensão .csv")
            .When(x => x.File != null);
    }

    private bool IsValidCsvContentType(string contentType)
    {
        var validTypes = new[]
        {
            "text/csv",
            "application/csv",
            "text/comma-separated-values",
            "text/plain",
            "application/vnd.ms-excel"
        };

        return validTypes.Any(validType =>
            string.Equals(contentType, validType, StringComparison.OrdinalIgnoreCase));
    }
}