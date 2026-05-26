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
    public class StickersController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _stickersFolder;

        public StickersController(IWebHostEnvironment env)
        {
            _env = env;
            // Folder: wwwroot/uploads/stickers
            _stickersFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "stickers");
            
            if (!Directory.Exists(_stickersFolder))
            {
                Directory.CreateDirectory(_stickersFolder);
            }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadSticker([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No image provided.");
            }

            try
            {
                // Generate unique name for the sticker
                var fileName = "stk_" + DateTime.Now.ToString("yyyyMMddHHmmssfff") + ".png";
                var filePath = Path.Combine(_stickersFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return the public URL
                var relativePath = $"/uploads/stickers/{fileName}";
                
                return Ok(new 
                { 
                    url = relativePath,
                    success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
