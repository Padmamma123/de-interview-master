using Microsoft.AspNetCore.Mvc;

namespace DataEngineerInterviewMaster.Api.Controllers;

[ApiController]
[Route("api/system-design")]
public class SystemDesignController : ControllerBase
{
    [HttpGet("scenarios")]
    public IActionResult GetScenarios()
    {
        return Ok(new[]
        {
            Build("Design Netflix Analytics Platform"),
            Build("Design Uber Real-Time Tracking"),
            Build("Design Data Lakehouse"),
            Build("Design CDC Pipeline"),
            Build("Design Fraud Detection System"),
            Build("Design Customer 360 Platform"),
            Build("Design Multi-Tenant Data Platform"),
            Build("Design Data Mesh")
        });
    }

    private static object Build(string title) => new
    {
        title,
        requirements = new[] { "Latency SLO", "Data freshness", "RBAC" },
        highLevelDesign = "Ingestion + processing + serving + governance layers",
        lowLevelDesign = "Partitioning, schema evolution, checkpointing and retries",
        dataFlow = "Events -> Bronze -> Silver -> Gold -> BI/ML consumers",
        tradeoffs = new[] { "Cost vs latency", "Consistency vs availability" },
        scaling = "Horizontal scaling with autoscaling workers and storage tiering",
        monitoring = "Data quality checks, lag, failures, and SLA alerts",
        costOptimization = "Storage lifecycle, compute scheduling, and spot usage"
    };
}

