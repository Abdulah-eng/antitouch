using Microsoft.AspNetCore.Mvc;
using Antitouch.Models;
using Antitouch.Services;

namespace Antitouch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagramCanvasController : ControllerBase
    {
        private readonly IDiagramCanvasService _service;

        public DiagramCanvasController(IDiagramCanvasService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDiagram(string id)
        {
            var result = await _service.GetDiagramAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveDiagram([FromBody] DiagramCanvasDto dto)
        {
            var result = await _service.SaveDiagramAsync(dto);
            if (result == null) return BadRequest("Failed to save diagram.");
            return Ok(result);
        }

        [HttpGet("list")]
        public async Task<IActionResult> ListDiagrams()
        {
            var result = await _service.ListDiagramsAsync();
            return Ok(result);
        }
    }
}
