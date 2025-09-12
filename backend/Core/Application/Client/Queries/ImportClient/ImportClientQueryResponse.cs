using System.Collections.Generic;
using System.Linq;
using Application.Common.Models;

namespace Application.Client.Queries.ImportClient;

public class ImportClientQueryResponse
{
    public int TotalRecords { get; set; }
    public int SuccessfulImports { get; set; }
    public int FailedImports { get; set; }
    public List<string> SuccessMessages { get; set; } = new ();
    public ResponseError Error { get; set; }
    public bool HasErrors => Error != null && Error.Errors != null && Error.Errors.Any();
}