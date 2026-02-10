import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner,  } from "sonner"

const Toaster = ({ ...props }{
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success,
        info,
        warning,
        error,
        loading,
      }}
      style={
        {
          "--normal-bg",
          "--normal-text",
          "--normal-border",
          "--border-radius",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
