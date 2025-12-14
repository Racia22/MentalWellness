using System.Text.Json;
using System.Text.Json.Serialization;

namespace MentalWellness.API.Helpers;

public class TimeSpanJsonConverter : JsonConverter<TimeSpan>
{
    public override TimeSpan Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value))
            return TimeSpan.Zero;

        // Try to parse as HH:MM:SS or HH:MM format
        if (TimeSpan.TryParse(value, out var timeSpan))
            return timeSpan;

        // If parsing fails, try splitting by colon
        var parts = value.Split(':');
        if (parts.Length >= 2)
        {
            if (int.TryParse(parts[0], out var hours) && int.TryParse(parts[1], out var minutes))
            {
                var seconds = parts.Length > 2 && int.TryParse(parts[2], out var sec) ? sec : 0;
                return new TimeSpan(hours, minutes, seconds);
            }
        }

        return TimeSpan.Zero;
    }

    public override void Write(Utf8JsonWriter writer, TimeSpan value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(@"hh\:mm\:ss"));
    }
}

