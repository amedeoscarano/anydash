# Roadmap

Open work filed from reviews. Each line says where it came from.

## v0.2

- `/dash:friction` with `session-recorder` and `friction-analysis` (M4). `/dash:onboard` then measures time to first value on a real run instead of a KLM estimate.
- `/dash:clone`, `/dash:reconcile`, `/dash:learn` with `site-feature-mapper`, `api-surface-capture`, `api-ui-reconciliation`, `ui-pattern-mining` (M5).

## Rulebook gaps

- Permission denied by role: no rule yet in any studied portal (a gap in all three). `ui-states` and `/dash:build` log it as "no rule yet". Source: M2 review.
- Resuming a half-finished onboarding: no rule yet (a gap in all three). Source: Phase 2 comparison.
- HOM-001 `check_static` counts areas literally; it should count queues as `home-layout` defines them. Source: M2 dry run.
- Brand settings per store when one account runs several stores: `customer-branding` handles it as "no rule yet". Source: M2 dry run.
- DHL simplicity framework: fold in the owner interview (5 questions) when answered.

## Skill candidates

- A form-page specialist (create and edit flows). `/dash:build` covers them with the Form template and `save-model` for now. Source: M2 dry run.
- `/dash:compare`: the same task on our dashboard and on a reference portal.
- `/dash:copy`: microcopy and terminology audit.
- `/dash:a11y`: WCAG 2.2 AA audit.
