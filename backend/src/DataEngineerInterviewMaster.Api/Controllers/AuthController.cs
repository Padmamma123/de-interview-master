using DataEngineerInterviewMaster.Api.Contracts;
using DataEngineerInterviewMaster.Application;
using DataEngineerInterviewMaster.Domain;
using Microsoft.AspNetCore.Mvc;

namespace DataEngineerInterviewMaster.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IUserRepository users, IAuthService auth) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken ct)
    {
        var existing = await users.GetByEmailAsync(request.Email, ct);
        if (existing is not null)
        {
            return Conflict("Email already exists.");
        }

        var user = await users.CreateAsync(new User
        {
            Email = request.Email,
            PasswordHash = auth.HashPassword(request.Password),
            FullName = request.FullName,
            ExperienceLevel = request.ExperienceLevel
        }, ct);

        var token = await auth.GenerateJwtAsync(user.Id, user.Email, ["User"]);
        return Ok(new { token, user = new { user.Id, user.Email, user.FullName, user.ExperienceLevel } });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var user = await users.GetByEmailAsync(request.Email, ct);
        if (user is null || user.PasswordHash is null || !auth.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials.");
        }

        var token = await auth.GenerateJwtAsync(user.Id, user.Email, ["User"]);
        return Ok(new { token, user = new { user.Id, user.Email, user.FullName, user.ExperienceLevel } });
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin(GoogleLoginRequest request, CancellationToken ct)
    {
        var user = await users.GetByEmailAsync(request.Email, ct)
                   ?? await users.CreateAsync(new User
                   {
                       Email = request.Email,
                       FullName = request.FullName,
                       GoogleId = request.GoogleId,
                       ExperienceLevel = request.ExperienceLevel
                   }, ct);

        var token = await auth.GenerateJwtAsync(user.Id, user.Email, ["User"]);
        return Ok(new { token, user = new { user.Id, user.Email, user.FullName, user.ExperienceLevel } });
    }
}

