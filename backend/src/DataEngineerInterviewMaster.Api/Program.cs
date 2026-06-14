using DataEngineerInterviewMaster.Application;
using DataEngineerInterviewMaster.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var envFile = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", ".env"));
if (File.Exists(envFile))
{
    foreach (var line in File.ReadAllLines(envFile))
    {
        if (string.IsNullOrWhiteSpace(line) || line.TrimStart().StartsWith('#'))
        {
            continue;
        }

        var separator = line.IndexOf('=');
        if (separator <= 0)
        {
            continue;
        }

        var key = line[..separator].Trim();
        var value = line[(separator + 1)..].Trim();
        Environment.SetEnvironmentVariable(key, value);
    }

    builder.Configuration.AddEnvironmentVariables();
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("frontend");
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.Run();

