using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace LibrarySystem.Application.Services
{
    public interface ITemplateParserService
    {
        string ParseTemplate(string templateContent, Dictionary<string, string> variables);
    }

    public class TemplateParserService : ITemplateParserService
    {
        public string ParseTemplate(string templateContent, Dictionary<string, string> variables)
        {
            if (string.IsNullOrEmpty(templateContent))
                return string.Empty;

            string result = templateContent;
            
            // Tìm và thay thế tất cả các biến dạng {{VariableName}}
            foreach (var kvp in variables)
            {
                string pattern = $@"\{{\{{\s*{kvp.Key}\s*\}}\}}"; // Match {{ VariableName }} or {{VariableName}}
                result = Regex.Replace(result, pattern, kvp.Value ?? string.Empty, RegexOptions.IgnoreCase);
            }

            return result;
        }
    }
}
