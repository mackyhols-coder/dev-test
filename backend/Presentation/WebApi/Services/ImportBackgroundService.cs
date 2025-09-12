using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Enums;
using Application.Common.Interfaces;
using Application.Common.Models;
using Common.Utils;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace WebApi.Services;

public class ImportBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IImportQueue _importQueue;
    private readonly IImportJobService _jobService;
    private readonly ILogger<ImportBackgroundService> _logger;

    public ImportBackgroundService(
        IServiceProvider serviceProvider,
        IImportQueue importQueue,
        IImportJobService jobService,
        ILogger<ImportBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _importQueue = importQueue;
        _jobService = jobService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (_importQueue.TryDequeue(out var importJob))
                {
                    await ProcessImportJob(importJob, stoppingToken);
                }
                else
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro no processamento de importação em background");
                await Task.Delay(5000, stoppingToken);
            }
        }
    }

    private async Task ProcessImportJob(ImportJob job, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation($"Iniciando processamento do job {job.Id}");

            await _jobService.UpdateJobStatusAsync(job.Id, EImportJobStatus.Processing);

            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IClientControlContext>();

            var result = await ProcessCsvContent(job.FileContent, context, cancellationToken);

            await _jobService.CompleteJobAsync(
                job.Id,
                result.TotalRecords,
                result.SuccessfulImports,
                result.FailedImports,
                JsonSerializer.Serialize(result));

            _logger.LogInformation($"Job {job.Id} processado com sucesso. {result.SuccessfulImports} registros importados.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erro ao processar job {job.Id}");
            await _jobService.UpdateJobStatusAsync(job.Id, EImportJobStatus.Failed, ex.Message);
        }
    }

    private async Task<ImportResult> ProcessCsvContent(byte[] fileContent, IClientControlContext context, CancellationToken cancellationToken)
    {
        var result = new ImportResult();
        var errorItems = new List<ResponseErrorItem>();
        var successCount = 0;
        var lineNumber = 1;

        using var stream = new MemoryStream(fileContent);
        using var reader = new StreamReader(stream, Encoding.UTF8);

        var headerLine = await reader.ReadLineAsync();
        if (string.IsNullOrWhiteSpace(headerLine))
        {
            throw new InvalidOperationException("Arquivo CSV está vazio ou não possui cabeçalho");
        }

        string line;
        while ((line = await reader.ReadLineAsync()) != null)
        {
            lineNumber++;

            if (string.IsNullOrWhiteSpace(line))
                continue;

            try
            {
                var client = ProcessCsvLine(line, lineNumber, errorItems);
                if (client != null)
                {
                    if (await context.Clients.AnyAsync(x => x.DocumentNumber == client.DocumentNumber, cancellationToken))
                    {
                        errorItems.Add(new ResponseErrorItem
                        {
                            Key = $"Linha_{lineNumber}_DocumentNumber",
                            Value = $"Linha {lineNumber}: Documento {client.DocumentNumber} já existe na base de dados"
                        });
                        continue;
                    }

                    await context.Clients.AddAsync(client, cancellationToken);
                    successCount++;
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
            await context.SaveChangesAsync(cancellationToken);
        }

        result.TotalRecords = lineNumber - 1;
        result.SuccessfulImports = successCount;
        result.FailedImports = errorItems.Count;
        result.Errors = errorItems;

        return result;
    }

    private Client ProcessCsvLine(string line, int lineNumber, List<ResponseErrorItem> errorItems)
    {
        string[] columns = ParseCsvLine(line);

        if (columns.Length < 7)
        {
            errorItems.Add(new ResponseErrorItem
            {
                Key = $"Linha_{lineNumber}_Estrutura",
                Value = $"Linha {lineNumber}: Número insuficiente de colunas. Esperado: 7 colunas, encontrado: {columns.Length}"
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
            var addressLine = columns[6]?.Trim();

            if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName) || string.IsNullOrEmpty(documentNumber))
            {
                errorItems.Add(new ResponseErrorItem
                {
                    Key = $"Linha_{lineNumber}_Campos_Obrigatorios",
                    Value = $"Linha {lineNumber}: Nome, sobrenome e documento são obrigatórios"
                });
                return null;
            }

            DateTime birthDate;
            try
            {
                birthDate = DateValidatorUtils.ParseToDate(birthDateStr);
            }
            catch
            {
                errorItems.Add(new ResponseErrorItem
                {
                    Key = $"Linha_{lineNumber}_BirthDate",
                    Value = $"Linha {lineNumber}: Data de nascimento inválida '{birthDateStr}'"
                });
                return null;
            }

            var address = new Address(
                "",
                addressLine ?? "",
                "",
                "",
                "",
                "",
                ""
            );

            var client = new Client(
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

    private class ImportResult
    {
        public int TotalRecords { get; set; }
        public int SuccessfulImports { get; set; }
        public int FailedImports { get; set; }
        public List<ResponseErrorItem> Errors { get; set; } = new();
    }
}
