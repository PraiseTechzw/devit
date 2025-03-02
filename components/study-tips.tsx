import { Lightbulb } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const STUDY_TIPS = [
  {
    title: "Set Clear Goals",
    description: "Start each study session by defining what you want to achieve.",
  },
  {
    title: "Use Active Recall",
    description: "Test yourself instead of just re-reading materials.",
  },
  {
    title: "Spaced Repetition",
    description: "Review materials at increasing intervals.",
  },
  {
    title: "Teach Others",
    description: "Explaining concepts helps solidify your understanding.",
  },
]

export function RandomStudyTip() {
  const tip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]

  return (
    <Alert>
      <Lightbulb className="h-4 w-4" />
      <AlertTitle>Study Tip</AlertTitle>
      <AlertDescription>
        <strong>{tip.title}:</strong> {tip.description}
      </AlertDescription>
    </Alert>
  )
}

