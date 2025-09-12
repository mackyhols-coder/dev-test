using System;
using System.Threading.Tasks;
using Application.Common.Enums;
using Application.Common.Models;

namespace Application.Common.Interfaces;

public interface IImportJobService
{
    Task<ImportJob> GetJobStatusAsync(Guid jobId);
    Task<Guid> StartImportJobAsync(string fileName, byte[] fileContent, string userId);
    Task UpdateJobStatusAsync(Guid jobId, EImportJobStatus status, string errorMessage = null);
    Task CompleteJobAsync(Guid jobId, int totalRecords, int successfulImports, int failedImports, string resultDetails);
}