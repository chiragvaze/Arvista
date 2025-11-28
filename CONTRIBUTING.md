# Contributing to Arvista

Thank you for your interest in contributing to Arvista!

## Getting Started

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow existing component patterns
- Use Tailwind CSS for styling
- Keep animations smooth and purposeful
- Write clear, descriptive commit messages

### Component Structure

```tsx
// Example component structure
'use client'

import { motion } from 'framer-motion'
import { ComponentProps } from '@/lib/types'

export default function Component({ prop1, prop2 }: ComponentProps) {
  return (
    <motion.div>
      {/* Component JSX */}
    </motion.div>
  )
}
```

### Animation Guidelines

- Use existing variants from `src/lib/animations.ts`
- Prefer spring physics over duration-based animations
- Always include reduced-motion fallbacks
- Keep animations under 1 second for UI interactions

### Naming Conventions

- Components: PascalCase (`ArtworkCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE
- CSS classes: kebab-case or Tailwind utilities

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update documentation in `/docs` if you're changing core features
3. Ensure all TypeScript checks pass
4. Test responsiveness on mobile, tablet, and desktop
5. Check accessibility with screen readers

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

Thank you for contributing! 🎨
