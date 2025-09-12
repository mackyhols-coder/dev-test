using Application.Common.Models;

namespace Application.Common.Interfaces;

public interface IImportQueue
{
    bool TryEnqueue(ImportJob importJob);
    bool TryDequeue(out ImportJob importJob);
}