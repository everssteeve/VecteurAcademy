"use client"

import { LogoutButton } from "@/components/auth/logout-button"
import type { ModuleMetadata } from "@formations-ia/shared-types"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface UserInfo {
  email: string
  first_name: string | null
  last_name: string | null
  esn_name: string
}

interface MobileNavProps {
  modules: ModuleMetadata[]
  currentPath: string
  user?: UserInfo
}

export function MobileNav({ modules, currentPath, user }: MobileNavProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "VecteurAcademy"

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <Link href="/dashboard" className="font-bold text-lg text-gray-900 dark:text-white">
          {appName}
        </Link>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls="sidebar-nav"
          aria-label={isOpen ? "Fermer la navigation" : "Ouvrir la navigation"}
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        ref={panelRef}
        id="sidebar-nav"
        className={[
          "border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950",
          "transition-all",
          isOpen ? "block" : "hidden",
        ].join(" ")}
      >
        <nav aria-label="Navigation principale" className="p-4 flex flex-col gap-4">
          {modules.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
              Aucun module disponible
            </p>
          ) : (
            <ul className="space-y-1">
              {modules.map((module) => {
                const href = `/modules/${module.slug}`
                const isActive = currentPath === href
                return (
                  <li key={module.id}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                      className={[
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0"
                      />
                      <span className="truncate">{module.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
            <Link
              href="/evaluation-finale"
              aria-current={currentPath === "/evaluation-finale" ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                currentPath === "/evaluation-finale"
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              <span aria-hidden="true" className="text-base">
                🎓
              </span>
              <span>Évaluation finale</span>
            </Link>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
            {user && (
              <div className="px-3 mb-3">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.esn_name}</p>
              </div>
            )}
            <LogoutButton />
          </div>
        </nav>
      </div>
    </div>
  )
}
