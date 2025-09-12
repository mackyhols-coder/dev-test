using System;
using Application.Common.Enums;

namespace Application.Common.Models;

public class ImportJob
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public string FileName { get; set; }
    public byte[] FileContent { get; set; }
    public EImportJobStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string ErrorMessage { get; set; }
    public int? TotalRecords { get; set; }
    public int? SuccessfulImports { get; set; }
    public int? FailedImports { get; set; }
    public string ResultDetails { get; set; }
}