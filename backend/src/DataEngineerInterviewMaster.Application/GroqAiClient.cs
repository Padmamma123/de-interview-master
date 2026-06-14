using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DataEngineerInterviewMaster.Application;

internal static class GroqConfiguration
{
    public static string? ResolveApiKey(IConfiguration configuration) =>
        FirstNonEmpty(
            configuration["Groq:ApiKey"],
            configuration["GROQ_API_KEY"],
            Environment.GetEnvironmentVariable("Groq__ApiKey"),
            Environment.GetEnvironmentVariable("GROQ_API_KEY"));

    private static string? FirstNonEmpty(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return null;
    }
}

public static class GroqDependencyInjection
{
    public static IServiceCollection AddGroq(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpClient("Groq", client =>
        {
            client.BaseAddress = new Uri("https://api.groq.com/openai/v1/");
            var apiKey = GroqConfiguration.ResolveApiKey(configuration);
            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            }
        });

        services.AddSingleton<GroqAiClient>();
        return services;
    }
}

internal sealed class GroqAiClient(IHttpClientFactory httpClientFactory, IConfiguration configuration)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<string> CompleteAsync(string prompt, CancellationToken ct = default, bool jsonMode = false)
    {
        var apiKey = GroqConfiguration.ResolveApiKey(configuration);
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "Groq API key is not configured. Set Groq__ApiKey or GROQ_API_KEY in Render environment variables.");
        }

        var model = configuration["Groq:Model"] ?? "llama-3.1-8b-instant";
        var client = httpClientFactory.CreateClient("Groq");

        object payload = jsonMode
            ? new
            {
                model,
                messages = new[] { new { role = "user", content = prompt } },
                temperature = 0.2,
                response_format = new { type = "json_object" }
            }
            : new
            {
                model,
                messages = new[] { new { role = "user", content = prompt } },
                temperature = 0.3
            };

        using var response = await client.PostAsJsonAsync("chat/completions", payload, ct);

        var body = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Groq API error ({(int)response.StatusCode}): {body}");
        }

        var result = JsonSerializer.Deserialize<GroqChatResponse>(body, JsonOptions);
        return result?.Choices?.FirstOrDefault()?.Message?.Content?.Trim()
               ?? throw new InvalidOperationException("Groq returned an empty response.");
    }

    public static string ExtractJsonPayload(string content)
    {
        var fenced = Regex.Match(content, @"```(?:json)?\s*([\s\S]*?)```", RegexOptions.IgnoreCase);
        if (fenced.Success)
        {
            return fenced.Groups[1].Value.Trim();
        }

        var arrayStart = content.IndexOf('[');
        var arrayEnd = content.LastIndexOf(']');
        if (arrayStart >= 0 && arrayEnd > arrayStart)
        {
            return content[arrayStart..(arrayEnd + 1)];
        }

        return content.Trim();
    }
}

internal sealed class GroqChatResponse
{
    [JsonPropertyName("choices")]
    public List<GroqChoice>? Choices { get; set; }
}

internal sealed class GroqChoice
{
    [JsonPropertyName("message")]
    public GroqMessage? Message { get; set; }
}

internal sealed class GroqMessage
{
    [JsonPropertyName("content")]
    public string? Content { get; set; }
}

internal sealed class GeneratedQuestionPayload
{
    public string? Id { get; set; }
    public string? Topic { get; set; }
    public string? Difficulty { get; set; }
    public string? ExperienceLevel { get; set; }
    public string? QuestionType { get; set; }
    public string? Question { get; set; }
    public string[]? Hints { get; set; }
    public string? ExpectedAnswer { get; set; }
    public string[]? CommonMistakes { get; set; }
    public string[]? FollowUpQuestions { get; set; }
    public string[]? RealWorldUseCases { get; set; }
    public string[]? References { get; set; }
    public string[]? ApproachComparisons { get; set; }
}
