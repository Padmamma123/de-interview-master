namespace DataEngineerInterviewMaster.Domain;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? GoogleId { get; set; }
    public string ExperienceLevel { get; set; } = "Fresher";
    public string? CurrentRole { get; set; }
    public string? TargetRole { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Topic
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
}

public class Question
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TopicId { get; set; }
    public string Difficulty { get; set; } = "Easy";
    public string ExperienceLevel { get; set; } = "Fresher";
    public string QuestionType { get; set; } = "Conceptual";
    public string QuestionText { get; set; } = string.Empty;
    public string ExpectedAnswer { get; set; } = string.Empty;
    public string[] Hints { get; set; } = [];
    public string[] CommonMistakes { get; set; } = [];
    public string[] FollowUpQuestions { get; set; } = [];
    public string[] RealWorldUseCases { get; set; } = [];
    public string[] References { get; set; } = [];
    public string[] Approaches { get; set; } = [];
}

public class QuestionAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid QuestionId { get; set; }
    public string? SubmittedAnswer { get; set; }
    public int Score { get; set; }
    public string FeedbackJson { get; set; } = "{}";
    public int DurationSeconds { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class MockInterview
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string InterviewType { get; set; } = "System Design";
    public string Difficulty { get; set; } = "Medium";
    public string ExperienceLevel { get; set; } = "2-4 Years";
    public int TotalQuestions { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
}

public class InterviewResult
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MockInterviewId { get; set; }
    public int TechnicalAccuracyScore { get; set; }
    public int CommunicationScore { get; set; }
    public int DepthScore { get; set; }
    public int OptimizationThinkingScore { get; set; }
    public int ArchitectureThinkingScore { get; set; }
    public int OverallScore { get; set; }
    public string Category { get; set; } = "Intermediate";
}

public class StudyPlan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string TargetRole { get; set; } = string.Empty;
    public string CurrentExperienceLevel { get; set; } = string.Empty;
    public string SkillGapAnalysisJson { get; set; } = "{}";
    public string DailyPlanJson { get; set; } = "[]";
    public string WeeklyGoalsJson { get; set; } = "[]";
}

