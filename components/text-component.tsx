import * as React from "react"
import { TextEditor } from "@/components/editor"

// Using direct component props rather than empty interface
const TextComponent = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof TextEditor>>(
  (props, ref) => {
    return <TextEditor {...props} ref={ref} />;
  }
)
TextComponent.displayName = "TextComponent"

export { TextComponent }