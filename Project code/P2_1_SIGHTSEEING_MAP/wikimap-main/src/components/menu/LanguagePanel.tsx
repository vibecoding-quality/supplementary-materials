import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguagePanelProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export function LanguagePanel({ selectedLanguage, onLanguageChange }: LanguagePanelProps) {
  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Wikipedia Language</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Select the language for Wikipedia information displayed in place details.
            </p>
            
            <RadioGroup value={selectedLanguage} onValueChange={onLanguageChange}>
              <div className="grid grid-cols-1 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <Label
                    key={lang.code}
                    htmlFor={lang.code}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                      selectedLanguage === lang.code
                        ? 'bg-primary/5 border-primary/30'
                        : 'hover:bg-secondary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={lang.code} id={lang.code} />
                      <div>
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-muted-foreground ml-2 text-sm">
                          ({lang.nativeName})
                        </span>
                      </div>
                    </div>
                    {selectedLanguage === lang.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> The language count badge on place cards shows how many 
              Wikipedia languages have articles for that location.
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
