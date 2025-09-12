using System;

namespace Application.Imports;

public class StartImportResponse
{
    public Guid JobId { get; set; }
    public string Message { get; set; }
    public string Status { get; set; }
}