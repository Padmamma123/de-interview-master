using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DataEngineerInterviewMaster.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddGroq(configuration);
        services.AddScoped<IQuestionGenerationService, QuestionGenerationService>();
        services.AddScoped<IChatAssistantService, ChatAssistantService>();
        services.AddScoped<IScoringEngine, ScoringEngine>();
        return services;
    }
}


internal sealed class QuestionGenerationService(GroqAiClient groq) : IQuestionGenerationService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<IReadOnlyCollection<GeneratedQuestionDto>> GenerateAsync(
        GenerateQuestionsRequest request,
        CancellationToken ct = default)
    {
        var count = Math.Clamp(request.Count, 1, 5);
        var results = new List<GeneratedQuestionDto>();

        for (var i = 0; i < count; i++)
        {
            try
            {
                var prompt = $$"""
                    Return JSON for one interview question with fields:
                    question, expectedAnswer, hints, commonMistakes, followUpQuestions,
                    realWorldUseCases, references, approachComparisons

                    Topic: {{request.Topic}}
                    Difficulty: {{request.Difficulty}}
                    Experience: {{request.ExperienceLevel}}
                    Question Type: {{request.QuestionType}}
                    Question number: {{i + 1}} of {{count}} (make it unique)
                    approachComparisons must contain 4 strings.
                    """;

                var content = await groq.CompleteAsync(prompt, ct, jsonMode: false);
                var json = GroqAiClient.ExtractJsonPayload(content);
                var item = JsonSerializer.Deserialize<GeneratedQuestionPayload>(json, JsonOptions);
                if (item is not null && !string.IsNullOrWhiteSpace(item.Question))
                {
                    results.Add(MapQuestion(item, request));
                }
            }
            catch
            {
                continue;
            }
        }

        if (results.Count > 0)
        {
            return results;
        }

        return [BuildFallback(request)];
    }

    private static GeneratedQuestionDto MapQuestion(GeneratedQuestionPayload item, GenerateQuestionsRequest request) =>
        new(
            Guid.TryParse(item.Id, out var id) ? id : Guid.NewGuid(),
            item.Topic ?? request.Topic,
            item.Difficulty ?? request.Difficulty,
            item.ExperienceLevel ?? request.ExperienceLevel,
            item.QuestionType ?? request.QuestionType,
            item.Question ?? "Explain your approach to this data engineering scenario.",
            item.Hints ?? [],
            item.ExpectedAnswer ?? "",
            item.CommonMistakes ?? [],
            item.FollowUpQuestions ?? [],
            item.RealWorldUseCases ?? [],
            item.References ?? [],
            item.ApproachComparisons ?? []);

    private static GeneratedQuestionDto BuildFallback(GenerateQuestionsRequest request) =>
        new(
            Guid.NewGuid(),
            request.Topic,
            request.Difficulty,
            request.ExperienceLevel,
            request.QuestionType,
            $"How would you design a production-grade {request.Topic} pipeline for large-scale data?",
            ["Discuss batch vs streaming", "Cover fault tolerance and monitoring"],
            "Compare ETL, Spark, Kafka streaming, and event-driven architecture with trade-offs.",
            ["Ignoring partitioning", "No cost or SLA analysis"],
            ["How do you monitor SLA breaches?", "How do you handle schema drift?"],
            ["Large-scale clickstream analytics", "Enterprise data lake ingestion"],
            ["Official docs", "Architecture blogs"],
            [
                "Traditional ETL: lower complexity, limited scale",
                "Spark batch: balanced cost and performance",
                "Kafka + Spark streaming: near real-time and scalable",
                "Event-driven architecture: high flexibility, higher operational complexity"
            ]);
}

internal sealed class ChatAssistantService(GroqAiClient groq) : IChatAssistantService
{
    public async Task<ChatResponse> AskAsync(ChatRequest request, CancellationToken ct = default)
    {
        var prompt = $"""
            You are an expert Data Engineering interview coach.
            Topic: {request.Topic}
            User request: {request.Question}

            Format your response using clear lists:
            - Use numbered lists (1., 2., 3.) for interview questions or sequential steps
            - Use bullet lists (- item) for hints, trade-offs, pitfalls, and examples
            - Keep each list item concise and interview-ready

            If the user asks to generate questions, return each question as a numbered list item.
            Include hints and expected answer points as nested bullet lists under each question when helpful.
            """;

        try
        {
            var answer = await groq.CompleteAsync(prompt, ct);
            return new ChatResponse(answer, ["groq"]);
        }
        catch (InvalidOperationException ex)
        {
            return new ChatResponse(
                $"The AI assistant is temporarily unavailable. {ex.Message}",
                []);
        }
    }
}

internal sealed class ScoringEngine : IScoringEngine
{
    public Task<ScoreBreakdown> EvaluateAsync(MockInterviewAnswerRequest request, CancellationToken ct = default)
    {
        var lenScore = ScoringRules.LengthBasedScore(request.Answer.Length);
        var communication = ScoringRules.CommunicationScore(request.DurationSeconds);
        var depth = Math.Clamp(lenScore - 5, 20, 100);
        var optimization = Math.Clamp(lenScore - 10, 20, 100);
        var architecture = Math.Clamp(lenScore - 12, 20, 100);
        var overall = (lenScore + communication + depth + optimization + architecture) / 5;
        var category = ScoringRules.Category(overall);

        return Task.FromResult(new ScoreBreakdown(
            lenScore,
            communication,
            depth,
            optimization,
            architecture,
            overall,
            category,
            ["Clear structure", "Good practical context"],
            ["Add quantitative metrics", "Cover trade-offs deeper"]));
    }
}
