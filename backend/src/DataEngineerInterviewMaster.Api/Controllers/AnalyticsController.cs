using Microsoft.AspNetCore.Mvc;

namespace DataEngineerInterviewMaster.Api.Controllers;

[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    [HttpGet("dashboard")]
    public IActionResult Dashboard()
    {
        return Ok(new
        {
            questionsSolved = 342,
            topicsCovered = 18,
            weakAreas = new[] { "Unity Catalog", "Event-Driven CDC", "Cost Governance" },
            strongAreas = new[] { "SQL", "PySpark", "Azure Data Factory" },
            mockInterviewScores = new[] { 52, 61, 68, 72, 79 },
            architectureScores = new[] { 40, 51, 62, 70, 76 },
            studyStreak = 12
        });
    }
}

