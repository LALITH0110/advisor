"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, CheckCircle } from "lucide-react"

type Question = {
  id: number
  question: string
  options: string[]
  correct: number
  fact: string
}

const questions: Question[] = [
  {
    id: 1,
    question: "What year was Illinois Institute of Technology founded?",
    options: ["1890", "1940", "1968", "2000"],
    correct: 0,
    fact: "Illinois Institute of Technology was founded in 1890 through the merger of Armour Institute and Lewis Institute!",
  },
  {
    id: 2,
    question: "Illinois Tech is ranked #1 in the state for what?",
    options: [
      "Return on Investment",
      "Campus Food",
      "Sports Teams",
      "Library Size",
    ],
    correct: 0,
    fact: "Illinois Tech consistently ranks #1 for Return on Investment among Illinois universities - your education pays off!",
  },
  {
    id: 3,
    question: "What is IIT's student-to-faculty ratio?",
    options: ["30:1", "20:1", "17:1", "50:1"],
    correct: 2,
    fact: "With a 17:1 ratio, you get personalized attention and mentorship from world-class faculty!",
  },
  {
    id: 4,
    question: "Which famous architect designed IIT's campus?",
    options: ["Frank Lloyd Wright", "Ludwig Mies van der Rohe", "Le Corbusier", "Zaha Hadid"],
    correct: 1,
    fact: "Ludwig Mies van der Rohe designed IIT's iconic modernist campus, making it a National Historic Landmark!",
  },
  {
    id: 5,
    question: "How many research centers and labs does Illinois Tech have?",
    options: ["5", "15", "30+", "100+"],
    correct: 2,
    fact: "Illinois Tech has 30+ research centers where students work on cutting-edge projects in AI, cybersecurity, energy, and more!",
  },
]

export function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)

  const handleSubmit = () => {
    if (selectedAnswer === null) return

    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1)
    }

    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setShowResult(false)
      setSelectedAnswer(null)
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Move to results screen
      setCurrentQuestion(questions.length)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setStarted(false)
  }

  if (!started) {
    return (
      <Card className="w-full p-6 mt-6 bg-gradient-to-br from-iit-red/5 to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-iit-red/10 rounded-full flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-iit-red" />
          </div>
          <h3 className="text-xl font-bold">Bored of waiting in the queue?</h3>
          <p className="text-muted-foreground">
            Test your knowledge about Illinois Tech and discover what makes IIT special!
          </p>
          <Button onClick={() => setStarted(true)} className="bg-iit-red hover:bg-iit-red/90">
            Start Quiz
          </Button>
        </div>
      </Card>
    )
  }

  if (currentQuestion >= questions.length) {
    return (
      <Card className="w-full p-6 mt-6 bg-gradient-to-br from-iit-red/5 to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold">Quiz Complete!</h3>
          <div className="p-6 bg-white rounded-lg">
            <p className="text-4xl font-bold text-iit-red mb-2">
              {score} / {questions.length}
            </p>
            <p className="text-muted-foreground">
              {score === questions.length
                ? "Perfect score! You're an IIT expert! 🎉"
                : score >= 3
                  ? "Great job! You know IIT well! 🌟"
                  : "Good effort! Learn more about IIT! 📚"}
            </p>
          </div>
          <Button onClick={resetQuiz} variant="outline">
            Retake Quiz
          </Button>
        </div>
      </Card>
    )
  }

  const question = questions[currentQuestion]

  return (
    <Card className="w-full p-6 mt-6 bg-gradient-to-br from-iit-red/5 to-blue-50">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-iit-red">Score: {score}</span>
        </div>

        <h3 className="text-lg font-semibold">{question.question}</h3>

        {!showResult ? (
          <>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedAnswer === index
                      ? "bg-white border-iit-red shadow-sm"
                      : "bg-white border-gray-200 hover:border-iit-red/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <Button onClick={handleSubmit} disabled={selectedAnswer === null} className="w-full bg-iit-red hover:bg-iit-red/90">
              Submit Answer
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`px-4 py-3 rounded-lg border transition-all ${
                    index === question.correct
                      ? "bg-green-50 border-green-500 text-green-700"
                      : selectedAnswer === index
                      ? "bg-red-50 border-red-500 text-red-700"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900 leading-relaxed">{question.fact}</p>
            </div>

            <Button onClick={handleNext} className="w-full bg-iit-red hover:bg-iit-red/90">
              {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
