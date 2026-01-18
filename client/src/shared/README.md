# Feature-Sliced Design (FSD) Architecture

This frontend codebase follows the **Feature-Sliced Design** methodology for scalable, maintainable architecture.

## Layer Structure

```
src/
├── app/          # (TODO) Global app setup, providers, styles
├── pages/        # Route-level page compositions (21 pages)
├── widgets/      # Complex UI blocks (outfit-card, header, weather)
├── features/     # User actions (auth, wardrobe-item, outfit-builder, trip-planner)
├── entities/     # Business domain (user, wardrobe-item, outfit, trip)
├── shared/       # Reusable, domain-agnostic code
│   ├── ui/       # Design system components (Button, Card)
│   ├── api/      # API client and utilities
│   └── lib/      # Utility functions (cn, formatDate)
```

## Import Rules

Layers can only import from layers **below** them:
- `app` → `pages` → `widgets` → `features` → `entities` → `shared`

**Cross-imports within the same layer are NOT allowed.**

## Current State

### ✅ Implemented Layers

| Layer | Status | Contents |
|-------|--------|----------|
| **entities/** | ✅ Done | `user`, `wardrobe-item`, `outfit`, `trip` |
| **features/** | ✅ Done | `auth`, `wardrobe-item`, `outfit-builder`, `trip-planner` |
| **widgets/** | ✅ Done | `outfit-card`, `header`, `weather` |
| **shared/** | ✅ Done | `ui`, `api`, `lib` |
| **pages/** | ✅ Existing | All 21 pages |

### 🔄 Migration Guide

When creating new components:

1. **Is it shareable across the app?** → `shared/ui/`
2. **Is it a domain model?** → `entities/<entity>/`
3. **Is it a user action?** → `features/<feature>/`
4. **Is it a composite UI block?** → `widgets/<widget>/`
5. **Is it a route?** → `pages/<page>/`

### Usage Examples

```typescript
// ✅ Good: Import from entities
import { useWardrobeItems, WARDROBE_CATEGORIES } from '@/entities/wardrobe-item';

// ✅ Good: Import from features
import { useAuth } from '@/features/auth';

// ✅ Good: Import from widgets
import { OutfitCard } from '@/widgets/outfit-card';

// ❌ Bad: Direct hook import (use entity instead)
import { useWardrobeItems } from '@/hooks/use-wardrobe';
```

## File Structure per Slice

Each entity/feature/widget follows this structure:

```
<slice-name>/
├── index.ts       # Public API (barrel export)
├── model/         # Business logic, hooks, stores
│   ├── types.ts
│   └── hooks.ts
├── ui/            # React components
│   └── component.tsx
├── api/           # API calls (optional)
│   └── api.ts
└── lib/           # Utilities (optional)
    └── helpers.ts
```

## Benefits

1. **Scalability**: Clear boundaries prevent spaghetti code
2. **Discoverability**: Easy to find where things live
3. **Maintainability**: Changes are isolated to their layer
4. **Team Collaboration**: Clear ownership per slice
