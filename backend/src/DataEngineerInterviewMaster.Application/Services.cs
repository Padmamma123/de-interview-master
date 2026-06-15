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

    // Upper bound on how many questions a single request may produce. Kept at a
    // value that is reliably achievable on Groq's free tier within the frontend's
    // 120s request budget (small batches + pacing + retries).
    private const int MaxQuestions = 20;

    // Questions requested per AI call. Smaller batches keep each JSON response
    // well within the model's output-token limit so it is never truncated into
    // invalid JSON, while still reducing round trips versus one call per question.
    private const int BatchSize = 5;

    // Attempts per batch before giving up on that batch.
    private const int MaxAttemptsPerBatch = 2;

    // Pause between batches to avoid bursting into free-tier rate limits.
    private static readonly TimeSpan BatchDelay = TimeSpan.FromMilliseconds(400);

    public async Task<IReadOnlyCollection<GeneratedQuestionDto>> GenerateAsync(
        GenerateQuestionsRequest request,
        CancellationToken ct = default)
    {
        var count = Math.Clamp(request.Count, 1, MaxQuestions);
        var results = new List<GeneratedQuestionDto>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var produced = 0;
        while (results.Count < count && produced < count * 2)
        {
            var take = Math.Min(BatchSize, count - results.Count);
            var addedBefore = results.Count;

            foreach (var item in await GenerateBatchAsync(request, results.Count, take, count, ct))
            {
                if (item is null || string.IsNullOrWhiteSpace(item.Question))
                {
                    continue;
                }

                var dto = MapQuestion(item, request);
                if (seen.Add(dto.Question.Trim().ToLowerInvariant()))
                {
                    results.Add(dto);
                }
            }

            produced += Math.Max(take, results.Count - addedBefore);

            if (results.Count == addedBefore)
            {
                produced += 1;
            }

            if (results.Count < count)
            {
                try
                {
                    await Task.Delay(BatchDelay, ct);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        // Always return whatever we managed to build. Only fall back to a single
        // canned question when every batch failed (e.g. AI unavailable).
        if (results.Count > 0)
        {
            return results;
        }

        return [BuildFallback(request)];
    }

    private async Task<List<GeneratedQuestionPayload>> GenerateBatchAsync(
        GenerateQuestionsRequest request,
        int produced,
        int take,
        int count,
        CancellationToken ct)
    {
        var topicGuidance = BuildTopicGuidance(request.Topic);

        var prompt = $$"""
            Return ONLY a JSON object with this exact shape:
            {"questions": [ { "question": "", "expectedAnswer": "", "hints": [],
            "commonMistakes": [], "followUpQuestions": [ { "question": "", "answer": "" } ],
            "approachComparisons": [] } ]}

            The "questions" array must contain exactly {{take}} unique data engineering interview questions.
            Topic: {{request.Topic}}
            Difficulty: {{request.Difficulty}}
            Experience: {{request.ExperienceLevel}}
            Question Type: {{request.QuestionType}}
            These are questions {{produced + 1}} to {{produced + take}} of {{count}} total; do not repeat questions.
            Every question must be specifically about {{request.Topic}}.
            hints and commonMistakes must each contain 2-4 strings.
            followUpQuestions must contain 2-3 objects with question and answer fields.
            approachComparisons must contain exactly 4 strings.
            Keep questions aligned with recent 2025-2026 interview trends from LinkedIn, Medium, and GitHub:
            scenario-based troubleshooting, production reliability, governance/security, performance tuning, and cost control.
            Topic guidance: {{topicGuidance}}
            Respond with the JSON object only, no markdown or commentary.
            """;

        for (var attempt = 0; attempt < MaxAttemptsPerBatch; attempt++)
        {
            try
            {
                var content = await groq.CompleteAsync(prompt, ct, jsonMode: true);
                var parsed = ParseQuestions(content);
                if (parsed.Count > 0)
                {
                    return parsed;
                }
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch
            {
                // Transient failure (rate limit, truncated JSON). Back off and retry.
            }

            if (attempt + 1 < MaxAttemptsPerBatch)
            {
                try
                {
                    await Task.Delay(TimeSpan.FromMilliseconds(750 * (attempt + 1)), ct);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        return [];
    }

    private static List<GeneratedQuestionPayload> ParseQuestions(string content)
    {
        // Preferred shape: a JSON object { "questions": [ ... ] } (enforced JSON mode).
        try
        {
            var objectJson = GroqAiClient.ExtractJsonPayload(content);
            var batch = JsonSerializer.Deserialize<GeneratedQuestionBatch>(objectJson, JsonOptions);
            if (batch?.Questions is { Count: > 0 })
            {
                return batch.Questions;
            }
        }
        catch
        {
            // Fall through to array parsing.
        }

        // Fallback: a bare JSON array of question objects.
        try
        {
            var arrayJson = GroqAiClient.ExtractJsonArrayPayload(content);
            var array = JsonSerializer.Deserialize<List<GeneratedQuestionPayload>>(arrayJson, JsonOptions);
            if (array is { Count: > 0 })
            {
                return array;
            }
        }
        catch
        {
            // Fall through to single-object parsing.
        }

        // Fallback: a single question object.
        try
        {
            var objectJson = GroqAiClient.ExtractJsonPayload(content);
            var single = JsonSerializer.Deserialize<GeneratedQuestionPayload>(objectJson, JsonOptions);
            if (single is not null && !string.IsNullOrWhiteSpace(single.Question))
            {
                return [single];
            }
        }
        catch
        {
            // Ignore and return empty.
        }

        return [];
    }

    private static string BuildTopicGuidance(string topic)
    {
        var t = topic.Trim().ToLowerInvariant();
        if (t.Contains("databricks") || t.Contains("spark") || t.Contains("delta"))
        {
            return "Include AQE, skew handling, OPTIMIZE/VACUUM, streaming checkpoints, DLT/Workflows, and Unity Catalog governance scenarios.";
        }

        if (t.Contains("fabric") || t.Contains("onelake") || t.Contains("synapse") || t.Contains("adf"))
        {
            return "Include Azure-native architecture choices, Event Hubs/ADF orchestration, Fabric vs Databricks trade-offs, and operational monitoring scenarios.";
        }

        if (t.Contains("sql") || t.Contains("model"))
        {
            return "Include window functions, SCD2, CDC merge logic, query plan/performance tuning, and schema evolution incidents.";
        }

        if (t.Contains("airflow") || t.Contains("dbt") || t.Contains("ci/cd") || t.Contains("github") || t.Contains("devops"))
        {
            return "Include deployment pipelines, testing strategy, rollback planning, lineage/docs, and data contract enforcement.";
        }

        if (t.Contains("governance") || t.Contains("quality") || t.Contains("observability") || t.Contains("cost"))
        {
            return "Include SLA/SLO metrics, alerting and incident response, PII controls, lineage/auditability, and cloud cost optimization actions.";
        }

        return "Prioritize production-ready, scenario-based, trade-off focused questions with measurable outcomes.";
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
            MapFollowUps(item.FollowUpQuestions),
            item.ApproachComparisons ?? []);

    private static FollowUpQa[] MapFollowUps(List<FollowUpQaPayload>? items) =>
        items?
            .Where(x => !string.IsNullOrWhiteSpace(x.Question))
            .Select(x => new FollowUpQa(x.Question!.Trim(), x.Answer?.Trim() ?? ""))
            .ToArray() ?? [];

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
            [
                new("How do you monitor SLA breaches?", "Track pipeline latency, freshness, and error-rate metrics with alerts tied to SLA thresholds."),
                new("How do you handle schema drift?", "Use schema contracts, backward-compatible transforms, and automated validation before promotion.")
            ],
            [
                "Traditional ETL: lower complexity, limited scale",
                "Spark batch: balanced cost and performance",
                "Kafka + Spark streaming: near real-time and scalable",
                "Event-driven architecture: high flexibility, higher operational complexity"
            ]);
}

internal sealed class VisualLessonPayload
{
    public string? Title { get; set; }
    public string? SimpleIdea { get; set; }
    public string? PictureStory { get; set; }
    public string? MermaidDiagram { get; set; }
    public string[]? Steps { get; set; }
    public string? MemoryTrick { get; set; }
    public string? RealWorldExample { get; set; }
    public string? InterviewTip { get; set; }
}

internal sealed class ChatAssistantService(GroqAiClient groq) : IChatAssistantService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<ChatResponse> AskAsync(ChatRequest request, CancellationToken ct = default)
    {
        var prompt = $$"""
            You teach Data Engineering to absolute beginners (explain like a 2nd grade student).
            Topic: {{request.Topic}}
            Question: {{request.Question}}

            Return JSON only with this exact shape:
            {
              "title": "short fun title",
              "simpleIdea": "one sentence a child can understand",
              "pictureStory": "a vivid story or scene the learner can picture in their mind (use everyday objects)",
              "mermaidDiagram": "valid mermaid flowchart LR or graph TD with 3-6 nodes max, simple labels",
              "steps": ["step 1", "step 2", "step 3"],
              "memoryTrick": "a rhyme, acronym, or silly image trick to remember for days",
              "realWorldExample": "where companies use this in real life",
              "interviewTip": "one line for interview prep"
            }

            Rules:
            - Use simple words, short sentences, friendly tone
            - pictureStory must feel like watching a cartoon in your head
            - mermaidDiagram must be valid mermaid syntax only (no markdown fences)
            - steps must be 3-5 tiny actions
            """;

        try
        {
            var content = await groq.CompleteAsync(prompt, ct, jsonMode: true);
            var json = GroqAiClient.ExtractJsonPayload(content);
            var parsed = JsonSerializer.Deserialize<VisualLessonPayload>(json, JsonOptions);

            if (parsed is not null && !string.IsNullOrWhiteSpace(parsed.SimpleIdea))
            {
                var lesson = new VisualLesson(
                    parsed.Title ?? request.Topic,
                    parsed.SimpleIdea ?? "",
                    parsed.PictureStory ?? "",
                    parsed.MermaidDiagram ?? "flowchart LR\n  A[You ask] --> B[AI explains] --> C[You remember]",
                    parsed.Steps ?? [],
                    parsed.MemoryTrick ?? "",
                    parsed.RealWorldExample ?? "",
                    parsed.InterviewTip ?? "");

                var summary = BuildSummary(lesson);
                return new ChatResponse(summary, ["groq-visual"], lesson);
            }
        }
        catch
        {
            // Fall back to plain text coaching response.
        }

        try
        {
            var fallbackPrompt = $"""
                Explain "{request.Question}" about {request.Topic} like you are talking to a 2nd grader.
                Use a picture story, numbered steps, and a memory trick. Keep it visual in words.
                """;
            var answer = await groq.CompleteAsync(fallbackPrompt, ct);
            return new ChatResponse(answer, ["groq"]);
        }
        catch (InvalidOperationException ex)
        {
            return new ChatResponse(
                $"The AI assistant is temporarily unavailable. {ex.Message}",
                []);
        }
    }

    private static string BuildSummary(VisualLesson lesson) =>
        $"{lesson.Title}: {lesson.SimpleIdea}";
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
