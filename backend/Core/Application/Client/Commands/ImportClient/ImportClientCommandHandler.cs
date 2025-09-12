using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Client.Queries.ImportClient;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Models;
using Common.Utils;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Client.Commands.ImportClient;

public class ImportClientCommandHandler : IRequestHandler<ImportClientCommandRequest, ImportClientQueryResponse>
{
    private readonly IClientControlContext _context;

    public ImportClientCommandHandler(IClientControlContext context)
    {
        _context = context;
    }

    public async Task<ImportClientQueryResponse> Handle(ImportClientCommandRequest request,
        CancellationToken cancellationToken)
    {
        var response = new ImportClientQueryResponse();
        var errorItems = new List<ResponseErrorItem>();
        var successMessages = new List<string>();
        var successCount = 0;
        var lineNumber = 1;

        try
        {
            using var reader = new StreamReader(request.File.OpenReadStream());

            var headerLine = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(headerLine))
            {
                throw new BadRequestException("O arquivo CSV está vazio ou não possui cabeçalho");
            }

            if (!ValidateHeader(headerLine))
            {
                throw new BadRequestException(
                    "Formato do cabeçalho CSV inválido. Esperado: FirstName,LastName,PhoneNumber,Email,DocumentNumber,BirthDate,PostalCode,AddressLine,Number,Complement,Neighborhood,City,State");
            }

            string line;
            while ((line = await reader.ReadLineAsync()) != null)
            {
                lineNumber++;

                if (string.IsNullOrWhiteSpace(line))
                    continue;

                try
                {
                    var client = await ProcessCsvLine(line, lineNumber, errorItems);
                    if (client != null)
                    {
                        if (await _context.Clients.AnyAsync(x => x.DocumentNumber == client.DocumentNumber,
                                cancellationToken))
                        {
                            errorItems.Add(new ResponseErrorItem
                            {
                                Key = $"Linha_{lineNumber}_DocumentNumber",
                                Value =
                                    $"Linha {lineNumber}: Documento {client.DocumentNumber} já existe na base de dados"
                            });
                            continue;
                        }

                        await _context.Clients.AddAsync(client, cancellationToken);
                        successCount++;
                        successMessages.Add(
                            $"Linha {lineNumber}: Cliente {client.FirstName} {client.LastName} importado com sucesso");
                    }
                }
                catch (Exception ex)
                {
                    errorItems.Add(new ResponseErrorItem
                    {
                        Key = $"Linha_{lineNumber}_Erro_Geral",
                        Value = $"Linha {lineNumber}: {ex.Message}"
                    });
                }
            }

            if (successCount > 0)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }

            response.TotalRecords = lineNumber - 1;
            response.SuccessfulImports = successCount;
            response.FailedImports = errorItems.Count;
            response.SuccessMessages = successMessages;

            if (errorItems.Any())
            {
                response.Error = new ResponseError
                {
                    Message = $"Foram encontrados {errorItems.Count} erro(s) durante a importação",
                    Errors = errorItems
                };
            }

            return response;
        }
        catch (Exception ex)
        {
            throw new BadRequestException($"Erro ao processar arquivo CSV: {ex.Message}");
        }
    }

    private bool ValidateHeader(string headerLine)
    {
        var expectedHeaders = new[]
        {
            "nome", "sobrenome", "telefone", "email", "cpf", "aniversário", "endereço"
        };

        string[] headers = ParseCsvLine(headerLine);

        if (headers.Length != expectedHeaders.Length)
        {
            return false;
        }

        for (int i = 0; i < expectedHeaders.Length; i++)
        {
            if (!string.Equals(headers[i]?.Trim(), expectedHeaders[i], StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
        }

        return true;
    }

    private async Task<Domain.Client> ProcessCsvLine(string line, int lineNumber, List<ResponseErrorItem> errorItems)
    {
        var columns = ParseCsvLine(line);

        if (columns.Length < 13)
        {
            errorItems.Add(new ResponseErrorItem
            {
                Key = $"Linha_{lineNumber}_Estrutura",
                Value =
                    $"Linha {lineNumber}: Número insuficiente de colunas. Esperado: 13 colunas, encontrado: {columns.Length}"
            });
            return null;
        }

        try
        {
            var firstName = columns[0]?.Trim();
            var lastName = columns[1]?.Trim();
            var phoneNumber = columns[2]?.Trim();
            var email = columns[3]?.Trim();
            var documentNumber = columns[4]?.Trim();
            var birthDateStr = columns[5]?.Trim();
            var postalCode = columns[6]?.Trim();
            var addressLine = columns[7]?.Trim();
            var number = columns[8]?.Trim();
            var complement = columns[9]?.Trim();
            var neighborhood = columns[10]?.Trim();
            var city = columns[11]?.Trim();
            var state = columns[12]?.Trim();

            // Validações básicas
            var validationErrors = ValidateClientData(lineNumber, firstName, lastName, documentNumber, birthDateStr);
            if (validationErrors.Any())
            {
                errorItems.AddRange(validationErrors);
                return null;
            }

            // Parse da data
            DateTime birthDate;
            try
            {
                birthDate = DateValidatorUtils.ParseToDate(birthDateStr);
            }
            catch (Exception)
            {
                errorItems.Add(new ResponseErrorItem
                {
                    Key = $"Linha_{lineNumber}_BirthDate",
                    Value = $"Linha {lineNumber}: Data de nascimento inválida '{birthDateStr}'. Use formato dd/MM/yyyy"
                });
                return null;
            }

            var address = new Address(
                postalCode ?? "",
                addressLine ?? "",
                number ?? "",
                complement ?? "",
                neighborhood ?? "",
                city ?? "",
                state ?? ""
            );

            var client = new Domain.Client(
                firstName,
                lastName,
                phoneNumber ?? "",
                email ?? "",
                documentNumber,
                birthDate,
                address
            );

            return client;
        }
        catch (Exception ex)
        {
            errorItems.Add(new ResponseErrorItem
            {
                Key = $"Linha_{lineNumber}_Processamento",
                Value = $"Linha {lineNumber}: Erro ao processar - {ex.Message}"
            });
            return null;
        }
    }

    private List<ResponseErrorItem> ValidateClientData(int lineNumber, string firstName, string lastName,
        string documentNumber, string birthDate)
    {
        var errors = new List<ResponseErrorItem>();

        if (string.IsNullOrEmpty(firstName))
            errors.Add(new ResponseErrorItem
            {
                Key = $"Linha_{lineNumber}_FirstName",
                Value = $"Linha {lineNumber}: Nome é obrigatório"
            });

        if (string.IsNullOrEmpty(lastName))
            errors.Add(new ResponseErrorItem
            {
                Key = $"Linha_{lineNumber}_LastName",
                Value = $"Linha {lineNumber}: Sobrenome é obrigatório"
            });

        if (string.IsNullOrEmpty(documentNumber))
            errors.Add(new ResponseErrorItem
            {
                Key = $"Linha_{lineNumber}_DocumentNumber",
                Value = $"Linha {lineNumber}: Documento é obrigatório"
            });

        if (string.IsNullOrEmpty(birthDate))
            errors.Add(new ResponseErrorItem
            {
                Key = $"Linha_{lineNumber}_BirthDate",
                Value = $"Linha {lineNumber}: Data de nascimento é obrigatória"
            });

        return errors;
    }

    private string[] ParseCsvLine(string line)
    {
        // Usar split simples - primeiro tenta com ponto e vírgula, depois com vírgula
        string[] columns;
        
        if (line.Contains(';'))
        {
            columns = line.Split(';');
        }
        else
        {
            columns = line.Split(',');
        }

        // Remover aspas e espaços em branco de cada coluna
        for (int i = 0; i < columns.Length; i++)
        {
            columns[i] = columns[i].Trim().Trim('"');
        }

        return columns;
    }
}