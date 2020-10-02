# BFI IMAX New Film Notifier
![Node.js CI](https://github.com/jamesgawn/bfi-imax-new-film-notifier/workflows/Node.js%20CI/badge.svg?branch=master)

A serverless solution to find out if new films are available for booking at the BFI IMAX.

## Guide

This project has the following built in npm commands:

| Command | Description |
| --- | --- |
| build | Compiles the Typescript project into a deployable Javascript |
| test | Runs the unit tests |
| coverage | Checks the unit test coverage |
| lint | Checks the format of the code against the ESLint rules |
| deploy | Builds the Typescript project, packages up the Lambda function, and deploys to AWS using Terraform (requires terraform init prior to use) |
| undeploy | Undeploys the lambda function and tears down AWS resources associated with the project |