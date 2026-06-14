using DataEngineerInterviewMaster.Api.Contracts;
using DataEngineerInterviewMaster.Application;
using Microsoft.AspNetCore.Mvc;

namespace DataEngineerInterviewMaster.Api.Controllers;

[ApiController]
[Route("api/questions")]
public class QuestionController(IQuestionGenerationService questionService) : ControllerBase
{
    [HttpPost("generate")]
    public async Task<IActionResult> Generate(GenerateQuestionsApiRequest request, CancellationToken ct)
    {
        var result = await questionService.GenerateAsync(new GenerateQuestionsRequest(
            request.Topic,
            request.Difficulty,
            request.ExperienceLevel,
            request.QuestionType,
            request.Count), ct);
        return Ok(result);
    }
}

