using System.IO;

namespace Application.Common.Interfaces;

public interface IFileUpload
{
    string FileName { get; }
    string ContentType { get; }
    long Length { get; }
    Stream OpenReadStream();
}