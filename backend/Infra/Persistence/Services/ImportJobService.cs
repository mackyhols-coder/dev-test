using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Application.Common.Enums;
using Application.Common.Interfaces;
using Application.Common.Models;

namespace Persistence.Services;

public class ImportJobService : IImportJobService
{
    private readonly ConcurrentDictionary<Guid, ImportJob> _jobs = new();

    public Task<ImportJob> GetJobStatusAsync(Guid jobId)
    {
        _jobs.TryGetValue(jobId, out var job);
        return Task.FromResult(job);
    }

    public Task<Guid> StartImportJobAsync(string fileName, byte[] fileContent, string userId)
    {
        var jobId = Guid.NewGuid();
        var job = new ImportJob
        {
            Id = jobId,
            UserId = userId,
            FileName = fileName,
            FileContent = fileContent,
            Status = EImportJobStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _jobs.TryAdd(jobId, job);
        return Task.FromResult(jobId);
    }

    public Task UpdateJobStatusAsync(Guid jobId, EImportJobStatus status, string errorMessage = null)
    {
        if (_jobs.TryGetValue(jobId, out var job))
        {
            job.Status = status;
            if (status == EImportJobStatus.Processing)
                job.StartedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(errorMessage))
                job.ErrorMessage = errorMessage;
        }
        return Task.CompletedTask;
    }

    public Task CompleteJobAsync(Guid jobId, int totalRecords, int successfulImports, int failedImports, string resultDetails)
    {
        if (_jobs.TryGetValue(jobId, out var job))
        {
            job.Status = EImportJobStatus.Completed;
            job.CompletedAt = DateTime.UtcNow;
            job.TotalRecords = totalRecords;
            job.SuccessfulImports = successfulImports;
            job.FailedImports = failedImports;
            job.ResultDetails = resultDetails;
        }
        return Task.CompletedTask;
    }
}