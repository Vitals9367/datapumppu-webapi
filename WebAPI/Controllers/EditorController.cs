using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using WebAPI.Controllers.DTOs;
using WebAPI.Controllers.Filters;
using WebAPI.Data;
using WebAPI.StorageClient;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("editor")]
    [TypeFilter(typeof(WebAPIExceptionFilter))]
    public class EditorController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EditorController> _logger;
        private readonly IStorageApiClient _storageApiClient;
        private readonly IMeetingDataProvider _cache;

        public EditorController(IConfiguration configuration,
            ILogger<EditorController> logger,
            IMeetingDataProvider cache,
            IStorageApiClient storageApiClient)
        {
            _configuration = configuration;
            _logger = logger;
            _cache = cache;
            _storageApiClient = storageApiClient;
        }

        [AllowAnonymous]
        [Route("login")]
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] UserDTO userLogin)
        {
            _logger.LogInformation("Executing Login()");

            if (await _storageApiClient.CheckLogin(userLogin.Username, userLogin.Password))
            {
                var token = GenerateToken();
                return Ok(new { token });
            }
            return Forbid();
        }

        [HttpPost("edit")]
        [Authorize]
        public async Task<IActionResult> UpdateAgendaPoint([FromBody] EditAgendaPointDTO editItem)
        {
            await _storageApiClient.UpdateAgendaPoint(editItem);
            await _cache.ResetCache();
            return Ok();
        }

        [HttpPost("videosync")]
        [Authorize]
        public async Task<IActionResult> UpdateVideoSync([FromBody] VideoSyncDTO videoSync)
        {
            await _storageApiClient.UpdateVideoSync(videoSync);
            return Ok();
        }

        [HttpGet]
        [Route("logout")]
        [Authorize]
        public ActionResult Logout()
        {
            return Ok();
        }

        private string GenerateToken()
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT_KEY"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(_configuration["JWT_ISSUER"],
                _configuration["JWT_AUDIENCE"],
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: credentials);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
};
