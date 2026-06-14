using DataEngineerInterviewMaster.Api.Contracts;
using DataEngineerInterviewMaster.Application;
using Microsoft.AspNetCore.Mvc;

namespace DataEngineerInterviewMaster.Api.Controllers;

[ApiController]
[Route("api/mock-interviews")]
public class MockInterviewController(IScoringEngine scoringEngine) : ControllerBase
{
    [HttpPost("evaluate-answer")]
    public async Task<IActionResult> EvaluateAnswer(MockEvaluateRequest request, CancellationToken ct)
    {
        var score = await scoringEngine.EvaluateAsync(new MockInterviewAnswerRequest(
            request.MockInterviewId, request.QuestionId, request.Answer, request.DurationSeconds), ct);

        return Ok(score);
    }
}

