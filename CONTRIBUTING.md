# Contributing to Avaline

Thank you for your interest in contributing to Avaline! This document provides guidelines and information for contributors.

## How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce the bug
- Provide your environment details (OS, Node.js version, etc.)
- Include any error messages or logs

### Suggesting Features
- Open a new issue with the "enhancement" label
- Describe the feature and its benefits
- Consider implementation complexity

### Code Contributions
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**: `git commit -m "Add amazing feature"`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development
```bash
# Clone your fork
git clone https://github.com/yourusername/avaline.git
cd avaline

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types
- `npm run clean` - Clean build artifacts

## Code Style

### TypeScript
- Use strict TypeScript configuration
- Define proper types for all functions
- Avoid `any` types when possible

### React Components
- Use functional components with hooks
- Follow React best practices
- Keep components focused and reusable

### Styling
- Use Tailwind CSS utility classes
- Follow consistent spacing and color schemes
- Ensure responsive design

### File Naming
- Use kebab-case for files: `my-component.tsx`
- Use PascalCase for components: `MyComponent`
- Use camelCase for functions: `myFunction`

## Testing

### Before Submitting
- Test your changes locally
- Ensure no TypeScript errors
- Check that the app builds successfully
- Verify functionality works as expected

### Testing Checklist
- [ ] Code compiles without errors
- [ ] No console errors in browser
- [ ] All features work as expected
- [ ] Responsive design maintained
- [ ] No performance regressions

## Pull Request Guidelines

### PR Title
- Use clear, descriptive titles
- Start with a verb: "Add", "Fix", "Update", "Remove"

### PR Description
- Describe what the PR accomplishes
- Include any breaking changes
- Reference related issues
- Add screenshots for UI changes

### Code Review
- Address all review comments
- Keep commits focused and logical
- Squash commits if requested

## Deployment

### Environment Variables
- Never commit sensitive data
- Update documentation for new variables
- Provide clear setup instructions

### Build Process
- Ensure `npm run build` succeeds
- Test production build locally
- Verify all API endpoints work

## Documentation

### Code Comments
- Add JSDoc comments for complex functions
- Explain business logic clearly
- Keep comments up to date

### README Updates
- Update README.md for new features
- Include setup instructions
- Document configuration options

## Common Issues

### Build Errors
- Check Node.js version compatibility
- Clear `.next` folder and reinstall dependencies
- Verify environment variables are set

### API Issues
- Check Google Sheets API permissions
- Verify OpenAI API key is valid
- Ensure service account has proper access

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and help
- **Code Review**: Ask questions in PR comments

## Contribution Areas

### High Priority
- Bug fixes
- Performance improvements
- Security enhancements
- Accessibility improvements

### Medium Priority
- New features
- UI/UX improvements
- Code refactoring
- Documentation updates

### Low Priority
- Cosmetic changes
- Minor optimizations
- Additional examples

## License

By contributing to Avaline, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Avaline! 