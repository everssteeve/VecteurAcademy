"use client"

import { markModuleStartedAction } from "@/app/(learner)/actions"
import { useEffect } from "react"

export function MarkModuleStarted({ moduleId }: { moduleId: string }) {
  useEffect(() => {
    markModuleStartedAction(moduleId).catch(() => {})
  }, [moduleId])
  return null
}
