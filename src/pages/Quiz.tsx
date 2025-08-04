import { useEffect, useState } from "react";
import { getRandomHint, getAllMetaTypes, formatMetaType, Hint } from "@/lib/hints";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shuffle, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Quiz = () => {
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [metaTypes, setMetaTypes] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [hint, types] = await Promise.all([
        getRandomHint(),
        getAllMetaTypes()
      ]);
      setCurrentHint(hint);
      setMetaTypes(types);
    } catch (error) {
      console.error('Error loading quiz data:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentHint?.meta_type;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const nextQuestion = async () => {
    try {
      const hint = await getRandomHint();
      setCurrentHint(hint);
      setSelectedAnswer("");
      setShowResult(false);
    } catch (error) {
      console.error('Error loading next hint:', error);
      toast({
        title: "Error",
        description: "Failed to load next question.",
        variant: "destructive",
      });
    }
  };

  const resetQuiz = () => {
    setScore({ correct: 0, total: 0 });
    setSelectedAnswer("");
    setShowResult(false);
    loadInitialData();
  };

  if (loading || !currentHint) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Shuffle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Quiz Mode</h1>
          </div>
          <Card>
            <CardContent className="p-8">
              <div className="text-center">Loading quiz...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Create answer options: correct answer + 3 random wrong answers
  const answerOptions = [currentHint.meta_type];
  const otherMetaTypes = metaTypes.filter(type => type !== currentHint.meta_type);
  
  while (answerOptions.length < 4 && otherMetaTypes.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherMetaTypes.length);
    const randomType = otherMetaTypes.splice(randomIndex, 1)[0];
    answerOptions.push(randomType);
  }
  
  // Shuffle the options
  const shuffledOptions = answerOptions.sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Shuffle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Quiz Mode</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Score: {score.correct}/{score.total}
            </Badge>
            <Button onClick={resetQuiz} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              What meta type does this hint describe?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-lg">{currentHint.description}</p>
              </div>
              
              {currentHint.image_url && (
                <div className="flex justify-center">
                  <img
                    src={currentHint.image_url}
                    alt="Hint visual"
                    className="max-h-40 max-w-80 object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <strong>Country:</strong> {currentHint.country}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shuffledOptions.map((option) => (
                <Button
                  key={option}
                  variant={
                    showResult
                      ? option === currentHint.meta_type
                        ? "default"
                        : option === selectedAnswer
                        ? "destructive"
                        : "outline"
                      : "outline"
                  }
                  size="lg"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => !showResult && handleAnswer(option)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-2">
                    {showResult && option === currentHint.meta_type && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {showResult && option === selectedAnswer && option !== currentHint.meta_type && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span>{formatMetaType(option)}</span>
                  </div>
                </Button>
              ))}
            </div>

            {showResult && (
              <div className="mt-6 text-center">
                <div className="mb-4">
                  {selectedAnswer === currentHint.meta_type ? (
                    <div className="text-green-600 font-semibold text-lg">
                      ✓ Correct! This is {formatMetaType(currentHint.meta_type)}
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold text-lg">
                      ✗ Incorrect. The correct answer is {formatMetaType(currentHint.meta_type)}
                    </div>
                  )}
                </div>
                
                <Button onClick={nextQuestion} size="lg">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Next Question
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;