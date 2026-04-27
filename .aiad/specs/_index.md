# Index des SPECs

> Chaque SPEC est une spécification technique atomique liée à un Intent Statement.
> Format : `SPEC-NNN-[nom-court].md`
> Commande : `/sdd-spec` dans Claude Code

| ID | Titre | Intent parent | SQS | Statut | PR |
|----|-------|---------------|-----|--------|----|
| [SPEC-001](SPEC-001-monorepo-bootstrap.md) | Monorepo Bootstrap | INTENT-001 | 4/5 ⚠️ | done | commit initial |
| [SPEC-002](SPEC-002-module-registry.md) | Module Registry | INTENT-001 | 4/5 ⚠️ | done | commit SPEC-002 |
| [SPEC-003](SPEC-003-navigation-shell.md) | Navigation Shell | INTENT-001 | 5/5 ✅ | done | SPEC-003 |
| [SPEC-004](SPEC-004-auth-shell.md) | Auth Shell | INTENT-001 | À évaluer | draft | — |

## Statuts possibles

- **draft** — SPEC en cours de rédaction
- **review** — En attente de validation SQS (Execution Gate)
- **ready** — SQS >= 4/5, prête pour développement agent
- **in-progress** — Agent en cours de développement
- **validation** — Code produit, en validation QA
- **done** — Code + SPEC synchronisés, PR mergée (Drift Lock)
- **archived** — Déplacée dans `archive/`
