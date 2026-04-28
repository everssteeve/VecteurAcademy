import Image from "next/image"

type InstructorName = "Steeve Evers" | "Dr Lena Voss"

interface InstructorBadgeProps {
  name: InstructorName
}

const INSTRUCTORS: Record<InstructorName, { src: string; role: string }> = {
  "Steeve Evers": { src: "/instructors/steeve-evers.png", role: "Formateur" },
  "Dr Lena Voss": { src: "/instructors/dr-lena-voss.png", role: "Formatrice" },
}

export function InstructorBadge({ name }: InstructorBadgeProps): React.JSX.Element {
  const { src, role } = INSTRUCTORS[name]
  return (
    <div className="instructor-badge flex items-center gap-3 my-4">
      <Image src={src} alt={name} width={56} height={56} className="rounded-full object-cover" />
      <div>
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
      </div>
    </div>
  )
}
