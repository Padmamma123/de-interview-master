using DataEngineerInterviewMaster.Application;
using Xunit;

namespace DataEngineerInterviewMaster.Application.Tests;

public class ScoringRulesTests
{
    [Fact]
    public void Category_ShouldReturnArchitect_WhenScoreIsNinetyOrMore()
    {
        var category = ScoringRules.Category(95);
        Assert.Equal("Architect", category);
    }

    [Fact]
    public void LengthBasedScore_ShouldClampToHundred()
    {
        var score = ScoringRules.LengthBasedScore(2000);
        Assert.Equal(100, score);
    }
}

