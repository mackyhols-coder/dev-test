using System;
using System.Globalization;

namespace Common.Utils;

public static class DateValidatorUtils
{
    private static readonly string[] AcceptedDateFormats = new[]
    {
        "dd/MM/yyyy",
        "yyyy-MM-dd",
        "MM/dd/yyyy"
    };

    public static bool IsValidDate(string dateString)
    {
        if (string.IsNullOrWhiteSpace(dateString))
            return false;

        return DateTime.TryParseExact(
            dateString,
            AcceptedDateFormats,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out _);
    }

    public static DateTime ParseToDate(string dateString)
    {
        if (DateTime.TryParseExact(
            dateString,
            AcceptedDateFormats,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var result))
        {
            return result;
        }

        throw new FormatException("Formato de data inválido.");
    }
}
