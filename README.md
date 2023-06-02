# GitLab CI & DevOps with AWS 

- This project demonstrate how to build pipelines with GitLab CI and deploy software to AWS

## Overview

### Setting up a GitLab project

- create a free GitLab.com account
- there is a free trial by default and your account will be downgraded to a free one after 30 days
- change the theme: Profile > Preferences > Syntax highlighting theme > Monokai
- Enable *Render whitespace characters in the Web IDE*
- GitLab CI pipelines are defined in a file called .gitlab-ci.yml
- to run your pipeline using the GitLab.com infrastructure, you need to verify your account with a credit card
- validation troubleshooting:
    * Validation is stuck. Nothing happens. If the interface is stuck or loading after 2-3 minutes of waiting, open a new tab and return to your main project page. If you don't see the message that you need to validate your account, it could mean that the validation was successful. 

### Defining pipeline

- when we build and ship software, we need to follow a series of steps
- we define the GitLab CI pipeline using YAML
- a job can execute one or multiple commands
- `mkdir build` - creates a new folder called `build`
- `touch file.txt` - creates a new file called `file.txt`
- `>>` is called a redirection operator and appends the output from a previous command to a file
- `cat` can be used for displaying the contents of a file
- we typically run commands such as `echo`, `touch`, `mkdir`, `cat` and so on through a command-line interface or CLI
- to automate the building & releasing of software, we rely on tools that have no UI, so we need to use the CLI (Shell)
- use Linux Alpine for this job because it is a very lightweight distribution
- if no stage is defined in the job config, the *test* stage will be assigned
- a pipeline is composed of a series of jobs organized in stages
- you need to know some YAML basics to write GitLab CI pipelines
- YAML is being often used for storing configurations

### GitLab architecture

- at a minimum, the GitLab architecture contains the GitLab Server (also known as the coordinator) and a GitLab Runner
- the GitLab server manages the execution of the pipeline and its jobs and stores the results
- when a job needs to be executed, the GitLab server will find a runner to run the job
- a runner is a simple program that executes a job
- a working GitLab CI setup must have at least one runner, but there are often more of them to help distribute the load
- there can also be specific runners that have a particular software or hardware configuration (this is outside of the scope of this course)
- this is a simplified overview of the steps involved when a job is executed:
    * the GitLab server (coordinator) locates a GitLab Runner and sends instructions for running the job
    * the GitLab Runner will pull the Docker image specified in the job configuration  (or the default image if no Docker image is specified)
    * the GitLab Runner will start the Docker container
    * the GitLab Runner will get the files stored in the Git repository
    * the GitLab Runner run the commands from the `script` keyword inside the Docker container
    * the GitLab Runner report back to the GitLab server (coordinator) the results of the job execution
    * the GitLab Runner will terminate the Docker container

### Pipeline stages

- by default, a job will be assigned to the *Test* stage
- if two or more jobs belong to the same stage, they will be executed in parallel
- the `stages:` keyword allows us to define the stages of the pipeline
- the keyword `stage:` allows us to associate a job with a stage

### Why do pipelines fail?

- CLI programs indicate if their execution was successful or not by returning an exit code
- an exit code 0 will indicate that a program has been executed successfully 
- any other exit code, which can be from 1 to 255, indicates failure
- if GitLab detects a non-zero exit code, the job execution stops
- **Highly important tip:** reading the job logs from top to bottom is KEY to understanding WHY a job has failed

### Job artifacts

- every job is executed in a separate container, so by default, no files are shared
- to save the build results, we need to define the file(s) or folders as artifacts
- in GitLab, we do this by using the artifacts keyword:
```
build laptop:
    ...
    artifacts:
        paths:
            - build

```

### Testing the build

- The goal is to automate both the build process and the test process

### Variables
- variables are used in the pipeline configuration to avoid repeating strings 
- variables can be defined in scripts or using the `variables:` keyword
- to reference the variable, we use the dollar sign before it

```
variables:
  BUILD_FILE_NAME: laptop.txt

usage - $BUILD_FILE_NAME

```
- variables can be defined locally in the job or globally for all jobs
- when using spaces or some special characters, you may need to put the entire value between quotes

## Continuous Integration with GitLab CI

### Unit overview

- we want to automate any of the manual steps required for integrating the changes of multiple developers
- we will create a pipeline that will build and test the software we are creating
- we use Git to keep track of code changes
- we need to ensure we don't break the main pipeline

**Merge requests**

- we need to ensure that the chances of breaking the main branch are reduced
- here are some project settings for working with Merge Requests that I recommend:
    * Go to Settings > Merge requests
    * Merge method > select *Fast-forward merge*
    * Squash commits when merging > select *Encourage*
    * Merge checks > check *Pipelines must succeed*
- protect the master by allowing changes only through a merge request: 
    * Settings > Repository > Branch main > Allowed to push - select *No one*
- merge requests are often used to review the work before merging it
- merge requests allow us to document why a specific change was made
- other people on the team can review the changes and share their feedback by commenting
- if you still need to make changes from the merge request, you can open the branch using the Web IDE

### Integration tests

- before we ship the final product, we try to test it to see if it works
- testing is done of various levels but high-level tests typically include integration and acceptance tests
- we use cURL to create an HTTP call to the website

### How to structure a pipeline

- there are a few principles to consider
- principle #1: Fail fast
    * we want to ensure that the most common reasons why a pipeline would fail are detected early
    * put jobs of the same size in the same stage
- principle #2: Job dependencies
    * you need to understand the dependencies between the jobs
    * example: you can't test what was not already built yet
    * if jobs have dependencies between them, they need to be in distinct stages

## Continuous Deployment with GitLab & AWS

### A quick introduction to AWS

- AWS (Amazon Web Services) is a cloud platform provider offering over 200 products & services available in data centers all over the world
- you need an AWS account to continue with the rest of the course
- to interact with the AWS cloud services, we need to use a CLI tool called AWS CLI
- we will create a new user with the following settings:
    * account type: programmatic access
    * permissions: attach existing policy: AmazonS3FullAccess
- the account details will be displayed only once
- go to *Settings > CI/CD > Variables > Add variable* and define the following unprotected variables:
    * AWS_ACCESS_KEY_ID
    * AWS_SECRET_ACCESS_KEY
    * AWS_DEFAULT_REGION
- AWS CLI will look for these variables and use them to authenticate

### Masking & protecting variables

- to define a variable, go to *Settings > CI/CD > Variables > Add variable*
- we typically store passwords or other secrets
- a variable has a key and a value
- it is a good practice to write the key in uppercase and to separate any words with underscores
- flags:
    * Protect variable: if enabled, the variable is not available in branches, apart from the default branch (main), which is a protected branch
    * Mask variable: if enabled, the variable value is never displayed in clear text in job logs

### Hosting a website on S3

- a bucket can be created from the S3 console
- files in the S3 bucket are not publicly available
- to get the website to work, we need to configure the bucket
- from the bucket, click on *Properties* and enable Static website hosting
- from the bucket, click on the *Permissions* tab and disable *Block public access*
- from the bucket, click on the *Permissions* tab and set a bucket policy

### Controlling when jobs run

- we don’t want to deploy to production from every branch
- to decide which jobs to run, we can use `rules:` to set a condition
- `CI_COMMIT_REF_NAME` gives us the current branch that is running the pipeline
- `CI_DEFAULT_BRANCH` gives us the name of the default branch (typically main or master)

### Post-deployment testing

- use `cURL` to download the index.html file from the website
- with `grep`, we can check to see if the index.html file contains a specific string

### What is CI/CD?

- the pipeline goes through multiple stages: build, test & deploy
- right now, we consider the website hosted at AWS S3 our production environment
- quite often, pipelines will also have a staging environment
- a staging environment is a non-production, usually non-public environment that is very close to the actual production environment
- we often use automation to create these environments and to ensure that they are indeed identical
- we use a staging environment as a pre-production environment
- essentially, we try out our deployment in the pre-production environment
- CD can refer to two concepts:
    * Continuous Deployment - where every change is automatically deployed to production
    * Continuous Delivery - where every change is automatically deployed to staging but where we need some manual intervention to deploy to production

### Environments

- every system where an application can be deployed is an environment
- typical environments include test, staging & production
- GitLab offers support for environments
- we can define environments in *Deployments > Environments*

### Reusing configuration

- sometimes, multiple jobs may look almost the same, and we should try to avoid repeating ourselves
- GitLab allows us to inherit from an exiting job with the `extends:` keyword

### Continuous Delivery pipeline

- adding `when: manual` allows us to manually trigger the production deployment

## Deploying a dockerized application to AWS

### overview

- modern applications tend to be more complex, and most of them use Docker 
- we will build & deploy an application that runs in a Docker container

### Introduction to AWS Elastic Beanstalk

- AWS Elastic Beanstalk (AWS EB) is a service that allows us to deploy an application in the AWS cloud without having to worry about managing the virtual server(s) that runs it

### Creating a new AWS Elastic Beanstalk application

- when creating an EB app, choose the *Docker* platform and deploy the sample app
- AWS EB will use two AWS services to run the application:
    * EC2 (virtual servers)
    * S3 (storage)
- to deploy a new version, go to the environment in EB and upload the file in templates called `Dockerrun.aws.public.json`

### Creating the Dockerfile

- create a new file called `Dockerfile` in the root of the project
- add the following contents to it:
```
FROM nginx:1.20-alpine
COPY build /usr/share/nginx/html
```

### Building the Docker image

- to build the Docker image, we will use the command `docker build`
- to build Docker images from a GitLab CI pipeline, we need to start the Docker Daemon as a service

### Docker container registry

- to preserve a Docker image, we need to push it to a registry
- Dockerhub is a public registry with Docker images
- GitLab offers a private Docker registry which is ideal for private projects

### Testing the container

- we want to test the container to see if the application running on it (web server) is working properly
- to start the container, we will use the `services:` keyword

### Private registry authentication

- AWS EB requires authentication credentials to pull our Docker image
- GitLab allows us to create a Deploy Token that AWS can use to log to the registry
- to generate a Deploy Token, from your project, go to *Settings > Repository > Deploy tokens*.
- create a new Deploy Token with the following scopes:
    * read_repository
    * read_registry

### Deploying to AWS Elastic Beanstalk

- a new deployment to AWS EB happens in two steps
- step 1: we create a new application version with `aws elasticbeanstalk create-application-version`
- step 2: we update the environment with the new application version with `aws elasticbeanstalk update-environment`

### Post-deployment testing

- updating an EB environment does not happen instantly
- use `aws elasticbeanstalk wait` to know when the environment has been updated