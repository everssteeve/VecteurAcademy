# Index des SPECs

> Chaque SPEC est une spécification technique atomique liée à un Intent Statement.
> Format : `SPEC-NNN-[nom-court].md`
> Commande : `/sdd-spec` dans Claude Code

| ID | Titre | Intent parent | SQS | Statut | PR |
|----|-------|---------------|-----|--------|----|
| [SPEC-001](archive/SPEC-001-monorepo-bootstrap.md) | Monorepo Bootstrap | INTENT-001 | 4/5 ⚠️ | done | commit initial |
| [SPEC-002](archive/SPEC-002-module-registry.md) | Module Registry | INTENT-001 | 4/5 ⚠️ | done | commit SPEC-002 |
| [SPEC-003](archive/SPEC-003-navigation-shell.md) | Navigation Shell | INTENT-001 | 5/5 ✅ | done | SPEC-003 |
| [SPEC-004](archive/SPEC-004-auth-shell.md) | Auth Shell | INTENT-001 | 5/5 ✅ | done | commit SPEC-004 |
| [SPEC-005](SPEC-005-mdx-content-rendering.md) | Contenu MDX + Rendu modules | INTENT-002 | 5/5 ✅ | done | commit SPEC-005 |
| [SPEC-006](SPEC-006-quiz-module-component.md) | Composant Quiz de fin de module | INTENT-002 | 4/5 ⚠️ | done | commit SPEC-006 |
| [SPEC-007](SPEC-007-quiz-parcours-final.md) | Quiz de fin de parcours (Certification) | INTENT-002 | 4/5 ⚠️ | done | commit SPEC-007 |

## Statuts possibles

- **draft** — SPEC en cours de rédaction
- **review** — En attente de validation SQS (Execution Gate)
- **ready** — SQS >= 4/5, prête pour développement agent
- **in-progress** — Agent en cours de développement
- **validation** — Code produit, en validation QA
- **done** — Code + SPEC synchronisés, PR mergée (Drift Lock)
- **archived** — Déplacée dans `archive/`
