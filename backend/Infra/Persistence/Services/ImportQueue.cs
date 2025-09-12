using System.Collections.Concurrent;
using Application.Common.Interfaces;
using Application.Common.Models;

namespace Persistence.Services;

public class ImportQueue : IImportQueue
{
    private readonly ConcurrentQueue<ImportJob> _queue = new();

    public bool TryEnqueue(ImportJob importJob)
    {
        _queue.Enqueue(importJob);
        return true;
    }

    public bool TryDequeue(out ImportJob importJob)
    {
        return _queue.TryDequeue(out importJob);
    }
}
