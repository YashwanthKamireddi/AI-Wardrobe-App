
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { AnimatedCard } from './ui/animated-card';

type StyleOption = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
};

type Question = {
  id: string;
  question: string;
  options: StyleOption[];
};

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'Which color palette do you gravitate towards?',
    options: [
      {
        id: 'q1o1',
        name: 'Neutrals',
        description: 'Beige, white, black, gray',
        imageUrl: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      },
      {
        id: 'q1o2',
        name: 'Vibrant',
        description: 'Bold reds, blues, yellows',
        imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      },
      {
        id: 'q1o3',
        name: 'Pastels',
        description: 'Soft pinks, blues, and lavenders',
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      },
      {
        id: 'q1o4',
        name: 'Earth tones',
        description: 'Browns, greens, and terracotta',
        imageUrl: 'https://images.unsplash.com/photo-1579547945413-497e1b99dac0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      }
    ]
  },
  {
    id: 'q2',
    question: "What's your ideal weekend outfit?",
    options: [
      {
        id: 'q2o1',
        name: 'Casual chic',
        description: 'Jeans and a nice top',
        imageUrl: 'https://images.unsplash.com/photo-1591657668071-ac5dc2ac8ee1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      },
      {
        id: 'q2o2',
        name: 'Athleisure',
        description: 'Leggings and a comfortable hoodie',
        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      },
      {
        id: 'q2o3',
        name: 'Dress up',
        description: 'A cute dress or button-up shirt',
        imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      },
      {
        id: 'q2o4',
        name: 'Vintage inspired',
        description: 'Thrifted finds with character',
        imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      }
    ]
  },
  {
    id: 'q3',
    question: 'Which accessories do you prefer?',
    options: [
      {
        id: 'q3o1',
        name: 'Minimal',
        description: 'Simple, delicate pieces',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      },
      {
        id: 'q3o2',
        name: 'Statement',
        description: 'Bold, eye-catching pieces',
        imageUrl: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3e84?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      },
      {
        id: 'q3o3',
        name: 'Practical',
        description: 'Functional bags and watches',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      },
      {
        id: 'q3o4',
        name: 'Layered',
        description: 'Multiple necklaces, rings, or bracelets',
        imageUrl: 'https://images.unsplash.com/photo-1617891861644-1305fdabedba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500'
      }
    ]
  }
];

const styleResults = {
  'Minimalist': {
    description: 'You prefer clean lines, neutral colors, and quality basics. Your style is timeless and polished without being flashy.',
    recommendations: ['Invest in high-quality basics', 'Focus on perfect fit', 'Choose neutral color palette']
  },
  'Bohemian': {
    description: 'You have a free-spirited aesthetic with natural fabrics, earthy colors, and unique accessories. Your style is relaxed and eclectic.',
    recommendations: ['Layer different textures', 'Mix patterns thoughtfully', 'Add unique vintage accessories']
  },
  'Classic': {
    description: 'You appreciate traditional styles that stand the test of time. Your wardrobe consists of well-tailored pieces in traditional silhouettes.',
    recommendations: ['Invest in timeless silhouettes', 'Choose structured pieces', 'Focus on traditional color palettes']
  },
  'Trendy': {
    description: 'You stay current with the latest fashion trends and enjoy experimenting with new styles. Your wardrobe is constantly evolving.',
    recommendations: ['Follow fashion influencers', 'Shop seasonally', 'Mix trend pieces with basics']
  },
  'Sporty': {
    description: 'You prioritize comfort and functionality with athletic-inspired pieces. Your style is active and casual.',
    recommendations: ['Invest in quality activewear', 'Look for stylish performance fabrics', 'Mix athletic pieces with casual basics']
  }
};

type StyleResultsType = keyof typeof styleResults;

export const StyleQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<StyleResultsType | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Determine result based on answers
      // This is just a simplified example - a real implementation would use a more sophisticated algorithm
      const resultsMap: Record<string, number> = {
        'Minimalist': 0,
        'Bohemian': 0,
        'Classic': 0,
        'Trendy': 0,
        'Sporty': 0
      };
      
      // Simple matching algorithm (in a real app this would be more complex)
      Object.values(answers).forEach(answer => {
        if (answer.includes('q1o1') || answer.includes('q2o1') || answer.includes('q3o1')) {
          resultsMap['Minimalist'] += 1;
        } 
        if (answer.includes('q1o4') || answer.includes('q2o4') || answer.includes('q3o4')) {
          resultsMap['Bohemian'] += 1;
        }
        if (answer.includes('q1o3') || answer.includes('q2o3') || answer.includes('q3o1')) {
          resultsMap['Classic'] += 1;
        }
        if (answer.includes('q1o2') || answer.includes('q2o3') || answer.includes('q3o2')) {
          resultsMap['Trendy'] += 1;
        }
        if (answer.includes('q1o1') || answer.includes('q2o2') || answer.includes('q3o3')) {
          resultsMap['Sporty'] += 1;
        }
      });
      
      // Find style with highest score
      const maxStyle = Object.entries(resultsMap).reduce((max, [style, score]) => 
        score > max.score ? { style: style as StyleResultsType, score } : max, 
        { style: 'Minimalist' as StyleResultsType, score: 0 }
      );
      
      setResult(maxStyle.style);
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setShowResults(false);
  };

  const currentQ = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Discover Your Style</CardTitle>
          <CardDescription>
            Answer a few questions to find your personal style and get customized recommendations
          </CardDescription>
          {!showResults && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-right mt-1 text-muted-foreground">
                Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {!showResults ? (
            <div className="animate-fade-in">
              <h3 className="text-xl font-medium mb-6">{currentQ.question}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map((option, index) => (
                  <AnimatedCard 
                    key={option.id}
                    hoverEffect="lift"
                    transitionDelay={`${index * 100}ms`}
                    className="cursor-pointer border-2 hover:border-primary transition-all overflow-hidden"
                    onClick={() => handleAnswer(currentQ.id, option.id)}
                  >
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={option.imageUrl} 
                        alt={option.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105" 
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium">{option.name}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          ) : result && (
            <div className="animate-slide-up">
              <h3 className="text-2xl font-semibold mb-4 gradient-text">Your Style: {result}</h3>
              <p className="mb-6">{styleResults[result].description}</p>
              
              <h4 className="font-medium mb-2">Recommendations:</h4>
              <ul className="space-y-2 mb-6">
                {styleResults[result].recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start">
                    <span className="inline-block w-5 h-5 mr-2 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">✓</span>
                    {rec}
                  </li>
                ))}
              </ul>
              
              <div className="rounded-lg p-4 bg-primary/10 border border-primary/20 mt-6">
                <p className="text-sm">Based on your style, we'll customize your fashion recommendations and suggest items that match your personal aesthetic.</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {showResults ? (
            <>
              <Button 
                variant="outline" 
                onClick={restartQuiz}
              >
                Restart Quiz
              </Button>
              <Button>
                See Curated Recommendations
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
              className="ml-auto"
            >
              Back
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
