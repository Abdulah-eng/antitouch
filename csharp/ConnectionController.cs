using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Antitouch.Models;

namespace Antitouch.Controllers
{
    [ApiController]
    [Route("api/diagrams/{diagramId}/connections")]
    public class ConnectionController : ControllerBase
    {
        private readonly ConnectionService _service;

        public ConnectionController(ConnectionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<ConnectionDto>>> GetConnections(string diagramId)
        {
            try
            {
                var connections = await _service.GetConnectionsAsync(diagramId);
                return Ok(connections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> SaveConnections(string diagramId, [FromBody] List<ConnectionDto> connections)
        {
            try
            {
                await _service.SaveConnectionsAsync(diagramId, connections);
                return Ok(new { message = "Connections saved successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    [ApiController]
    [Route("api/connections/lookups")]
    public class ConnectionLookupController : ControllerBase
    {
        private readonly ConnectionService _service;

        public ConnectionLookupController(ConnectionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<ConnectionTypeLookupDto>>> GetLookups()
        {
            try
            {
                var lookups = await _service.GetLookupsAsync();
                return Ok(lookups);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    [ApiController]
    [Route("api/connections/defaults")]
    public class ConnectionDefaultsController : ControllerBase
    {
        private readonly ConnectionService _service;

        public ConnectionDefaultsController(ConnectionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<ConnectionStyleDefaultDto>>> GetDefaults()
        {
            try
            {
                var defaults = await _service.GetStyleDefaultsAsync();
                return Ok(defaults);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> SaveDefaults([FromBody] List<ConnectionStyleDefaultDto> defaults)
        {
            try
            {
                await _service.SaveStyleDefaultsAsync(defaults);
                return Ok(new { message = "Style defaults saved successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
