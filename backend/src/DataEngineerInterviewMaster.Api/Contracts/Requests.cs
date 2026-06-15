namespace DataEngineerInterviewMaster.Api.Contracts;

public record RegisterRequest(string Email, string Password, string FullName, string ExperienceLevel);
public record LoginRequest(string Email, string Password);
public record GoogleLoginRequest(string Email, string FullName, string GoogleId, string ExperienceLevel);

public record GenerateQuestionsApiRequest(
    string Topic,
    string Difficulty,
    string ExperienceLevel,
    string QuestionType,
    int Count = 25);

public record ChatApiRequest(string UserId, string Question, string Topic);
public record MockEvaluateRequest(Guid MockInterviewId, Guid QuestionId, string Answer, int DurationSeconds);
public record LearningPathRequest(Guid UserId, string CurrentExperience, string TargetRole);

