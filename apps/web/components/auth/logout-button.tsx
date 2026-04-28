"use client"

import { logoutAction } from "@/app/(auth)/actions"

export function LogoutButton(): React.JSX.Element {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                   text-gray-700 dark:text-gray-300
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span aria-hidden="true">↩</span>
        <span>Se déconnecter</span>
      </button>
    </form>
  )
}
