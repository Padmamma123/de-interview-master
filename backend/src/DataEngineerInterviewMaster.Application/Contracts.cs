namespace DataEngineerInterviewMaster.Application;

public record GenerateQuestionsRequest(
    string Topic,
    string Difficulty,
    string ExperienceLevel,
    string QuestionType,
    int Count);

public record GeneratedQuestionDto(
    Guid Id,
    string Topic,
    string Difficulty,
    string ExperienceLevel,
    string QuestionType,
    string Question,
    string[] Hints,
    string ExpectedAnswer,
    string[] CommonMistakes,
    string[] FollowUpQuestions,
    string[] RealWorldUseCases,
    string[] References,
    string[] ApproachComparisons);

public record ChatRequest(string UserId, string Question, string Topic);

public record VisualLesson(
    string Title,
    string SimpleIdea,
    string PictureStory,
    string MermaidDiagram,
    string[] Steps,
    string MemoryTrick,
    string RealWorldExample,
    string InterviewTip);

public record ChatResponse(string Answer, string[] Sources, VisualLesson? Lesson = null);

public record MockInterviewAnswerRequest(
    Guid MockInterviewId,
    Guid QuestionId,
    string Answer,
    int DurationSeconds);

public record ScoreBreakdown(
    int TechnicalAccuracy,
    int Communication,
    int Depth,
    int OptimizationThinking,
    int ArchitectureThinking,
    int Overall,
    string Category,
    string[] Strengths,
    string[] Improvements);

public interface IQuestionGenerationService
{
    Task<IReadOnlyCollection<GeneratedQuestionDto>> GenerateAsync(GenerateQuestionsRequest request, CancellationToken ct = default);
}

public interface IChatAssistantService
{
    Task<ChatResponse> AskAsync(ChatRequest request, CancellationToken ct = default);
}

public interface IScoringEngine
{
    Task<ScoreBreakdown> EvaluateAsync(MockInterviewAnswerRequest request, CancellationToken ct = default);
}

public interface IAuthService
{
    Task<string> GenerateJwtAsync(Guid userId, string email, IEnumerable<string> roles);
    string HashPassword(string rawPassword);
    bool VerifyPassword(string rawPassword, string hash);
}

public interface IUserRepository
{
    Task<DataEngineerInterviewMaster.Domain.User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<DataEngineerInterviewMaster.Domain.User> CreateAsync(DataEngineerInterviewMaster.Domain.User user, CancellationToken ct = default);
}

