
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { Language } from "@/lib/i18n";

const languageOptions = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'lo' as Language, name: 'Lao', nativeName: 'ລາວ' },
  { code: 'th' as Language, name: 'Thai', nativeName: 'ไทย' },
];

export function LanguageSettings() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t('language')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {languageOptions.map((option) => (
          <Button
            key={option.code}
            variant={language === option.code ? "default" : "outline"}
            className="w-full justify-between"
            onClick={() => setLanguage(option.code)}
          >
            <span>{option.nativeName}</span>
            {language === option.code && <Check className="w-4 h-4" />}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
