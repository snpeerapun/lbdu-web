using LBDUSite.Models;
using LBDUSite.Repository.Interfaces;
using LBDUSite.WebAPI.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace LBDUSite.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : BaseApiController
    {
        private readonly IRepositoryFactory _repo;
        private readonly string _uploadPath;

        public DocumentController(IRepositoryFactory repo, IConfiguration configuration)
        {
            _repo = repo;
            _uploadPath = configuration["UploadSettings:BasePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
        }

        /// <summary>
        /// Upload multiple customer documents
        /// </summary>
        [Route("upload")]
        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> Upload([FromForm] DocumentUploadModel model)
        {
            try
            {
                // Validate files
                if (model.File == null)
                    return BadRequest(new { message = "No files selected" });

                // Validate JSON data
                if (string.IsNullOrEmpty(model.JsonData))
                    return BadRequest(new { message = "No document data provided" });

                // Deserialize JSON data
                Document metadata;
                try
                {
                    metadata = JsonConvert.DeserializeObject<Document>(model.JsonData);
                }
                catch (JsonException ex)
                {
                    return BadRequest(new { message = $"Invalid JSON data: {ex.Message}" });
                }

                // Validate metadata
                if (metadata.CustomerId == null || metadata.CustomerId <= 0)
                    return BadRequest(new { message = "Customer ID is required" });

                if (metadata.DocumentTypeId <= 0)
                    return BadRequest(new { message = "Document Category is required" });

                // Create directory if not exists
                string customerPath = Path.Combine(_uploadPath, "Documents", metadata.CustomerId.ToString());
                if (!Directory.Exists(customerPath))
                    Directory.CreateDirectory(customerPath);

                var uploadedDocuments = new List<Document>();

                _repo.BeginTransaction();

                try
                {
                  
                     
                    var file = model.File;
                    
                    // Validate file size (max 10MB per file)
                    if (file.Length > 10 * 1024 * 1024)
                    {
                        throw new Exception($"File {file.FileName} exceeds maximum size of 10MB");
                    }

                    // Validate file extension
                    var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xlsx", ".xls" };
                    var extension = Path.GetExtension(file.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        throw new Exception($"File type {extension} is not allowed");
                    }

                    // Generate unique filename
                    string uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    string filePath = Path.Combine(customerPath, uniqueFileName);

                    // Save file to disk
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    // Create database record
                    var document = new Document
                    {
                        CustomerId = metadata.CustomerId,
                        DocumentTypeId = metadata.DocumentTypeId,
                        FileName = uniqueFileName,
                        FilePath = Path.Combine("Documents", metadata.CustomerId.ToString(), uniqueFileName),
                        ContentType = file.ContentType,
                        EffectiveFrom = metadata.EffectiveFrom,
                        EffectiveTo = metadata.EffectiveTo,
                        IsActive = true,
                        CreatedAt = DateTime.Now,
                        CreatedBy = base.userInfo.Id
                    };

                    document.Id = _repo.Insert(document);
                    uploadedDocuments.Add(document);
                    _repo.Commit();

                    return Ok(new
                    {
                        message = $"Successfully uploaded {uploadedDocuments.Count} file(s)",
                        data = uploadedDocuments
                    });
                }
                catch (Exception ex)
                {
                    _repo.Rollback();

                    // Clean up uploaded files on error
                    foreach (var doc in uploadedDocuments)
                    {
                        var fileToDelete = Path.Combine(_uploadPath, doc.FilePath);
                        if (System.IO.File.Exists(fileToDelete))
                        {
                            System.IO.File.Delete(fileToDelete);
                        }
                    }

                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred: {ex.Message}" });
            }
        }
        [Route("view/{id}")]
        [HttpGet]
        public IActionResult ViewDocument(long id)
        {
            try
            {
                var document = _repo.FindById<Document>(id);
                if (document == null)
                    return NotFound(new { message = "Document not found" });

                string filePath = Path.Combine(_uploadPath, "Documents", document.CustomerId.ToString(), document.FileName);
                if (!System.IO.File.Exists(filePath))
                    return NotFound(new { message = "File not found" });

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = document.ContentType ?? "application/octet-stream";

                // ✅ INLINE - แสดงในเบราว์เซอร์
                Response.Headers.Add("Content-Disposition", $"inline; filename=\"{document.FileName}\"");

                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        /// <summary>
        /// Download customer document
        /// </summary>
        [Route("download/{id}")]
        [HttpGet]
        public IActionResult Download(long id)
        {
            try
            {
                var document = _repo.FindById<Document>(id);
                if (document == null)
                    return NotFound(new { message = "Document not found" });

                //var filePath = Path.Combine(_uploadPath, document.FilePath);
                string filePath = Path.Combine(_uploadPath, "Documents", document.CustomerId.ToString(),document.FileName);
                if (!System.IO.File.Exists(filePath))
                    return NotFound(new { message = "File not found on server" });

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = document.ContentType ?? "application/octet-stream";

                return File(fileBytes, contentType, document.FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred: {ex.Message}" });
            }
        }

        /// <summary>
        /// Get documents by customer
        /// </summary>
        [Route("list/{customerId}")]
        [HttpGet]
        public IActionResult GetByCustomer(long customerId)
        {
            try
            {
                var documents = _repo.Fetch<Document>()
                    .Where(new { customerId = customerId })
                    .Include<DocumentType>()
                    .OrderBy("CreatedAt DESC")
                    .ToList();

                return Ok(documents);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }



        /// <summary>
        /// Delete document
        /// </summary>
        [Route("delete/{id}")]
        [HttpDelete]
        public IActionResult Delete(long id)
        {
            try
            {
                var document = _repo.FindById<Document>(id);
                if (document == null)
                    return NotFound(new { message = "Document not found" });

                // Delete physical file
                string filePath = Path.Combine(_uploadPath, "Documents", document.CustomerId.ToString(),document.FileName);
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                else 
                    return NotFound(new { message = "File not found on server" });

                    // Delete database record
                    _repo.Delete(document);

                return Ok(new { message = "Document deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred: {ex.Message}" });
            }
        }

        /// <summary>
        /// Soft delete (set IsActive to false)
        /// </summary>
        [Route("deactivate/{id}")]
        [HttpPut]
        public IActionResult Deactivate(long id)
        {
            try
            {
                var document = _repo.FindById<Document>(id);
                if (document == null)
                    return NotFound(new { message = "Document not found" });

                document.IsActive = false;
                _repo.Update(document);

                return Ok(new { message = "Document deactivated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update document metadata
        /// </summary>
        [Route("update/{id}")]
        [HttpPut]
        public IActionResult Update(long id, [FromBody] DocumentUpdateModel model)
        {
            try
            {
                var document = _repo.FindById<Document>(id);
                if (document == null)
                    return NotFound(new { message = "Document not found" });

                document.DocumentTypeId = model.DocumentTypeId;
                document.EffectiveFrom = model.EffectiveFrom;
                document.EffectiveTo = model.EffectiveTo;
                document.IsActive = model.IsActive;

                _repo.Update(document);

                return Ok(new { message = "Document updated successfully", data = document });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    #region Request Models

    public class DocumentUploadModel
    {
        public IFormFile File { get; set; }
        public string JsonData { get; set; }
    }

  

    public class DocumentUpdateModel
    {
        public int DocumentTypeId { get; set; }
  
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public bool IsActive { get; set; }
    }

    #endregion
}