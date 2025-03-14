# Blog Application

A modern blog application built with Angular and NestJS, featuring OAuth authentication, blog creation with image uploads, and a responsive UI.

## Features

- OAuth authentication with Google and Facebook
- Blog creation with image upload support
- Modern UI with Tailwind CSS
- Secure file handling and validation
- Full test coverage
- Docker containerization
- CI/CD pipeline with GitHub Actions

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment, with the following stages:

### 1. Compile and Test
- Compiles both frontend and backend
- Runs linting checks
- Executes unit tests with coverage reports
- Uses PostgreSQL service container for backend tests

### 2. Build
- Builds production-ready artifacts for both applications
- Only runs on main branch pushes
- Uploads build artifacts for deployment

### 3. Docker
- Builds optimized Docker images
- Uses multi-stage builds for minimal image size
- Pushes to Docker Hub with versioned tags
- Implements Docker layer caching

### 4. Deploy
- Deploys to production environment
- Uses latest Docker images
- Maintains deployment history

## Required GitHub Secrets

Add these secrets to your GitHub repository settings (Settings > Secrets and variables > Actions):

```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_TOKEN=your_dockerhub_access_token
```

These secrets are used by the GitHub Actions workflow to authenticate with Docker Hub and push images. Make sure to:
1. Create an access token in Docker Hub (Account Settings > Security > New Access Token)
2. Copy the token immediately as it won't be shown again
3. Add both secrets to your GitHub repository

## Development Setup

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/nest?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Finish your CI setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/47axaTBQlc)


## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve blog-app-backend
npx nx serve blog-frontend
```

To create a production bundle:

```sh
npx nx build blog-app-backend --configuration=production
npx nx build blog-frontend --configuration=production
```

To see all available targets to run for a project, run:

```sh
npx nx show project blog-app-backend
npx nx show project blog-frontend
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Docker Development

Run the entire stack locally:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Testing

Run tests with coverage:

```bash
# Frontend tests
npx nx test blog-frontend --coverage

# Backend tests
npx nx test blog-app-backend --coverage
```

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/nest:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/node:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)


[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/nest?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
