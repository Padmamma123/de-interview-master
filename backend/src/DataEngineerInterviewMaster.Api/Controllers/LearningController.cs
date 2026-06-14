using DataEngineerInterviewMaster.Api.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace DataEngineerInterviewMaster.Api.Controllers;

[ApiController]
[Route("api/learning")]
public class LearningController : ControllerBase
{
    [HttpPost("plan")]
    public IActionResult GeneratePlan(LearningPathRequest request)
    {
        var result = new
        {
            request.UserId,
            request.CurrentExperience,
            request.TargetRole,
            skillGapAnalysis = new
            {
                strengths = new[] { "SQL Fundamentals", "ETL Concepts" },
                gaps = new[] { "System Design", "Performance Tuning", "Cloud Cost Optimization" }
            },
            recommendedTopics = new[]
            {
                "Spark Optimization",
                "Delta Lake",
                "Data Modeling",
                "RAG and Vector Databases",
                "CI/CD for Data Platforms"
            },
            dailyStudyPlan = new[]
            {
                "Day 1: SQL performance and indexing strategy",
                "Day 2: Spark execution plan and AQE deep dive",
                "Day 3: Databricks and Delta Lake internals",
                "Day 4: System design scenario practice",
                "Day 5: Mock interview and retrospective"
            },
            weeklyGoals = new[]
            {
                "Complete 50 interview questions",
                "Finish one architecture case study",
                "Improve weak-topic score by 15%"
            }
        };

        return Ok(result);
    }
}

