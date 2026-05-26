using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using System;

namespace Whatsapp_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HubAttachmentsController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _uploadsFolder;

        public HubAttachmentsController(IWebHostEnvironment env)
        {
            _env = env;
            // Create uploads/hub folder inside wwwroot
            _uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "hub");
            
            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }
        }

        // POST /api/HubAttachments/upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided.");
            }

            try
            {
                var fileName = DateTime.Now.ToString("yyyyMMddHHmmssfff") + "_" + Path.GetFileName(file.FileName);
                var filePath = Path.Combine(_uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativePath = $"/uploads/hub/{fileName}";
                
                return Ok(new 
                { 
                    url = relativePath, 
                    fileName = file.FileName,
                    size = file.Length 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
