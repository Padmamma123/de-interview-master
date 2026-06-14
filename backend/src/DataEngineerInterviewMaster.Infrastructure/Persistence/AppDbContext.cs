using DataEngineerInterviewMaster.Domain;
using Microsoft.EntityFrameworkCore;

namespace DataEngineerInterviewMaster.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionAttempt> QuestionAttempts => Set<QuestionAttempt>();
    public DbSet<MockInterview> MockInterviews => Set<MockInterview>();
    public DbSet<InterviewResult> InterviewResults => Set<InterviewResult>();
    public DbSet<StudyPlan> StudyPlans => Set<StudyPlan>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().ToTable("users").HasKey(x => x.Id);
        modelBuilder.Entity<User>().Property(x => x.Id).HasColumnName("id");
        modelBuilder.Entity<User>().Property(x => x.Email).HasColumnName("email");
        modelBuilder.Entity<User>().Property(x => x.PasswordHash).HasColumnName("password_hash");
        modelBuilder.Entity<User>().Property(x => x.FullName).HasColumnName("full_name");
        modelBuilder.Entity<User>().Property(x => x.GoogleId).HasColumnName("google_id");
        modelBuilder.Entity<User>().Property(x => x.ExperienceLevel).HasColumnName("experience_level");
        modelBuilder.Entity<User>().Property(x => x.CurrentRole).HasColumnName("current_role");
        modelBuilder.Entity<User>().Property(x => x.TargetRole).HasColumnName("target_role");
        modelBuilder.Entity<User>().Property(x => x.IsActive).HasColumnName("is_active");
        modelBuilder.Entity<User>().Property(x => x.CreatedAt).HasColumnName("created_at");

        modelBuilder.Entity<Topic>().ToTable("topics").HasKey(x => x.Id);
        modelBuilder.Entity<Topic>().Property(x => x.Id).HasColumnName("id");
        modelBuilder.Entity<Topic>().Property(x => x.Name).HasColumnName("name");
        modelBuilder.Entity<Topic>().Property(x => x.Category).HasColumnName("category");
        modelBuilder.Entity<Topic>().Property(x => x.Description).HasColumnName("description");

        modelBuilder.Entity<Question>().ToTable("questions").HasKey(x => x.Id);
        modelBuilder.Entity<Question>().Property(x => x.Id).HasColumnName("id");
        modelBuilder.Entity<Question>().Property(x => x.TopicId).HasColumnName("topic_id");
        modelBuilder.Entity<Question>().Property(x => x.Difficulty).HasColumnName("difficulty");
        modelBuilder.Entity<Question>().Property(x => x.ExperienceLevel).HasColumnName("experience_level");
        modelBuilder.Entity<Question>().Property(x => x.QuestionType).HasColumnName("question_type");
        modelBuilder.Entity<Question>().Property(x => x.QuestionText).HasColumnName("question_text");
        modelBuilder.Entity<Question>().Property(x => x.ExpectedAnswer).HasColumnName("expected_answer");
        modelBuilder.Entity<Question>().Ignore(x => x.Hints);
        modelBuilder.Entity<Question>().Ignore(x => x.CommonMistakes);
        modelBuilder.Entity<Question>().Ignore(x => x.FollowUpQuestions);
        modelBuilder.Entity<Question>().Ignore(x => x.RealWorldUseCases);
        modelBuilder.Entity<Question>().Ignore(x => x.References);
        modelBuilder.Entity<Question>().Ignore(x => x.Approaches);

        modelBuilder.Entity<QuestionAttempt>().ToTable("question_attempts").HasKey(x => x.Id);
        modelBuilder.Entity<QuestionAttempt>().Property(x => x.Id).HasColumnName("id");
        modelBuilder.Entity<QuestionAttempt>().Property(x => x.UserId).HasColumnName("user_id");
        modelBuilder.Entity<QuestionAttempt>().Property(x => x.QuestionId).HasColumnName("question_id");
        modelBuilder.Entity<QuestionAttempt>().Property(x => x.SubmittedAnswer).HasColumnName("submitted_answer");
        modelBuilder.Entity<QuestionAttempt>().Property(x => x.Score).HasColumnName("score");
        modelBuilder.Entity<QuestionAttempt>().Property(x => x.FeedbackJson).HasColumnName("feedback");
        modelBuilder.Entity<QuestionAttempt>().Property(x => x.DurationSeconds).HasColumnName("duration_seconds");
        modelBuilder.Entity<QuestionAttempt>().Property(x => x.CreatedAt).HasColumnName("created_at");

        modelBuilder.Entity<MockInterview>().ToTable("mock_interviews").HasKey(x => x.Id);
        modelBuilder.Entity<InterviewResult>().ToTable("interview_results").HasKey(x => x.Id);
        modelBuilder.Entity<StudyPlan>().ToTable("study_plans").HasKey(x => x.Id);
    }
}

