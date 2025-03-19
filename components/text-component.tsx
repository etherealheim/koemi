import * as React from "react"
import { cn } from "@/lib/utils"
import { TextEditor } from "@/components/editor"

export interface TextComponentProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fileName?: string;
}

// Renamed from TextComponent to maintain backward compatibility
const TextComponent = React.forwardRef<HTMLTextAreaElement, TextComponentProps>(
  (props, ref) => {
    return <TextEditor {...props} ref={ref} />;
  }
)
TextComponent.displayName = "TextComponent"

export { TextComponent }