namespace MentalWellness.API.Helpers;

public static class NotificationHelper
{
    public static string GenerateNotificationTitle(string entityType, string action)
    {
        return entityType switch
        {
            "Appointment" => action switch
            {
                "Created" => "New Appointment Scheduled",
                "Updated" => "Appointment Updated",
                "Cancelled" => "Appointment Cancelled",
                "Completed" => "Appointment Completed",
                _ => "Appointment Notification"
            },
            "Payment" => action switch
            {
                "Completed" => "Payment Successful",
                "Failed" => "Payment Failed",
                "Pending" => "Payment Pending",
                _ => "Payment Notification"
            },
            "Message" => "New Message Received",
            "Feedback" => "Feedback Notification",
            _ => "Notification"
        };
    }

    public static string GenerateNotificationMessage(string entityType, string action, string? details = null)
    {
        var baseMessage = $"{action} - {entityType}";
        
        if (!string.IsNullOrWhiteSpace(details))
        {
            return $"{baseMessage}: {details}";
        }

        return baseMessage;
    }

    public static string GetNotificationPriority(string entityType, string action)
    {
        if (entityType == "Appointment" && (action == "Cancelled" || action == "Reminder"))
            return "High";
        
        if (entityType == "Payment" && action == "Failed")
            return "Urgent";
        
        if (entityType == "Message")
            return "Normal";
        
        return "Normal";
    }
}
