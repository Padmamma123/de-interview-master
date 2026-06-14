using Microsoft.AspNetCore.Mvc;

namespace DataEngineerInterviewMaster.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    [HttpGet("prompts")]
    public IActionResult GetPrompts()
    {
        return Ok(new[]
        {
            new { key = "QuestionGeneration", version = 1, isActive = true },
            new { key = "MockInterviewScoring", version = 1, isActive = true },
            new { key = "LearningPathPlanner", version = 1, isActive = true }
        });
    }
}

