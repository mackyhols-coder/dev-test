using System.Linq;

namespace Common.Utils;

public class DocumentValidatorUtils
{
    public static bool IsValidCpfOrCnpj(string document)
    {
        if (string.IsNullOrWhiteSpace(document))
            return false;

        var cleaned = new string(document.Where(char.IsDigit).ToArray());

        return cleaned.Length switch
        {
            11 => IsValidCpf(cleaned),
            14 => IsValidCnpj(cleaned),
            _ => false
        };
    }

    private static bool IsValidCpf(string cpf)
    {
        return cpf.Length == 11;
    }

    private static bool IsValidCnpj(string cnpj)
    {
        return cnpj.Length == 14;
    }
}
