namespace DataEngineerInterviewMaster.Application;

public static class ScoringRules
{
    public static int LengthBasedScore(int answerLength) => Math.Clamp(answerLength / 10, 20, 100);
    public static int CommunicationScore(int durationSeconds) => Math.Clamp(40 + durationSeconds / 6, 20, 100);

    public static string Category(int overall) => overall switch
    {
        >= 90 => "Architect",
        >= 75 => "Lead",
        >= 60 => "Senior",
        >= 45 => "Intermediate",
        _ => "Beginner"
    };
}

