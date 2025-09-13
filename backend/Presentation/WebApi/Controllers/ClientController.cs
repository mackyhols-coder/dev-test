using Application.Client.Commands.CreateClient;
using Application.Client.Queries.AllClientsQuery;
using Application.Client.Queries.ClientByIdQuery;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Application.Client.Queries.ClientByDocumentQuery;
using Application.Client.Commands.UpdateClient;
using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Imports;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IImportJobService _importJobService;
        private readonly IImportQueue _importQueue;
        
        public ClientController(IMediator mediator, IImportJobService importJobService, IImportQueue importQueue)
        {
            _mediator = mediator;
            _importJobService = importJobService;
            _importQueue = importQueue;
        }

        [HttpPost]
        [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
        public async Task<IActionResult> Create([FromBody] CreateClientCommandRequest request)
        {
            var response = await _mediator.Send(request);
            return Ok(response);
        }

        [HttpPost("import")]
        [ProducesResponseType(typeof(StartImportResponse), StatusCodes.Status202Accepted)]
        [ProducesResponseType(typeof(ResponseError), StatusCodes.Status400BadRequest)]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<IActionResult> StartImport([FromForm] IFormFile file)
        {
            byte[] fileContent;
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                fileContent = memoryStream.ToArray();
            }

            var userId = User?.Identity?.Name ?? 
                         throw new Exception("O usuário não foi identificado.");

            var jobId = await _importJobService.StartImportJobAsync(file.FileName, fileContent, userId);

            var job = await _importJobService.GetJobStatusAsync(jobId);
            _importQueue.TryEnqueue(job);

            var response = new StartImportResponse
            {
                JobId = jobId,
                Message = "Importação iniciada com sucesso.",
                Status = "Accepted"
            };

            return Accepted(response);
        }

        [HttpGet("import/status/{jobId}")]
        [ProducesResponseType(typeof(ImportJob), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetImportStatus([FromRoute] Guid jobId)
        {
            var job = await _importJobService.GetJobStatusAsync(jobId);

            if (job == null)
            {
                return NotFound(new { message = "Job não encontrado" });
            }

            var response = new
            {
                job.Id,
                job.FileName,
                job.Status,
                job.CreatedAt,
                job.StartedAt,
                job.CompletedAt,
                job.ErrorMessage,
                job.TotalRecords,
                job.SuccessfulImports,
                job.FailedImports,
                job.ResultDetails
            };

            return Ok(response);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
        public async Task<IActionResult> Update([FromBody] UpdateClientCommandRequest request)
        {
            var response = await _mediator.Send(request);
            return Ok(response);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<AllClientsQueryResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListAll()
        {
            var response = await _mediator.Send(new AllClientsQueryRequest());
            return Ok(response);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ClientByIdQueryResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            var response = await _mediator.Send(new ClientByIdQueryRequest { Id = id });

            return Ok(response);
        }

        [HttpGet("document/{document}")]
        [ProducesResponseType(typeof(ClientByDocumentQueryResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByDocument([FromRoute] string document)
        {
            var decodedDocument = System.Web.HttpUtility.UrlDecode(document);

            var response = await _mediator.Send(new ClientByDocumentQueryRequest { DocumentNumber = decodedDocument });

            return Ok(response);
        }
    }
}
