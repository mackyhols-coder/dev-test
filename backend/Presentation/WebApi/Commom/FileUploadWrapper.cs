using System.IO;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace WebApi.Commom;

public class FileUploadWrapper : IFileUpload
{
    private readonly IFormFile _formFile;

    public FileUploadWrapper(IFormFile formFile)
    {
        _formFile = formFile;
    }

    public string FileName => _formFile.FileName;
    public string ContentType => _formFile.ContentType;
    public long Length => _formFile.Length;

    public Stream OpenReadStream()
    {
        return _formFile.OpenReadStream();
    }
}